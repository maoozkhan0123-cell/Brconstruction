import { isIP } from "node:net";

export function getInquiryEnvironment() {
  return {
    INQUIRY_RATE_LIMIT_SECRET: process.env.INQUIRY_RATE_LIMIT_SECRET || process.env.BLOB_READ_WRITE_TOKEN || process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN,
    INQUIRY_NOTIFICATION_WEBHOOK: process.env.INQUIRY_NOTIFICATION_WEBHOOK,
    INQUIRY_NOTIFICATION_TOKEN: process.env.INQUIRY_NOTIFICATION_TOKEN,
  };
}

export function isInquiryStorageConfigured() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
    ((process.env.TURSO_DATABASE_URL || process.env.LIBSQL_DATABASE_URL)?.trim() &&
    (process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN)?.trim()),
  );
}

export function getInquiryClientAddress(request: Request) {
  if (process.env.VERCEL === "1") {
    // Vercel overwrites these edge headers. Other forwarding headers are never
    // trusted on an unrecognized runtime. See vercel.com/docs/headers/request-headers.
    const value = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for");
    const address = value?.split(",")[0].trim();
    if (address && isIP(address)) return address;
    throw new Error("The trusted client address is unavailable.");
  }
  if (["localhost", "127.0.0.1", "[::1]"].includes(new URL(request.url).hostname)) return "local-preview";
  throw new Error("No trusted client-address adapter is configured.");
}
