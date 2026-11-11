"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ClipboardList, Minus, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { company, whatsappUrl } from "@/data/company";
import ChatQuoteForm, { type QuoteDetails } from "@/components/ChatQuoteForm";

type ChatMessage = { role: "user" | "assistant"; content: string };
type ChatFailure = { message: string; retryAt: number };

const STARTERS = [
  "What services do you offer?",
  "How do I start a project?",
  "Where is your office?",
];
const MAX_MESSAGE_LENGTH = 1200;
const EMPTY_QUOTE_DETAILS: QuoteDetails = { service: "", location: "", budget: "", description: "" };

function BotImage() {
  return (
    <picture className="br-chat-mascot" aria-hidden="true">
      <source media="(prefers-reduced-motion: reduce)" srcSet="/images/br-chatbot-still.webp" />
      <img src="/images/br-chatbot.webp" alt="" width={160} height={159} decoding="async" draggable={false} />
    </picture>
  );
}

function requestHistory(messages: ChatMessage[]) {
  const history = messages.slice(-10);
  let characters = history.reduce((total, message) => total + message.content.length, 0);
  while (history.length > 1 && (
    characters > 8000 ||
    history[0].role !== "user" ||
    new TextEncoder().encode(JSON.stringify({ messages: history })).byteLength > 16 * 1024
  )) {
    characters -= history.shift()!.content.length;
  }
  return history;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails>(EMPTY_QUOTE_DETAILS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<ChatFailure | null>(null);
  const [retrySeconds, setRetrySeconds] = useState(0);
  const trigger = useRef<HTMLButtonElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const request = useRef<AbortController | null>(null);
  const requestNumber = useRef(0);
  const pending = useRef(false);

  function close() {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }

  useEffect(() => {
    if (!open) return;
    if (!quoteOpen) composer.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, quoteOpen]);

  useEffect(() => {
    if (open && !quoteOpen && transcript.current) {
      transcript.current.scrollTop = transcript.current.scrollHeight;
    }
  }, [messages, busy, failure, open, quoteOpen]);

  useEffect(() => {
    if (quoteOpen && transcript.current) transcript.current.scrollTop = 0;
  }, [quoteOpen]);

  useEffect(() => {
    if (!failure?.retryAt) {
      setRetrySeconds(0);
      return;
    }
    const update = () => setRetrySeconds(Math.max(0, Math.ceil((failure.retryAt - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [failure]);

  useEffect(() => () => request.current?.abort(), []);

  async function getReply(history: ChatMessage[]) {
    if (pending.current || (failure?.retryAt ?? 0) > Date.now()) return;
    pending.current = true;
    setBusy(true);
    setFailure(null);
    const currentRequest = ++requestNumber.current;
    const controller = new AbortController();
    request.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 50000);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: requestHistory(history) }),
        signal: controller.signal,
      });
      const data: unknown = await response.json().catch(() => null);
      if (currentRequest !== requestNumber.current) return;
      if (!response.ok || !data || typeof data !== "object" || !("ok" in data) || data.ok !== true) {
        const serverMessage = data && typeof data === "object" && "error" in data && typeof data.error === "string"
          ? data.error.slice(0, 400)
          : "The assistant could not reply just now. Please try again or contact our team.";
        const retryAfter = response.status === 429 ? Number(response.headers.get("Retry-After")) : 0;
        setFailure({
          message: serverMessage,
          retryAt: response.status === 429 ? Date.now() + Math.min(900, Math.max(1, Number.isFinite(retryAfter) ? retryAfter || 30 : 30)) * 1000 : 0,
        });
        return;
      }
      if (!("reply" in data) || typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("Empty assistant reply");
      }
      setMessages([...history, { role: "assistant", content: data.reply.trim() }]);
    } catch {
      if (currentRequest === requestNumber.current) {
        setFailure({
          message: "We couldn’t reach the assistant. Please retry, or speak directly with our team.",
          retryAt: 0,
        });
      }
    } finally {
      window.clearTimeout(timeout);
      if (currentRequest === requestNumber.current) {
        pending.current = false;
        setBusy(false);
        request.current = null;
      }
    }
  }

  function send(content = draft) {
    const text = content.trim();
    if (!text || text.length > MAX_MESSAGE_LENGTH || pending.current || retrySeconds > 0) return;
    // After an error, keep the failed question available for an explicit retry.
    // A newly written question replaces that unsent turn in the API history.
    const previous = messages.at(-1)?.role === "user" ? messages.slice(0, -1) : messages;
    const history: ChatMessage[] = [...previous, { role: "user", content: text }];
    setMessages(history);
    setDraft("");
    void getReply(history);
  }

  function clearChat() {
    requestNumber.current++;
    request.current?.abort();
    request.current = null;
    pending.current = false;
    setMessages([]);
    setDraft("");
    setBusy(false);
    setFailure(null);
    setRetrySeconds(0);
    setQuoteOpen(false);
    setQuoteDetails(EMPTY_QUOTE_DETAILS);
    composer.current?.focus();
  }

  return (
    <aside className="br-chat" aria-label="BR Construction chat">
      {open && (
        <div className="br-chat-panel" id="br-chat-panel" role="dialog" aria-modal="false" aria-label="BR Construction assistant">
          <header className="br-chat-header">
            <div className="br-chat-avatar" aria-hidden="true"><BotImage /><span /></div>
            <div className="br-chat-heading">
              <p>BR Construction</p>
              <span><Sparkles size={11} aria-hidden="true" /> Your project assistant</span>
            </div>
            <button className="br-chat-icon-button" type="button" aria-label="Start a new chat" title="Start a new chat" onClick={clearChat}>
              <RotateCcw size={16} aria-hidden="true" />
            </button>
            <button className="br-chat-icon-button" type="button" aria-label="Minimize chat" title="Minimize chat" onClick={close}>
              <Minus size={18} aria-hidden="true" />
            </button>
          </header>

          <div className="br-chat-transcript" ref={transcript} role={quoteOpen ? undefined : "log"} aria-label={quoteOpen ? "Project details" : "Conversation"} aria-live={quoteOpen ? undefined : "polite"} aria-relevant={quoteOpen ? undefined : "additions text"}>
            {quoteOpen ? (
              <ChatQuoteForm
                details={quoteDetails}
                onDetailsChange={(field, value) => setQuoteDetails(previous => ({ ...previous, [field]: value }))}
                visitorMessages={messages.filter(message => message.role === "user").map(message => message.content)}
                onBack={() => setQuoteOpen(false)}
              />
            ) : (
              <>
            <div className="br-chat-intro">
              <span className="br-chat-eyebrow">FROM VISION TO REALITY</span>
              <h2>Let’s build<br /><em>something exceptional.</em></h2>
              <p>Welcome to BR Construction. Ask me about our services, your project, or getting in touch.</p>
            </div>

            {messages.length === 0 && (
              <div className="br-chat-starters" aria-label="Suggested questions">
                {STARTERS.map((question) => (
                  <button type="button" key={question} onClick={() => send(question)} disabled={busy || retrySeconds > 0}>
                    {question}<ArrowUpRight size={14} aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}

            {messages.map((message, index) => (
              <div className={`br-chat-message br-chat-message--${message.role}`} key={`${index}-${message.role}`}>
                <span className="br-chat-message-label">{message.role === "user" ? "You" : "BR Assistant"}</span>
                <p dir="auto">{message.content}</p>
              </div>
            ))}

            {busy && (
              <div className="br-chat-thinking" role="status">
                <span className="br-chat-thinking-dots" aria-hidden="true"><i /><i /><i /></span>
                <span>BR Assistant is thinking…</span>
              </div>
            )}

            {failure && (
              <div className="br-chat-error">
                <p role="alert">{failure.message}</p>
                {retrySeconds > 0 && <span aria-hidden="true">Try again in {retrySeconds}s.</span>}
                <div>
                  <button type="button" onClick={() => void getReply(messages)} disabled={busy || retrySeconds > 0}>Retry response <RotateCcw size={12} aria-hidden="true" /></button>
                  <a href={`tel:${company.phones[0].number}`}>Call our team <ArrowUpRight size={12} aria-hidden="true" /></a>
                </div>
              </div>
            )}
              </>
            )}
          </div>

          <footer className="br-chat-footer">
            {!quoteOpen && (
              <div className="br-chat-actions" aria-label="Project inquiry options">
                <button type="button" onClick={() => setQuoteOpen(true)}><ClipboardList size={14} aria-hidden="true" /> Request a quote</button>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp <ArrowUpRight size={13} aria-hidden="true" /></a>
              </div>
            )}
            {!quoteOpen && (
            <form className="br-chat-composer" onSubmit={(event) => { event.preventDefault(); send(); }}>
              <label className="br-chat-sr-only" htmlFor="br-chat-message">Message BR Construction assistant</label>
              <textarea
                ref={composer}
                id="br-chat-message"
                rows={2}
                value={draft}
                maxLength={MAX_MESSAGE_LENGTH}
                placeholder="Tell us what you have in mind…"
                autoComplete="off"
                enterKeyHint="send"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    send();
                  }
                }}
              />
              <button className="br-chat-send" type="submit" disabled={!draft.trim() || busy || retrySeconds > 0} aria-label="Send message">
                <Send size={17} aria-hidden="true" />
              </button>
            </form>
            )}
            <p className="br-chat-caution">AI can make mistakes. Our team confirms quotes and project details.</p>
            <p className="br-chat-privacy">AI assistant · Messages processed by Groq. Please avoid sensitive information. <a href="/privacy">Privacy</a></p>
          </footer>
        </div>
      )}

      <button
        className={`br-chat-launcher${open ? " is-open" : ""}`}
        type="button"
        ref={trigger}
        aria-label={open ? "Close BR Construction chat" : "Open BR Construction chat"}
        aria-expanded={open}
        aria-controls="br-chat-panel"
        onClick={() => { if (open) close(); else setOpen(true); }}
      >
        {open ? <X size={22} aria-hidden="true" /> : <BotImage />}
        <span>{open ? "Close chat" : "Let’s talk"}</span>
        {!open && <span className="br-chat-launcher-dot" aria-hidden="true" />}
      </button>
    </aside>
  );
}
