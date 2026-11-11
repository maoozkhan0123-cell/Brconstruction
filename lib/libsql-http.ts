import { Buffer } from "node:buffer";

type Environment = Record<string, string | undefined>;
type QueryMethod = "run" | "all" | "values" | "get";
type Fetch = typeof globalThis.fetch;
type Row = unknown[];
type EncodedValue = { type: "null" } | { type: "integer"; value: string } | { type: "float"; value: number } | { type: "text"; value: string } | { type: "blob"; base64: string };
export type LibsqlConfiguration = { endpoint: string; authToken: string };
export type LibsqlStatement = { sql: string; params?: unknown[] };
export type LibsqlResult = { rows: Row[]; affectedRowCount: number };

const failure = () => new Error("The inquiry database request could not be completed.");

export function getLibsqlConfiguration(environment: Environment): LibsqlConfiguration {
  const value = environment.TURSO_DATABASE_URL || environment.LIBSQL_DATABASE_URL;
  const authToken = (environment.TURSO_AUTH_TOKEN || environment.LIBSQL_AUTH_TOKEN)?.trim();
  if (!value?.trim() || !authToken || /[\r\n]/.test(authToken)) throw failure();
  let url: URL;
  try { url = new URL(value.trim().replace(/^(libsql|turso):\/\//i, "https://")); }
  catch { throw failure(); }
  const localHttp = url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) && environment.NODE_ENV !== "production";
  if ((url.protocol !== "https:" && !localHttp) || url.username || url.password || url.search || url.hash) throw failure();
  if (!url.pathname.endsWith("/v2/pipeline")) url.pathname = `${url.pathname.replace(/\/$/, "")}/v2/pipeline`;
  return { endpoint: url.toString(), authToken };
}

export function encodeLibsqlValue(value: unknown): EncodedValue {
  if (value === null || value === undefined) return { type: "null" };
  if (typeof value === "string") return { type: "text", value };
  if (typeof value === "boolean") return { type: "integer", value: value ? "1" : "0" };
  if (typeof value === "bigint") {
    if (value < -(BigInt(1) << BigInt(63)) || value > (BigInt(1) << BigInt(63)) - BigInt(1)) throw failure();
    return { type: "integer", value: value.toString() };
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value) || Number.isInteger(value) && !Number.isSafeInteger(value)) throw failure();
    return Number.isInteger(value) ? { type: "integer", value: String(value) } : { type: "float", value };
  }
  if (value instanceof ArrayBuffer) return { type: "blob", base64: Buffer.from(value).toString("base64") };
  if (ArrayBuffer.isView(value)) return { type: "blob", base64: Buffer.from(value.buffer, value.byteOffset, value.byteLength).toString("base64") };
  throw failure();
}

function decodeValue(value: unknown): unknown {
  if (!value || typeof value !== "object" || !("type" in value)) throw failure();
  const cell = value as Record<string, unknown>;
  switch (cell.type) {
    case "null": return null;
    case "text": if (typeof cell.value === "string") return cell.value; break;
    case "integer": {
      if (typeof cell.value !== "string" || !/^-?\d+$/.test(cell.value)) break;
      const integer = BigInt(cell.value);
      return integer >= BigInt(Number.MIN_SAFE_INTEGER) && integer <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(integer) : integer;
    }
    case "float": if (typeof cell.value === "number" && Number.isFinite(cell.value)) return cell.value; break;
    case "blob": if (typeof cell.base64 === "string") return new Uint8Array(Buffer.from(cell.base64, "base64")); break;
  }
  throw failure();
}

function decodeResult(value: unknown): LibsqlResult {
  if (!value || typeof value !== "object") throw failure();
  const result = value as Record<string, unknown>;
  if (!Array.isArray(result.rows)) throw failure();
  const rows = result.rows.map(row => {
    if (!Array.isArray(row)) throw failure();
    return row.map(decodeValue);
  });
  return { rows, affectedRowCount: typeof result.affected_row_count === "number" ? result.affected_row_count : 0 };
}

async function pipeline(configuration: LibsqlConfiguration, requests: unknown[], fetcher: Fetch) {
  try {
    const response = await fetcher(configuration.endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${configuration.authToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: [...requests, { type: "close" }] }),
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) { await response.body?.cancel(); throw failure(); }
    const body = await response.json() as { results?: Array<{ type?: string; response?: Record<string, unknown> }> };
    if (!Array.isArray(body.results) || body.results.length !== requests.length + 1 || body.results.some(result => result.type !== "ok")) throw failure();
    return body.results;
  } catch { throw failure(); }
}

/** Protocol: https://docs.turso.tech/sdk/http/reference */
export async function executeLibsql(configuration: LibsqlConfiguration, sql: string, params: unknown[] = [], wantRows = true, fetcher: Fetch = globalThis.fetch): Promise<LibsqlResult> {
  const results = await pipeline(configuration, [{ type: "execute", stmt: { sql, args: params.map(encodeLibsqlValue), want_rows: wantRows } }], fetcher);
  if (results[0].response?.type !== "execute") throw failure();
  return decodeResult(results[0].response.result);
}

/** A failed/skipped statement guards rollback rather than committing partial DDL. */
export async function executeLibsqlBatch(configuration: LibsqlConfiguration, statements: LibsqlStatement[], fetcher: Fetch = globalThis.fetch): Promise<LibsqlResult[]> {
  if (!statements.length) return [];
  const steps: unknown[] = [{ stmt: { sql: "BEGIN IMMEDIATE", want_rows: false } }];
  for (const statement of statements) {
    steps.push({ condition: { type: "ok", step: steps.length - 1 }, stmt: { sql: statement.sql, args: (statement.params || []).map(encodeLibsqlValue), want_rows: true } });
  }
  const commitIndex = steps.length;
  steps.push({ condition: { type: "ok", step: commitIndex - 1 }, stmt: { sql: "COMMIT", want_rows: false } });
  steps.push({ condition: { type: "not", cond: { type: "ok", step: commitIndex } }, stmt: { sql: "ROLLBACK", want_rows: false } });
  const results = await pipeline(configuration, [{ type: "batch", batch: { steps } }], fetcher);
  const response = results[0].response;
  if (response?.type !== "batch" || !response.result || typeof response.result !== "object") throw failure();
  const batch = response.result as { step_results?: unknown[]; step_errors?: unknown[] };
  if (!Array.isArray(batch.step_results) || !Array.isArray(batch.step_errors) || batch.step_results.length !== steps.length || batch.step_errors.length !== steps.length || batch.step_errors.some(Boolean) || !batch.step_results[commitIndex]) throw failure();
  return batch.step_results.slice(1, commitIndex).map(decodeResult);
}

export function createLibsqlCallback(configuration: LibsqlConfiguration, fetcher: Fetch = globalThis.fetch) {
  return async (sql: string, params: unknown[], method: QueryMethod) => {
    const result = await executeLibsql(configuration, sql, params, method !== "run", fetcher);
    // sqlite-proxy get() maps one row; all()/values()/RETURNING map a row matrix.
    return { rows: method === "get" ? result.rows[0] : result.rows };
  };
}
