import test from "node:test";
import assert from "node:assert/strict";

// Negative checks only: this script never creates an inquiry or alters the database.
const origin = new URL(process.env.INQUIRY_TEST_ORIGIN || "http://127.0.0.1:5173").origin;
const endpoint = `${origin}/api/inquiries`;
const valid = () => ({
  fullName: "QA validation only",
  email: "qa@example.com",
  service: "Other",
  location: "QA test location",
  description: "This request must be rejected and never saved.",
  startedAt: Date.now() - 10000,
  consent: true,
  website: "",
});

async function rejected(payload, expectedStatus, headers = {}) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin, ...headers },
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  });
  assert.equal(response.status, expectedStatus);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const result = await response.json();
  assert.equal(result.ok, false);
  assert.equal("id" in result, false);
  return result;
}

test("rejects cross-origin requests", async () => {
  // The framework may reject this before the JSON route handler runs.
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://untrusted.example" },
    body: JSON.stringify(valid()),
  });
  assert.equal(response.status, 403);
  await response.body?.cancel();
});

test("rejects a non-JSON content type", async () => {
  await rejected(valid(), 415, { "Content-Type": "text/plain" });
});

test("rejects malformed JSON", async () => {
  await rejected("{", 400);
});

test("rejects an invalid email and returns its field error", async () => {
  const result = await rejected({ ...valid(), email: "invalid" }, 400);
  assert.ok(result.fields.email);
});

test("rejects a filled spam honeypot", async () => {
  const result = await rejected({ ...valid(), website: "https://spam.example" }, 400);
  assert.ok(result.fields.website);
});

test("rejects implausibly fast submission", async () => {
  await rejected({ ...valid(), startedAt: Date.now() }, 400);
});

test("rejects a request larger than the endpoint body limit", async () => {
  await rejected({ ...valid(), description: "x".repeat(18000) }, 413);
});
