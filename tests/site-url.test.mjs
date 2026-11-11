import test from "node:test";
import assert from "node:assert/strict";
import { getSiteOrigin } from "../lib/site-url.ts";

test("explicit site URL takes precedence and normalizes to an origin", () => {
  assert.equal(getSiteOrigin({
    NEXT_PUBLIC_SITE_URL: " https://brconstruction.example/studio?view=all#top ",
    VERCEL_PROJECT_PRODUCTION_URL: "production.vercel.app",
    VERCEL_URL: "preview.vercel.app",
  }), "https://brconstruction.example");
});

test("production hostname takes precedence over preview hostname", () => {
  assert.equal(getSiteOrigin({
    VERCEL_PROJECT_PRODUCTION_URL: "brconstruction.vercel.app",
    VERCEL_URL: "brconstruction-preview.vercel.app",
  }), "https://brconstruction.vercel.app");
});

test("preview hostname works when no production URL is configured", () => {
  assert.equal(getSiteOrigin({ VERCEL_URL: "preview.vercel.app" }), "https://preview.vercel.app");
});

test("already absolute Vercel URLs are not prefixed twice", () => {
  assert.equal(getSiteOrigin({ VERCEL_PROJECT_PRODUCTION_URL: "https://brconstruction.vercel.app/" }), "https://brconstruction.vercel.app");
});

test("invalid explicit and production URLs fall through to a valid candidate", () => {
  assert.equal(getSiteOrigin({
    NEXT_PUBLIC_SITE_URL: "ftp://files.example",
    VERCEL_PROJECT_PRODUCTION_URL: "bad host.example",
    VERCEL_URL: "valid-preview.vercel.app",
  }), "https://valid-preview.vercel.app");
});

test("URLs with embedded credentials are rejected", () => {
  assert.equal(getSiteOrigin({ NEXT_PUBLIC_SITE_URL: "https://user:secret@example.com" }), "http://localhost:3000");
});

test("relative and non-HTTP explicit URLs cannot become public canonicals", () => {
  for (const value of ["/relative", "example.com", "javascript:alert(1)", "file:///tmp/site"]) {
    assert.equal(getSiteOrigin({ NEXT_PUBLIC_SITE_URL: value }), "http://localhost:3000");
  }
});

test("development defaults to local Next.js and permits an explicit local port", () => {
  assert.equal(getSiteOrigin({}), "http://localhost:3000");
  assert.equal(getSiteOrigin({ NEXT_PUBLIC_SITE_URL: "http://localhost:5173/path" }), "http://localhost:5173");
});
