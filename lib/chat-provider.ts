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
};

/** Only the server constructs the system message; provider errors never reach visitors. */
export async function completeChat(messages: ChatMessage[], options: ChatProviderOptions): Promise<string> {
  if (!options.apiKey.trim() || !options.systemPrompt.trim()) throw new ChatProviderError();
  const model = options.model?.trim() || DEFAULT_CHAT_MODEL;
  if (!/^[a-zA-Z0-9._/-]{1,100}$/.test(model)) throw new ChatProviderError();

  try {
    const response = await (options.fetcher || fetch)(CHAT_PROVIDER_URL, {
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
        max_completion_tokens: 800,
        reasoning_effort: "low",
        include_reasoning: false,
        stream: false,
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) {
      await response.body?.cancel();
      const retry = Number(response.headers.get("retry-after"));
      throw new ChatProviderError(response.status === 429 ? 429 : 503,
        response.status === 429 ? (Number.isFinite(retry) && retry > 0 ? Math.min(900, Math.ceil(retry)) : 60) : undefined);
    }
    const body: unknown = await response.json();
    const reply = (body as { choices?: { message?: { content?: unknown } }[] } | null)?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim() || reply.length > 4000) throw new ChatProviderError();
    const sanitized = reply.trim().split(options.apiKey).join("[redacted]")
      .replace(/\bgsk_[a-zA-Z0-9_-]{16,}\b/g, "[redacted]")
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
    if (!sanitized) throw new ChatProviderError();
    return sanitized;
  } catch (error) {
    if (error instanceof ChatProviderError) throw error;
    throw new ChatProviderError();
  }
}
