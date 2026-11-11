declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    INQUIRY_RATE_LIMIT_SECRET?: string;
    INQUIRY_NOTIFICATION_WEBHOOK?: string;
    INQUIRY_NOTIFICATION_TOKEN?: string;
  }
}
