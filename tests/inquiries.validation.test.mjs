import test from "node:test";
import assert from "node:assert/strict";
import { validateInquiry } from "../lib/validations.ts";

const now = 1800000000000;
const valid = {
  fullName: "  Avery Taylor  ",
  email: "  AVERY@example.com  ",
  phone: "+1 (555) 123-4567",
  service: "Architecture & Planning",
  location: "Los Angeles",
  budget: "Prefer to discuss",
  startDate: "2027-05-01",
  description: "We are planning a contemporary family residence.",
  website: "",
  startedAt: now - 10000,
  consent: true,
};

test("accepts a completed inquiry and normalizes contact details", () => {
  const result = validateInquiry(valid, now);
  assert.equal(result.success, true);
  assert.equal(result.data.fullName, "Avery Taylor");
  assert.equal(result.data.email, "avery@example.com");
});

test("optional contact and planning fields may be empty", () => {
  const result = validateInquiry({ ...valid, phone: "", budget: "", startDate: "" }, now);
  assert.equal(result.success, true);
});

test("returns errors for missing privacy consent, invalid email and unknown service", () => {
  const result = validateInquiry({ ...valid, email: "invalid", service: "Unknown", consent: false }, now);
  assert.equal(result.success, false);
  assert.ok(result.fields.email);
  assert.ok(result.fields.service);
  assert.ok(result.fields.consent);
});

test("rejects honeypot submissions without claiming success", () => {
  const result = validateInquiry({ ...valid, website: "https://spam.invalid" }, now);
  assert.equal(result.success, false);
  assert.ok(result.fields.website);
});

test("rejects implausibly fast, expired and future submissions", () => {
  for (const startedAt of [now - 100, now - 86400001, now + 10000]) {
    assert.equal(validateInquiry({ ...valid, startedAt }, now).success, false);
  }
});

test("rejects oversized descriptions and malformed contact fields", () => {
  const result = validateInquiry({ ...valid, description: "x".repeat(5001), phone: "javascript:alert(1)" }, now);
  assert.equal(result.success, false);
  assert.ok(result.fields.description);
  assert.ok(result.fields.phone);
  assert.equal(validateInquiry({ ...valid, phone: "-------" }, now).success, false);
});

test("rejects invalid calendar dates rather than allowing JavaScript date rollover", () => {
  for (const startDate of ["2027-02-29", "2027-13-01", "tomorrow"]) {
    const result = validateInquiry({ ...valid, startDate }, now);
    assert.equal(result.success, false);
    assert.ok(result.fields.startDate);
  }
  assert.equal(validateInquiry({ ...valid, startDate: "2028-02-29" }, now).success, true);
});

test("does not pass unexpected client fields to persistence", () => {
  const result = validateInquiry({ ...valid, id: "attacker-controlled", createdAt: 0, notificationStatus: "delivered" }, now);
  assert.equal(result.success, true);
  assert.equal("id" in result.data, false);
  assert.equal("createdAt" in result.data, false);
  assert.equal("notificationStatus" in result.data, false);
});
