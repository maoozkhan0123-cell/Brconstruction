import { env } from "cloudflare:workers";

export function getInquiryEnvironment() {
  const notification = env as unknown as Record<string, string | undefined>;
  return {
    INQUIRY_RATE_LIMIT_SECRET: env.INQUIRY_RATE_LIMIT_SECRET,
    INQUIRY_NOTIFICATION_WEBHOOK: env.INQUIRY_NOTIFICATION_WEBHOOK,
    INQUIRY_NOTIFICATION_TOKEN: env.INQUIRY_NOTIFICATION_TOKEN,
    SMTP_HOST: notification.SMTP_HOST,
    SMTP_PORT: notification.SMTP_PORT,
    SMTP_USER: notification.SMTP_USER,
    SMTP_PASSWORD: notification.SMTP_PASSWORD,
    INQUIRY_EMAIL_FROM: notification.INQUIRY_EMAIL_FROM,
    INQUIRY_EMAIL_TO: notification.INQUIRY_EMAIL_TO,
    SMTP_SUPPORTED: false,
  };
}

export function isInquiryStorageConfigured() { return Boolean(env.DB); }

export function getInquiryClientAddress(request: Request) {
  return request.headers.get("cf-connecting-ip") || "local-preview";
}
