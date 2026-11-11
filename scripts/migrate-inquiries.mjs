import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { executeLibsql, executeLibsqlBatch, getLibsqlConfiguration } from "../lib/libsql-http.ts";

// Explicit CLI schema operations only; no request handler creates tables.
const root = new URL("../", import.meta.url);
const localEnvironment = fileURLToPath(new URL(".env.local", root));
if (existsSync(localEnvironment)) process.loadEnvFile(localEnvironment);

try {
  const configuration = getLibsqlConfiguration(process.env);
  const journal = JSON.parse(readFileSync(new URL("drizzle/meta/_journal.json", root), "utf8"));
  await executeLibsql(configuration, "CREATE TABLE IF NOT EXISTS __br_migrations (id TEXT PRIMARY KEY NOT NULL, hash TEXT NOT NULL, applied_at INTEGER NOT NULL)", [], false);
  const completed = await executeLibsql(configuration, "SELECT id, hash FROM __br_migrations");
  const applied = new Map(completed.rows.map(([id, hash]) => [id, hash]));
  for (const entry of journal.entries) {
    if (!/^\d{4}_[a-zA-Z0-9_-]+$/.test(entry.tag)) throw new Error("Invalid migration name.");
    const sql = readFileSync(new URL(`drizzle/${entry.tag}.sql`, root), "utf8").replace(/\r\n/g, "\n");
    const hash = createHash("sha256").update(sql).digest("hex");
    if (applied.has(entry.tag)) {
      if (applied.get(entry.tag) !== hash) throw new Error("An applied migration was changed; restore its original SQL.");
      continue;
    }
    const statements = sql.split("--> statement-breakpoint").map(value => value.trim()).filter(Boolean);
    for (const statement of statements) {
      const executable = statement.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--.*$/gm, "").trim();
      if (!/^(CREATE|ALTER|DROP|PRAGMA)\b/i.test(executable)) throw new Error("Migrations must contain schema statements only.");
    }
    await executeLibsqlBatch(configuration, [
      ...statements.map(statement => ({ sql: statement })),
      { sql: "INSERT INTO __br_migrations (id, hash, applied_at) VALUES (?, ?, ?)", params: [entry.tag, hash, Date.now()] },
    ]);
    console.log(`Applied ${entry.tag}.`);
  }
  console.log("Inquiry database schema is up to date.");
} catch (error) {
  console.error(error instanceof Error ? error.message : "Inquiry migration failed.");
  process.exitCode = 1;
}
