import test from "node:test";
import assert from "node:assert/strict";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { getLibsqlConfiguration, encodeLibsqlValue, executeLibsql, executeLibsqlBatch, createLibsqlCallback } from "../lib/libsql-http.ts";
import { getInquiryEnvironment, getInquiryClientAddress, isInquiryStorageConfigured } from "../lib/inquiry-runtime.ts";
import { inquiryRateLimits } from "../db/schema.ts";

const configuration = getLibsqlConfiguration({ TURSO_DATABASE_URL: "libsql://example.turso.io", TURSO_AUTH_TOKEN: "test-secret" });
const result = (rows = []) => ({ cols: [], rows, affected_row_count: 1 });
const respond = value => Response.json({ results: [{ type: "ok", response: { type: "execute", result: value } }, { type: "ok", response: { type: "close" } }] });

test("normalizes secure database URLs and rejects unsafe or incomplete configuration", () => {
  assert.equal(configuration.endpoint, "https://example.turso.io/v2/pipeline");
  assert.equal(getLibsqlConfiguration({ LIBSQL_DATABASE_URL: "https://example.turso.io", LIBSQL_AUTH_TOKEN: "alias" }).authToken, "alias");
  for (const url of ["http://remote.example", "https://user:password@example.com", "file:db.sqlite", "https://example.com/?token=secret"]) {
    assert.throws(() => getLibsqlConfiguration({ TURSO_DATABASE_URL: url, TURSO_AUTH_TOKEN: "test-secret" }), /could not be completed/);
  }
  assert.throws(() => getLibsqlConfiguration({ TURSO_DATABASE_URL: "https://example.turso.io" }));
});

test("encodes bound scalar and blob parameters without interpolating SQL", async () => {
  const injection = "Robert'); DROP TABLE inquiries;--";
  let body;
  await executeLibsql(configuration, "SELECT ?", [injection], true, async (url, init) => {
    assert.equal(url, configuration.endpoint);
    assert.equal(init.redirect, "error");
    assert.equal(init.headers.Authorization, "Bearer test-secret");
    body = JSON.parse(init.body);
    return respond(result());
  });
  assert.equal(body.requests[0].stmt.sql, "SELECT ?");
  assert.deepEqual(body.requests[0].stmt.args, [{ type: "text", value: injection }]);
  assert.equal(body.requests[1].type, "close");
  assert.deepEqual(encodeLibsqlValue(true), { type: "integer", value: "1" });
  assert.deepEqual(encodeLibsqlValue(null), { type: "null" });
  assert.deepEqual(encodeLibsqlValue(new Uint8Array([1, 2])), { type: "blob", base64: "AQI=" });
  assert.throws(() => encodeLibsqlValue(Number.MAX_SAFE_INTEGER + 1));
  assert.throws(() => encodeLibsqlValue(Infinity));
});

test("decodes typed row matrices without losing large integer precision", async () => {
  const output = await executeLibsql(configuration, "SELECT values", [], true, async () => respond(result([[{ type: "integer", value: "1800000000000" }, { type: "text", value: "name" }, { type: "null" }, { type: "integer", value: "9223372036854775807" }]])));
  assert.deepEqual(output.rows, [[1800000000000, "name", null, 9223372036854775807n]]);
});

test("HTTP and pipeline SQL errors fail without exposing credentials or provider messages", async () => {
  for (const response of [new Response("test-secret: private SQL details", { status: 401 }), Response.json({ results: [{ type: "error", error: { message: "test-secret" } }, { type: "ok" }] })]) {
    await assert.rejects(executeLibsql(configuration, "INSERT", [], false, async () => response), error => {
      assert.equal(error.message, "The inquiry database request could not be completed.");
      return true;
    });
  }
});

test("sqlite-proxy RETURNING rows map to schema fields and get maps a single row", async () => {
  const callback = createLibsqlCallback(configuration, async () => respond(result([[{ type: "text", value: "hash" }, { type: "integer", value: "1800000000000" }, { type: "integer", value: "1" }]])));
  const database = drizzle(callback);
  const [limit] = await database.insert(inquiryRateLimits).values({ key: "hash", windowStartedAt: 1800000000000, count: 1 }).returning();
  assert.deepEqual(limit, { key: "hash", windowStartedAt: 1800000000000, count: 1 });
  assert.deepEqual((await callback("SELECT", [], "get")).rows, ["hash", 1800000000000, 1]);
});

test("atomic batches guard COMMIT and ROLLBACK and reject a failed SQL step", async () => {
  let steps;
  const fetcher = async (url, init) => {
    steps = JSON.parse(init.body).requests[0].batch.steps;
    return Response.json({ results: [{ type: "ok", response: { type: "batch", result: { step_results: [result(), result(), result(), null], step_errors: [null, null, null, null] } } }, { type: "ok", response: { type: "close" } }] });
  };
  assert.equal((await executeLibsqlBatch(configuration, [{ sql: "CREATE TABLE example (id TEXT)" }], fetcher)).length, 1);
  assert.equal(steps[0].stmt.sql, "BEGIN IMMEDIATE");
  assert.deepEqual(steps[3].condition, { type: "not", cond: { type: "ok", step: 2 } });
  await assert.rejects(executeLibsqlBatch(configuration, [{ sql: "CREATE TABLE example (id TEXT)" }], async () => Response.json({ results: [{ type: "ok", response: { type: "batch", result: { step_results: [result(), null, null, result()], step_errors: [null, { message: "private database error" }, null, null] } } }, { type: "ok", response: { type: "close" } }] })));
});

test("Vercel uses validated platform IPs and never groups missing platform identities", () => {
  const previous = process.env.VERCEL;
  process.env.VERCEL = "1";
  try {
    assert.equal(getInquiryClientAddress(new Request("https://example.vercel.app", { headers: { "x-vercel-forwarded-for": "203.0.113.9", "x-forwarded-for": "198.51.100.1" } })), "203.0.113.9");
    assert.throws(() => getInquiryClientAddress(new Request("https://example.vercel.app")), /trusted client address/);
    assert.throws(() => getInquiryClientAddress(new Request("https://example.vercel.app", { headers: { "x-vercel-forwarded-for": "arbitrary-value" } })), /trusted client address/);
  } finally { if (previous === undefined) delete process.env.VERCEL; else process.env.VERCEL = previous; }
});

test("runtime secrets stay server-side and storage accepts private Blob or configured SQL", () => {
  const keys = ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "LIBSQL_DATABASE_URL", "LIBSQL_AUTH_TOKEN", "INQUIRY_RATE_LIMIT_SECRET", "BLOB_READ_WRITE_TOKEN"];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  try {
    for (const key of keys) delete process.env[key];
    assert.equal(isInquiryStorageConfigured(), false);
    process.env.BLOB_READ_WRITE_TOKEN = "blob-private-secret";
    assert.equal(isInquiryStorageConfigured(), true);
    assert.equal(getInquiryEnvironment().INQUIRY_RATE_LIMIT_SECRET, "blob-private-secret");
    delete process.env.BLOB_READ_WRITE_TOKEN;
    process.env.TURSO_DATABASE_URL = "libsql://example.turso.io";
    assert.equal(isInquiryStorageConfigured(), false);
    process.env.TURSO_AUTH_TOKEN = "token";
    process.env.INQUIRY_RATE_LIMIT_SECRET = "private";
    assert.equal(isInquiryStorageConfigured(), true);
    assert.equal(getInquiryEnvironment().INQUIRY_RATE_LIMIT_SECRET, "private");
  } finally { for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; } }
});
