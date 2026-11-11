export type InquiryNotificationStatus = "pending" | "delivered" | "not_configured" | "failed";

export interface InquiryRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  service: string;
  location: string;
  budget: string;
  startDate: string;
  description: string;
  consentAt: number;
  createdAt: number;
  notificationStatus: InquiryNotificationStatus;
}

export type InquiryRateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfter: number };

export interface InquiryStore {
  claimRateLimit(key: string, now: number): Promise<InquiryRateLimitResult>;
  saveInquiry(record: InquiryRecord): Promise<void>;
  setInquiryNotificationStatus(id: string, status: InquiryNotificationStatus): Promise<void>;
}
