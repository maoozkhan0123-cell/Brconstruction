import { env } from "cloudflare:workers";

export function getInquiryEnvironment() {
  return {
    INQUIRY_RATE_LIMIT_SECRET: env.INQUIRY_RATE_LIMIT_SECRET,
    INQUIRY_NOTIFICATION_WEBHOOK: env.INQUIRY_NOTIFICATION_WEBHOOK,
    INQUIRY_NOTIFICATION_TOKEN: env.INQUIRY_NOTIFICATION_TOKEN,
  };
}

export function isInquiryStorageConfigured() { return Boolean(env.DB); }

export function getInquiryClientAddress(request: Request) {
  return request.headers.get("cf-connecting-ip") || "local-preview";
}
