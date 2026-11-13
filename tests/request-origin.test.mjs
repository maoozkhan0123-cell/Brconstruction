import test from "node:test";
import assert from "node:assert/strict";
import { isAllowedRequestOrigin } from "../lib/request-origin.ts";

const production = { development: false, vercel: false };
const development = { development: true, vercel: false };
const vercelDevelopment = { development: true, vercel: true };

function request(url, origin, host, fetchSite) {
  const headers = new Headers();
  if (origin !== undefined) headers.set("origin", origin);
  if (host !== undefined) headers.set("host", host);
  if (fetchSite !== undefined) headers.set("sec-fetch-site", fetchSite);
  return new Request(url, { method: "POST", headers });
}

test("exact public origins remain accepted regardless of the local alias context", () => {
  for (const context of [production, development, vercelDevelopment]) {
    assert.equal(isAllowedRequestOrigin(request("https://brconstruction.vercel.app/api/chat", "https://brconstruction.vercel.app"), context), true);
    assert.equal(isAllowedRequestOrigin(request("http://localhost:5173/api/chat", "http://localhost:5173"), context), true);
  }
});

test("production and Vercel reject loopback aliases and unrelated public origins", () => {
  for (const context of [production, vercelDevelopment, { development: false, vercel: true }]) {
    assert.equal(isAllowedRequestOrigin(request("http://localhost:5173/api/chat", "http://127.0.0.1:5173", "127.0.0.1:5173"), context), false);
    assert.equal(isAllowedRequestOrigin(request("https://brconstruction.vercel.app/api/chat", "https://unrelated.example", "unrelated.example"), context), false);
  }
});

test("local development permits normalized localhost IPv4 and IPv6 aliases", () => {
  const hosts = ["localhost", "127.0.0.1", "[::1]"];
  for (const normalizedHost of hosts) {
    for (const browserHost of hosts) {
      assert.equal(isAllowedRequestOrigin(request(`http://${normalizedHost}:5173/api/chat`, `http://${browserHost}:5173`, `${browserHost}:5173`), development), true);
    }
  }
  assert.equal(isAllowedRequestOrigin(request("https://localhost:5173/api/inquiries", "https://127.0.0.1:5173", "127.0.0.1:5173"), development), true);
});

test("loopback alias exceptions require the actual browser Host header", () => {
  assert.equal(isAllowedRequestOrigin(request("http://localhost:5173/api/chat", "http://127.0.0.1:5173"), development), false);
  assert.equal(isAllowedRequestOrigin(request("http://localhost:5173/api/chat", "http://127.0.0.1:5173", "localhost:5173"), development), false);
  assert.equal(isAllowedRequestOrigin(request("http://127.0.0.1:5173/api/chat", "http://localhost:5173", "LOCALHOST:5173"), development), true);
  assert.equal(isAllowedRequestOrigin(request("http://localhost:5173/api/chat", "http://127.0.0.1:5173", "127.0.0.1:5173.attacker.example"), development), false);
});

test("development does not weaken port protocol or public-host boundaries", () => {
  const cases = [
    ["http://localhost:5173/api/chat", "http://127.0.0.1:3000", "127.0.0.1:3000"],
    ["http://localhost:5173/api/chat", "https://127.0.0.1:5173", "127.0.0.1:5173"],
    ["https://brconstruction.vercel.app/api/chat", "https://localhost", "localhost"],
    ["http://localhost:5173/api/chat", "http://localhost.attacker.example:5173", "localhost.attacker.example:5173"],
    ["http://localhost:5173/api/chat", "http://localhostfoo:5173", "localhostfoo:5173"],
    ["http://localhost:5173/api/chat", "http://192.168.1.2:5173", "192.168.1.2:5173"],
    ["http://127.0.0.2:5173/api/chat", "http://localhost:5173", "localhost:5173"],
    ["ftp://localhost:5173/api/chat", "ftp://127.0.0.1:5173", "127.0.0.1:5173"],
  ];
  for (const [url, origin, host] of cases) {
    assert.equal(isAllowedRequestOrigin(request(url, origin, host), development), false);
  }
});

test("cross-site fetch metadata rejects even exact origins in every context", () => {
  for (const context of [production, development, vercelDevelopment]) {
    for (const fetchSite of ["cross-site", "CROSS-SITE"]) {
      assert.equal(isAllowedRequestOrigin(request("https://brconstruction.vercel.app/api/chat", "https://brconstruction.vercel.app", "brconstruction.vercel.app", fetchSite), context), false);
      assert.equal(isAllowedRequestOrigin(request("http://localhost:5173/api/chat", "http://127.0.0.1:5173", "127.0.0.1:5173", fetchSite), context), false);
    }
  }
});

test("missing malformed noncanonical or credential-bearing Origin values fail closed", () => {
  for (const origin of [undefined, "", "null", "not-an-origin", "http://127.0.0.1:5173/", "http://user:password@127.0.0.1:5173", "http://127.0.0.1:5173?token=x", "http://127.0.0.1:5173#fragment", "http://127.1:5173", "http://2130706433:5173", "http://127.0.0.1:5173 http://localhost:5173"]) {
    assert.equal(isAllowedRequestOrigin(request("http://localhost:5173/api/chat", origin, "127.0.0.1:5173"), development), false);
  }
});
