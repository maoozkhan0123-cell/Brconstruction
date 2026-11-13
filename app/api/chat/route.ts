import { validateChatRequest, readChatRequest, inferChatLanguage } from "@/lib/chat-validation";
import { completeChat, ChatProviderError } from "@/lib/chat-provider";
import { getChatSystemPrompt } from "@/lib/chat-knowledge";
import { getChatRateKey, claimBlobChatRateLimit, claimLocalChatRateLimit } from "@/lib/chat-rate-limit";
import { getInquiryClientAddress } from "@/lib/inquiry-runtime";
import { isAllowedRequestOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";
export const maxDuration = 60;

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
function respond(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { ...headers, ...extraHeaders } });
}

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  if (!isAllowedRequestOrigin(request)) {
    return respond({ ok: false, error: "Please open the assistant from this website." }, 403);
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return respond({ ok: false, error: "Please send a message using the chat." }, 415);
  }
  let raw: unknown;
  try {
    raw = await readChatRequest(request);
  } catch (error) {
    return respond({ ok: false, error: error instanceof RangeError ? "Please send a shorter message." : "We could not read your message. Please try again." }, error instanceof RangeError ? 413 : 400);
  }
  const result = validateChatRequest(raw);
  if (!result.success) {
    return respond({ ok: false, error: "Please send a message of up to 1,200 characters. Clear the chat if the conversation is too long." }, 400);
  }
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return respond({ ok: false, error: "The assistant is temporarily unavailable. Please contact our team using the contact page." }, 503);
  }
  try {
    const secret = process.env.CHAT_RATE_LIMIT_SECRET || process.env.INQUIRY_RATE_LIMIT_SECRET || process.env.BLOB_READ_WRITE_TOKEN || apiKey;
    const key = getChatRateKey(getInquiryClientAddress(request), origin, secret);
    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
    const isLocal = process.env.VERCEL !== "1" && ["localhost", "127.0.0.1", "[::1]"].includes(new URL(request.url).hostname);
    const limit = isLocal
      ? claimLocalChatRateLimit(key, Date.now())
      : token ? await claimBlobChatRateLimit(key, Date.now(), token) : (() => { throw new Error("Chat protection is unavailable."); })();
    if (!limit.allowed) {
      return respond({ ok: false, error: "You have reached the chat message limit. Please try again in a few minutes or contact our team." }, 429, { "Retry-After": String(limit.retryAfter) });
    }
  } catch {
    return respond({ ok: false, error: "The assistant is temporarily unavailable. Please try again or contact our team." }, 503);
  }
  try {
    const reply = await completeChat(result.data.messages, {
      apiKey,
      model: process.env.GROQ_CHAT_MODEL,
      systemPrompt: getChatSystemPrompt(inferChatLanguage(result.data.messages[result.data.messages.length - 1].content)),
    });
    return respond({ ok: true, reply });
  } catch (error) {
    if (error instanceof ChatProviderError && error.status === 429) {
      return respond({ ok: false, error: "The assistant is busy. Please try again shortly or contact our team." }, 429, { "Retry-After": String(error.retryAfter || 60) });
    }
    return respond({ ok: false, error: "The assistant could not reply just now. Please try again or contact our team." }, 503);
  }
}
