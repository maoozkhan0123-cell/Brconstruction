import type { ChatMessage } from "./chat-validation";

export const DEFAULT_CHAT_MODEL = "openai/gpt-oss-20b";
export const CHAT_PROVIDER_URL = "https://api.groq.com/openai/v1/chat/completions";

export class ChatProviderError extends Error {
  readonly status: 429 | 503;
  readonly retryAfter?: number;

  constructor(status: 429 | 503 = 503, retryAfter?: number) {
    super("The assistant is temporarily unavailable.");
    this.name = "ChatProviderError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

type ChatProviderOptions = {
  apiKey: string;
  systemPrompt: string;
  model?: string;
  fetcher?: typeof fetch;
  waiter?: (milliseconds: number) => Promise<void>;
};

/** Only the server constructs the system message; provider errors never reach visitors. */
export async function completeChat(messages: ChatMessage[], options: ChatProviderOptions): Promise<string> {
  if (!options.apiKey.trim() || !options.systemPrompt.trim()) throw new ChatProviderError();
  const model = options.model?.trim() || DEFAULT_CHAT_MODEL;
  if (!/^[a-zA-Z0-9._/-]{1,100}$/.test(model)) throw new ChatProviderError();

  try {
    // Both attempts share a deadline, leaving room for storage protection
    // within the widget's 50-second request timeout.
    const deadline = AbortSignal.timeout(30000);
    const startedAt = Date.now();
    let maxCompletionTokens = 800;
    for (let attempt = 0; attempt < 2; attempt++) {
      let response: Response;
      try {
        response = await (options.fetcher || fetch)(CHAT_PROVIDER_URL, {
          method: "POST",
          redirect: "error",
          headers: {
            "Authorization": `Bearer ${options.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "system", content: options.systemPrompt }, ...messages],
            temperature: 0.25,
            max_completion_tokens: maxCompletionTokens,
            reasoning_effort: "low",
            include_reasoning: false,
            stream: false,
          }),
          signal: AbortSignal.any([deadline, AbortSignal.timeout(15000)]),
        });
      } catch {
        if (attempt === 0 && !deadline.aborted) continue;
        throw new ChatProviderError();
      }
      if (!response.ok) {
        await response.body?.cancel();
        if (attempt === 0 && [408, 500, 502, 503, 504].includes(response.status) && !deadline.aborted) continue;
        const retry = Number(response.headers.get("retry-after"));
        // Respect a short provider cooldown instead of immediately failing a
        // conversation. Longer limits return the existing visitor countdown.
        if (response.status === 429 && attempt === 0 && Number.isFinite(retry) && retry > 0 && retry <= 15 &&
          Math.ceil(retry) * 1000 + 1000 < 30000 - (Date.now() - startedAt)) {
          await (options.waiter || (milliseconds => new Promise<void>(resolve => setTimeout(resolve, milliseconds))))(Math.ceil(retry) * 1000);
          continue;
        }
        throw new ChatProviderError(response.status === 429 ? 429 : 503,
          response.status === 429 ? (Number.isFinite(retry) && retry > 0 ? Math.min(900, Math.ceil(retry)) : 60) : undefined);
      }
      const body: unknown = await response.json();
      const choice = (body as { choices?: { finish_reason?: string; message?: { content?: unknown } }[] } | null)?.choices?.[0];
      const reply = choice?.message?.content;
      // Reasoning tokens share the completion budget. Retry a truncated, empty
      // answer once with enough room for visible text; never expose reasoning.
      if (attempt === 0 && choice?.finish_reason === "length" && (reply == null || (typeof reply === "string" && !reply.trim())) && !deadline.aborted) {
        maxCompletionTokens = 1600;
        continue;
      }
      if (typeof reply !== "string" || !reply.trim() || reply.length > 4000) throw new ChatProviderError();
      const sanitized = reply.trim().split(options.apiKey).join("[redacted]")
        .replace(/\bgsk_[a-zA-Z0-9_-]{16,}\b/g, "[redacted]")
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
      if (!sanitized) throw new ChatProviderError();
      return sanitized;
    }
    throw new ChatProviderError();
  } catch (error) {
    if (error instanceof ChatProviderError) throw error;
    throw new ChatProviderError();
  }
}
