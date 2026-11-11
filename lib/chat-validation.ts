import { z } from "zod";

export const CHAT_MAX_BODY_BYTES = 16 * 1024;
export const CHAT_MAX_MESSAGES = 10;
export const CHAT_MAX_MESSAGE_LENGTH = 1200;
export const CHAT_MAX_TOTAL_LENGTH = 8000;

const safeContent = z.string().trim().min(1)
  .refine(value => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value));
const message = z.discriminatedUnion("role", [
  z.object({ role: z.literal("user"), content: safeContent.refine(value => value.length <= CHAT_MAX_MESSAGE_LENGTH) }).strict(),
  z.object({ role: z.literal("assistant"), content: safeContent.refine(value => value.length <= 4000) }).strict(),
]);
const chatSchema = z.object({
  messages: z.array(message).min(1).max(CHAT_MAX_MESSAGES),
}).strict().superRefine(({ messages }, context) => {
  if (messages[0]?.role !== "user") {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "The conversation must begin with a visitor message." });
  }
  if (messages[messages.length - 1]?.role !== "user") {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "A visitor message is required." });
  }
  if (messages.reduce((sum, message) => sum + message.content.length, 0) > CHAT_MAX_TOTAL_LENGTH) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "The conversation is too long." });
  }
  if (messages.some((message, index) => index > 0 && message.role === messages[index - 1].role)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Conversation roles must alternate." });
  }
});

export type ChatMessage = z.infer<typeof chatSchema>["messages"][number];
export type ChatLanguage = "english" | "roman-urdu" | "urdu";

/** Return only a server-owned language identifier, never user text for the prompt. */
export function inferChatLanguage(content: string): ChatLanguage {
  const text = content.toLowerCase();
  if (/\b(?:roman[\s-]*urdu|urdu[\s-]*roman)\b|رومن\s*اردو/.test(text)) return "roman-urdu";
  if (/\b(?:in\s+english|english\s+(?:please|mein|me|mai|main|men))\b|\b(?:reply|respond|answer|write|speak|explain)\s+(?:to\s+me\s+)?(?:in\s+)?english\b|انگریزی\s*میں/.test(text)) return "english";
  if (/\burdu\s+(?:script|mein|me|mai|main|men)\b|\bin\s+urdu\b|\b(?:reply|respond|answer|write|speak|explain)\s+(?:to\s+me\s+)?(?:in\s+)?urdu\b/.test(text)) return "urdu";
  if (/[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]/.test(text)) return "urdu";
  if (/\b(?:aap|apko|aapko|ka|ki|ke|ko|kya|kia|kahan|kahaan|hai|hain|bata|batao|batain|bataye|batayein|mujhe|mujhay|krdo|kardo|krna|karna|chahiye|chahta|chahti|aik|kitna|kitni|kitne|yeh|ye|mera|meri|hum|hamara|mein|mai|bhai|shukriya)\b/.test(text)) return "roman-urdu";
  return "english";
}

export function validateChatRequest(value: unknown) {
  return chatSchema.safeParse(value);
}

export async function readChatRequest(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > CHAT_MAX_BODY_BYTES) {
    throw new RangeError("Chat request is too large.");
  }
  if (!request.body) throw new SyntaxError("A message is required.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      size += result.value.byteLength;
      if (size > CHAT_MAX_BODY_BYTES) {
        await reader.cancel();
        throw new RangeError("Chat request is too large.");
      }
      chunks.push(result.value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}
