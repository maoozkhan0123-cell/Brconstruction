import { drizzle } from "drizzle-orm/sqlite-proxy";
import { createLibsqlCallback, executeLibsqlBatch, getLibsqlConfiguration } from "../lib/libsql-http";
import * as schema from "./schema";

export function getDb() {
  const configuration = getLibsqlConfiguration(process.env);
  const database = drizzle(
    createLibsqlCallback(configuration),
    async queries => {
      const results = await executeLibsqlBatch(configuration, queries.map(query => ({ sql: query.sql, params: query.params })));
      return results.map((result, index) => ({ rows: queries[index].method === "get" ? result.rows[0] : result.rows }));
    },
    { schema },
  );
  // Stateless HTTP statements cannot share an interactive transaction. Atomic
  // database.batch() is supported; reject transaction() before making writes.
  Object.defineProperty(database, "transaction", {
    value: async () => { throw new Error("Use database.batch() for an atomic HTTP transaction."); },
  });
  return database;
}
