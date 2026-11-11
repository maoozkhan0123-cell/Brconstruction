import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

/** Selected only by the Cloudflare/Vinext build alias. */
export function getDb() {
  if (!env.DB) throw new Error("The inquiry database binding is unavailable.");
  return drizzle(env.DB, { schema });
}
