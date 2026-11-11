import { get, put } from "@vercel/blob";
import type { InquiryNotificationStatus, InquiryRecord, InquiryStore } from "./inquiry-store.types";

const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT = 5;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type BlobClient = Pick<{ get: typeof get; put: typeof put }, "get" | "put">;

function unavailable(): never {
  throw new Error("Inquiry storage is unavailable.");
}

function inquiryPath(id: string) {
  if (!UUID_PATTERN.test(id)) unavailable();
  return `inquiries/${id}.json`;
}

/** All operations are server-side; private URLs and tokens never leave this store. */
export function createBlobInquiryStore(token: string, client: BlobClient = { get, put }): InquiryStore {
  const privateOptions = { access: "private" as const, token };
  const createOptions = {
    ...privateOptions,
    addRandomSuffix: false,
    allowOverwrite: false,
    contentType: "application/json",
  };

  return {
    async claimRateLimit(key, now) {
      if (!/^[0-9a-f]{64}$/.test(key) || !Number.isSafeInteger(now) || now < 0) unavailable();
      const bucket = Math.floor(now / RATE_WINDOW_MS);
      for (let slot = 1; slot <= RATE_LIMIT; slot++) {
        const pathname = `inquiry-rate-limits/${bucket}/${key}/${slot}.json`;
        try {
          // A server-side conditional create reserves one slot atomically even
          // across concurrent Vercel invocations. Never read before creating.
          await client.put(pathname, JSON.stringify({ window: bucket, slot }), {
            ...createOptions,
            abortSignal: AbortSignal.timeout(10000),
          });
          return { allowed: true };
        } catch {
          // A failed write may mean a conflict OR an outage. Count a slot only
          // after an authenticated, uncached origin read confirms it exists.
          // This also handles an ambiguous write that committed before timeout.
          try {
            const existing = await client.get(pathname, {
              ...privateOptions,
              useCache: false,
              abortSignal: AbortSignal.timeout(10000),
            });
            if (!existing) unavailable();
            await existing.stream?.cancel();
          } catch {
            unavailable();
          }
        }
      }
      return {
        allowed: false,
        retryAfter: Math.max(1, Math.ceil(((bucket + 1) * RATE_WINDOW_MS - now) / 1000)),
      };
    },

    async saveInquiry(record: InquiryRecord) {
      try {
        await client.put(inquiryPath(record.id), JSON.stringify(record), {
          ...createOptions,
          abortSignal: AbortSignal.timeout(10000),
        });
      } catch {
        unavailable();
      }
    },

    async setInquiryNotificationStatus(id: string, status: InquiryNotificationStatus) {
      try {
        const pathname = inquiryPath(id);
        const result = await client.get(pathname, {
          ...privateOptions,
          useCache: false,
          abortSignal: AbortSignal.timeout(10000),
        });
        if (!result || result.statusCode !== 200 || !result.blob.etag) unavailable();
        const record: unknown = await new Response(result.stream).json();
        if (!record || typeof record !== "object" || !("id" in record) || record.id !== id) unavailable();
        await client.put(pathname, JSON.stringify({ ...record, notificationStatus: status }), {
          ...createOptions,
          allowOverwrite: true,
          ifMatch: result.blob.etag,
          abortSignal: AbortSignal.timeout(10000),
        });
      } catch {
        unavailable();
      }
    },
  };
}
