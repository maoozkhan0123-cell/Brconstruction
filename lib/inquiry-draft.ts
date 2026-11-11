import { normalizeInquiryService } from "../data/inquiry-services.ts";

export type InquiryDraft = {
  service: string;
  location: string;
  budget: string;
  description: string;
};

export const INQUIRY_DRAFT_TTL_MS = 30 * 60 * 1000;
const PREFIX = "br:inquiry-draft:";
const TOKEN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const clean = (value: unknown, max: number) => typeof value === "string"
  ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max)
  : "";

export function normalizeInquiryDraft(value: unknown): InquiryDraft | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const draft = {
    service: normalizeInquiryService(input.service),
    location: clean(input.location, 160),
    budget: clean(input.budget, 100),
    description: clean(input.description, 4900),
  };
  return Object.values(draft).some(Boolean) ? draft : null;
}

function validEnvelope(value: unknown, now: number): value is { version: 1; createdAt: number; draft: unknown } {
  if (!value || typeof value !== "object") return false;
  const envelope = value as Record<string, unknown>;
  return envelope.version === 1 && typeof envelope.createdAt === "number" &&
    Number.isSafeInteger(envelope.createdAt) && envelope.createdAt <= now + 60000 &&
    now - envelope.createdAt <= INQUIRY_DRAFT_TTL_MS;
}

/** Only an opaque token enters the URL. No name, location, budget or chat text. */
export function saveInquiryDraft(value: unknown): string | null {
  const draft = normalizeInquiryDraft(value);
  if (!draft || typeof window === "undefined") return null;
  try {
    const storage = window.sessionStorage;
    const now = Date.now();
    const ownedKeys: string[] = [];
    for (let index = 0; index < storage.length; index++) {
      const key = storage.key(index);
      if (key?.startsWith(PREFIX)) ownedKeys.push(key);
    }
    for (const key of ownedKeys) {
      try {
        if (!validEnvelope(JSON.parse(storage.getItem(key) || "null"), now)) storage.removeItem(key);
      } catch { storage.removeItem(key); }
    }
    // A tab needs only its most recent few explicitly created quotation drafts.
    for (const key of ownedKeys.slice(0, Math.max(0, ownedKeys.length - 4))) storage.removeItem(key);
    const token = window.crypto.randomUUID();
    storage.setItem(PREFIX + token, JSON.stringify({ version: 1, createdAt: now, draft }));
    return token;
  } catch { return null; }
}

export function buildInquiryDraftHref(value: unknown): string {
  const token = saveInquiryDraft(value);
  return `/contact?draft=${token || "unavailable"}#project-inquiry`;
}

/** Consume once; the visitor still reviews the fields and gives submission consent. */
export function takeInquiryDraft(token: string, now = Date.now()): InquiryDraft | null {
  if (!TOKEN.test(token) || typeof window === "undefined") return null;
  try {
    const key = PREFIX + token;
    const raw = window.sessionStorage.getItem(key);
    window.sessionStorage.removeItem(key);
    if (!raw) return null;
    const envelope: unknown = JSON.parse(raw);
    return validEnvelope(envelope, now) ? normalizeInquiryDraft(envelope.draft) : null;
  } catch { return null; }
}
