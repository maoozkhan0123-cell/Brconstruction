import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { inquiries, inquiryRateLimits } from "@/db/schema";
import type { InquiryNotificationStatus, InquiryRateLimitResult, InquiryRecord } from "./inquiry-store.types";

const RATE_WINDOW_MS = 15 * 60 * 1000;

export async function claimRateLimit(key: string, now: number): Promise<InquiryRateLimitResult> {
  const [limit] = await getDb()
    .insert(inquiryRateLimits)
    .values({ key, windowStartedAt: now, count: 1 })
    .onConflictDoUpdate({
      target: inquiryRateLimits.key,
      set: {
        count: sql`CASE WHEN ${inquiryRateLimits.windowStartedAt} <= ${now - RATE_WINDOW_MS} THEN 1 ELSE ${inquiryRateLimits.count} + 1 END`,
        windowStartedAt: sql`CASE WHEN ${inquiryRateLimits.windowStartedAt} <= ${now - RATE_WINDOW_MS} THEN ${now} ELSE ${inquiryRateLimits.windowStartedAt} END`,
      },
    })
    .returning();
  if (!limit) throw new Error("Inquiry storage is unavailable.");
  return limit.count <= 5
    ? { allowed: true }
    : { allowed: false, retryAfter: Math.max(1, Math.ceil((limit.windowStartedAt + RATE_WINDOW_MS - now) / 1000)) };
}

export async function saveInquiry(record: InquiryRecord): Promise<void> {
  await getDb().insert(inquiries).values(record);
}

export async function setInquiryNotificationStatus(id: string, status: InquiryNotificationStatus): Promise<void> {
  await getDb().update(inquiries).set({ notificationStatus: status }).where(eq(inquiries.id, id));
}
