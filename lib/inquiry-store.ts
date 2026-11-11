import { createBlobInquiryStore } from "./inquiry-store.blob";
import * as sqlStore from "./inquiry-store.sql";
import type { InquiryNotificationStatus, InquiryRecord } from "./inquiry-store.types";

function getStore() {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  return token ? createBlobInquiryStore(token) : sqlStore;
}

export function claimRateLimit(key: string, now: number) {
  return getStore().claimRateLimit(key, now);
}

export function saveInquiry(record: InquiryRecord) {
  return getStore().saveInquiry(record);
}

export function setInquiryNotificationStatus(id: string, status: InquiryNotificationStatus) {
  return getStore().setInquiryNotificationStatus(id, status);
}
