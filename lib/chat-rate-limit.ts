import { createHmac } from "node:crypto";
import { get, put } from "@vercel/blob";

export const CHAT_RATE_WINDOW_MS = 15 * 60 * 1000;
export const CHAT_RATE_LIMIT = 15;
const MAX_LOCAL_KEYS = 1000;
const localCounters = new Map<string, { window: number; count: number }>();
type BlobClient = Pick<{ get: typeof get; put: typeof put }, "get" | "put">;
type RateResult = { allowed: true } | { allowed: false; retryAfter: number };

function unavailable(): never {
  throw new Error("Chat protection is unavailable.");
}

export function getChatRateKey(address: string, origin: string, secret: string): string {
  if (!address || !origin || !secret.trim()) unavailable();
  return createHmac("sha256", secret).update(`br-chat:${origin}:${address}`).digest("hex");
}

function denied(now: number, window: number): RateResult {
  return { allowed: false, retryAfter: Math.max(1, Math.ceil(((window + 1) * CHAT_RATE_WINDOW_MS - now) / 1000)) };
}

/** Bounded fallback is exclusively for explicitly identified localhost development. */
export function claimLocalChatRateLimit(key: string, now: number): RateResult {
  if (!/^[a-f0-9]{64}$/.test(key) || !Number.isSafeInteger(now) || now < 0) unavailable();
  const window = Math.floor(now / CHAT_RATE_WINDOW_MS);
  for (const [existingKey, value] of localCounters) {
    if (value.window !== window) localCounters.delete(existingKey);
  }
  const previous = localCounters.get(key);
  if (previous && previous.count >= CHAT_RATE_LIMIT) return denied(now, window);
  if (!previous && localCounters.size >= MAX_LOCAL_KEYS) unavailable();
  localCounters.set(key, { window, count: (previous?.count || 0) + 1 });
  return { allowed: true };
}

/** Private ETag conditional writes enforce the cap across concurrent serverless instances. */
export async function claimBlobChatRateLimit(key: string, now: number, token: string, client: BlobClient = { get, put }): Promise<RateResult> {
  if (!/^[a-f0-9]{64}$/.test(key) || !Number.isSafeInteger(now) || now < 0 || !token.trim()) unavailable();
  const window = Math.floor(now / CHAT_RATE_WINDOW_MS);
  const pathname = `chat-rate-limits/${window}/${key}.json`;
  const privateOptions = { access: "private" as const, token };
  // One deadline for all storage attempts leaves time for the 20-second
  // provider call within the browser's 35-second request timeout.
  const abortSignal = AbortSignal.timeout(10000);

  for (let attempt = 0; attempt < 3; attempt++) {
    let count = 0;
    let etag: string | undefined;
    try {
      const previous = await client.get(pathname, {
        ...privateOptions, useCache: false, abortSignal,
      });
      if (previous) {
        if (previous.statusCode !== 200 || !previous.blob.etag) {
          await previous.stream?.cancel();
          unavailable();
        }
        const value: unknown = await new Response(previous.stream).json();
        if (!value || typeof value !== "object" || !("window" in value) || value.window !== window || !("count" in value) || !Number.isInteger(value.count) || Number(value.count) < 1 || Number(value.count) > CHAT_RATE_LIMIT) unavailable();
        count = Number(value.count);
        etag = previous.blob.etag;
      }
    } catch {
      unavailable();
    }
    if (count >= CHAT_RATE_LIMIT) return denied(now, window);
    try {
      await client.put(pathname, JSON.stringify({ window, count: count + 1 }), {
        ...privateOptions,
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: Boolean(etag),
        ...(etag ? { ifMatch: etag } : {}),
        abortSignal,
      });
      return { allowed: true };
    } catch {
      // Re-read at the origin on a race or ambiguous write. Never assume a
      // failed write reserved a slot, and never proceed without confirmation.
    }
  }
  unavailable();
}
