import { env } from "cloudflare:workers";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { inquiries, inquiryRateLimits } from "@/db/schema";
import { validateInquiry } from "@/lib/validations";

const MAX_BODY_BYTES = 16 * 1024;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RESPONSE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

function respond(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return Response.json(body, {
    status,
    headers: { ...RESPONSE_HEADERS, ...headers },
  });
}

async function readBody(request: Request) {
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES)
    throw new RangeError("Too large");
  if (!request.body) throw new SyntaxError("Missing body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new RangeError("Too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}

async function rateLimitKey(request: Request) {
  // Cloudflare supplies this header at the edge. Never trust client-provided X-Forwarded-For.
  const source = `${new URL(request.url).origin}:${request.headers.get("cf-connecting-ip") ?? "local-preview"}`;
  const encoder = new TextEncoder();
  const secret = env.INQUIRY_RATE_LIMIT_SECRET;
  const digest = secret
    ? await crypto.subtle.sign(
        "HMAC",
        await crypto.subtle.importKey(
          "raw",
          encoder.encode(secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"],
        ),
        encoder.encode(source),
      )
    : await crypto.subtle.digest("SHA-256", encoder.encode(source));
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (
    !origin ||
    origin !== new URL(request.url).origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  ) {
    return respond(
      { ok: false, error: "Please send your inquiry from this website." },
      403,
    );
  }
  if (
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  ) {
    return respond(
      { ok: false, error: "Please submit the project inquiry form." },
      415,
    );
  }

  let body: unknown;
  try {
    body = await readBody(request);
  } catch (error) {
    return respond(
      {
        ok: false,
        error:
          error instanceof RangeError
            ? "Your inquiry is too large. Please shorten the description."
            : "We could not read your inquiry. Please try again.",
      },
      error instanceof RangeError ? 413 : 400,
    );
  }
  const now = Date.now();
  const result = validateInquiry(body, now);
  if (!result.success)
    return respond(
      { ok: false, error: result.error, fields: result.fields },
      400,
    );
  if (!env.DB)
    return respond(
      {
        ok: false,
        error:
          "Project inquiries are temporarily unavailable. Your inquiry has not been submitted. Please try again later.",
      },
      503,
    );

  const db = getDb();
  const id = crypto.randomUUID();
  const {
    website: _website,
    startedAt: _startedAt,
    consent: _consent,
    ...details
  } = result.data;
  try {
    const key = await rateLimitKey(request);
    const [limit] = await db
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
    if (limit.count > 5) {
      const retryAfter = Math.max(
        1,
        Math.ceil((limit.windowStartedAt + RATE_WINDOW_MS - now) / 1000),
      );
      return respond(
        {
          ok: false,
          error:
            "We have received several inquiries from this connection. Please try again in 15 minutes.",
        },
        429,
        { "Retry-After": String(retryAfter) },
      );
    }
    await db
      .insert(inquiries)
      .values({
        id,
        ...details,
        createdAt: now,
        consentAt: now,
        notificationStatus: env.INQUIRY_NOTIFICATION_WEBHOOK
          ? "pending"
          : "not_configured",
      });
  } catch {
    console.error("Inquiry persistence failed; no confirmation was sent.");
    return respond(
      {
        ok: false,
        error:
          "We could not save your inquiry. Please try again. No submission has been confirmed.",
      },
      503,
    );
  }

  // An inquiry is accepted only after D1 confirms it. Optional CRM/email webhooks never change that fact.
  let notification: "delivered" | "not_configured" | "failed" =
    "not_configured";
  if (env.INQUIRY_NOTIFICATION_WEBHOOK) {
    notification = "failed";
    try {
      const webhookUrl = new URL(env.INQUIRY_NOTIFICATION_WEBHOOK);
      if (webhookUrl.protocol !== "https:")
        throw new Error("Webhook requires HTTPS");
      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        redirect: "error",
        headers: {
          "Content-Type": "application/json",
          ...(env.INQUIRY_NOTIFICATION_TOKEN
            ? { Authorization: `Bearer ${env.INQUIRY_NOTIFICATION_TOKEN}` }
            : {}),
        },
        body: JSON.stringify({
          event: "inquiry.created",
          id,
          createdAt: new Date(now).toISOString(),
          ...details,
        }),
        signal: AbortSignal.timeout(5000),
      });
      notification = webhookResponse.ok ? "delivered" : "failed";
      await webhookResponse.body?.cancel();
    } catch {
      console.error(
        "Inquiry saved, but the notification webhook did not accept it.",
      );
    }
    try {
      await db
        .update(inquiries)
        .set({ notificationStatus: notification })
        .where(eq(inquiries.id, id));
    } catch {
      console.error("Inquiry notification status could not be updated.");
    }
  }
  return respond(
    {
      ok: true,
      id,
      message: "Your project inquiry has been securely received.",
      notification,
    },
    201,
  );
}
