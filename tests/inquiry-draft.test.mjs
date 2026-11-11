import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { normalizeInquiryDraft, saveInquiryDraft, buildInquiryDraftHref, takeInquiryDraft, INQUIRY_DRAFT_TTL_MS } from "../lib/inquiry-draft.ts";
import { inquiryServiceOptions, normalizeInquiryService } from "../data/inquiry-services.ts";

const brief = { service: "Interior Design", location: "DHA Karachi", budget: "To be discussed", description: "A private residence interior project brief." };
const values = new Map();
const storage = { get length() { return values.size; }, key(index) { return [...values.keys()][index] ?? null; }, getItem(key) { return values.get(key) ?? null; }, setItem(key, value) { values.set(key, value); }, removeItem(key) { values.delete(key); } };

test("service normalization uses the same choices as the inquiry form and rejects invented services", () => {
  assert.equal(normalizeInquiryService("interior-design"), "Interior Design");
  for (const service of inquiryServiceOptions) assert.equal(normalizeInquiryService(service), service);
  assert.equal(normalizeInquiryService("Guaranteed approval service"), "");
});

test("quotation data is bounded and never includes contact identity or consent", () => {
  const draft = normalizeInquiryDraft({ ...brief, fullName: "Do not carry", email: "private@example.com", consent: true, location: "x".repeat(500), description: "a\u0000b" });
  assert.equal(draft.location.length, 160);
  assert.equal(draft.description, "ab");
  assert.deepEqual(Object.keys(draft).sort(), ["budget", "description", "location", "service"]);
  assert.equal(normalizeInquiryDraft({}), null);
  assert.equal(normalizeInquiryDraft(null), null);
});

test("handoff URLs contain only an opaque token; reading consumes the draft once", () => {
  const previous = globalThis.window;
  globalThis.window = { sessionStorage: storage, crypto: { randomUUID } };
  try {
    values.clear();
    const href = buildInquiryDraftHref(brief);
    const url = new URL(href, "https://example.test");
    const token = url.searchParams.get("draft");
    assert.match(token, /^[0-9a-f-]{36}$/);
    assert.equal(url.pathname, "/contact");
    assert.equal(url.hash, "#project-inquiry");
    for (const value of Object.values(brief)) assert.equal(decodeURIComponent(href).includes(value), false);
    assert.deepEqual(takeInquiryDraft(token), brief);
    assert.equal(takeInquiryDraft(token), null);
    assert.equal(values.size, 0);
  } finally { if (previous === undefined) delete globalThis.window; else globalThis.window = previous; }
});

test("expired, corrupted and future-dated drafts cannot restore data", () => {
  const previous = globalThis.window;
  globalThis.window = { sessionStorage: storage, crypto: { randomUUID } };
  try {
    for (const createdAt of [Date.now() - INQUIRY_DRAFT_TTL_MS - 1000, Date.now() + 120000]) {
      const token = randomUUID();
      storage.setItem(`br:inquiry-draft:${token}`, JSON.stringify({ version: 1, createdAt, draft: brief }));
      assert.equal(takeInquiryDraft(token), null);
      assert.equal(storage.getItem(`br:inquiry-draft:${token}`), null);
    }
    const token = randomUUID();
    storage.setItem(`br:inquiry-draft:${token}`, "bad json");
    assert.equal(takeInquiryDraft(token), null);
    assert.equal(takeInquiryDraft("invalid"), null);
  } finally { if (previous === undefined) delete globalThis.window; else globalThis.window = previous; }
});

test("unavailable browser storage produces an honest manual-entry handoff without leaking data", () => {
  const previous = globalThis.window;
  globalThis.window = { get sessionStorage() { throw new Error("Blocked by browser"); } };
  try {
    assert.equal(saveInquiryDraft(brief), null);
    assert.equal(buildInquiryDraftHref(brief), "/contact?draft=unavailable#project-inquiry");
    assert.equal(takeInquiryDraft(randomUUID()), null);
  } finally { if (previous === undefined) delete globalThis.window; else globalThis.window = previous; }
});
