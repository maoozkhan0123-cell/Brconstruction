import test from "node:test";
import assert from "node:assert/strict";
import { createBlobInquiryStore } from "../lib/inquiry-store.blob.ts";

const token = "test-private-server-token";
const key = "a".repeat(64);
const windowMs = 15 * 60 * 1000;
const record = {
  id: "1286b704-f99a-472c-95ad-51a13aa16eee",
  fullName: "Form test", email: "test@example.com", phone: "", service: "Architecture",
  location: "Karachi", budget: "", startDate: "", description: "Example inquiry",
  consentAt: 1800000000000, createdAt: 1800000000000, notificationStatus: "pending",
};

function memoryClient() {
  const objects = new Map();
  const writes = [];
  const reads = [];
  return {
    objects, writes, reads,
    async put(pathname, body, options) {
      assert.equal(options.access, "private");
      assert.equal(options.token, token);
      assert.equal(options.addRandomSuffix, false);
      const previous = objects.get(pathname);
      if (previous && !options.allowOverwrite) throw new Error("conflict");
      if (options.ifMatch && previous?.etag !== options.ifMatch) throw new Error("precondition failed");
      const value = { body: String(body), etag: `etag-${writes.length + 1}` };
      objects.set(pathname, value);
      writes.push({ pathname, body: String(body), options });
      return { pathname, etag: value.etag, url: "https://private.invalid/never-return" };
    },
    async get(pathname, options) {
      assert.equal(options.access, "private");
      assert.equal(options.token, token);
      assert.equal(options.useCache, false);
      reads.push({ pathname, options });
      const value = objects.get(pathname);
      return value ? {
        statusCode: 200,
        stream: new Response(value.body).body,
        blob: { pathname, etag: value.etag },
      } : null;
    },
  };
}

test("concurrent rate claims reserve exactly five private conditional slots", async () => {
  const client = memoryClient();
  const store = createBlobInquiryStore(token, client);
  const now = windowMs * 2000 + 1200;
  const results = await Promise.all(Array.from({ length: 12 }, () => store.claimRateLimit(key, now)));
  assert.equal(results.filter(result => result.allowed).length, 5);
  assert.equal(results.filter(result => !result.allowed).length, 7);
  assert.equal(client.objects.size, 5);
  assert.equal(results.find(result => !result.allowed).retryAfter, 899);
  for (const { pathname, body, options } of client.writes) {
    assert.match(pathname, new RegExp(`^inquiry-rate-limits/2000/${key}/[1-5]\\.json$`));
    assert.deepEqual(Object.keys(JSON.parse(body)).sort(), ["slot", "window"]);
    assert.equal(options.allowOverwrite, false);
    assert.ok(!body.includes(record.email));
  }
});

test("a new aligned window or different HMAC has independent reservations", async () => {
  const client = memoryClient();
  const store = createBlobInquiryStore(token, client);
  for (let slot = 0; slot < 5; slot++) assert.deepEqual(await store.claimRateLimit(key, windowMs - 1), { allowed: true });
  assert.deepEqual(await store.claimRateLimit(key, windowMs - 1), { allowed: false, retryAfter: 1 });
  assert.deepEqual(await store.claimRateLimit(key, windowMs), { allowed: true });
  assert.deepEqual(await store.claimRateLimit("b".repeat(64), windowMs - 1), { allowed: true });
  await assert.rejects(store.claimRateLimit("raw-client-ip", windowMs), /storage is unavailable/);
});

test("rate write failure is never mislabeled as a conflict without origin confirmation", async () => {
  for (const get of [async () => null, async () => { throw new Error(token); }]) {
    const store = createBlobInquiryStore(token, {
      put: async () => { throw new Error(`provider failure ${token}`); }, get,
    });
    await assert.rejects(store.claimRateLimit(key, windowMs), error => {
      assert.equal(error.message, "Inquiry storage is unavailable.");
      return true;
    });
  }
});

test("an ambiguous committed rate write is counted conservatively", async () => {
  const client = memoryClient();
  const put = client.put;
  let ambiguous = true;
  const store = createBlobInquiryStore(token, {
    ...client,
    async put(...args) {
      const result = await put(...args);
      if (ambiguous) { ambiguous = false; throw new Error("timed out after commit"); }
      return result;
    },
  });
  assert.deepEqual(await store.claimRateLimit(key, windowMs), { allowed: true });
  assert.equal(client.objects.size, 2);
  assert.equal(client.reads.length, 1);
});

test("inquiries create one immutable private UUID record and return no storage metadata", async () => {
  const client = memoryClient();
  const store = createBlobInquiryStore(token, client);
  assert.equal(await store.saveInquiry(record), undefined);
  assert.deepEqual(JSON.parse(client.objects.get(`inquiries/${record.id}.json`).body), record);
  assert.equal(client.writes[0].options.allowOverwrite, false);
  await assert.rejects(store.saveInquiry({ ...record, fullName: "Overwritten" }), /storage is unavailable/);
  assert.equal(JSON.parse(client.objects.get(`inquiries/${record.id}.json`).body).fullName, record.fullName);
  await assert.rejects(store.saveInquiry({ ...record, id: "../../unsafe" }), /storage is unavailable/);
});

test("inquiry save waits for confirmed provider write and sanitizes failure", async () => {
  let accept;
  const client = { put: () => new Promise(resolve => { accept = resolve; }), get: async () => null };
  let completed = false;
  const saving = createBlobInquiryStore(token, client).saveInquiry(record).then(() => { completed = true; });
  await Promise.resolve();
  assert.equal(completed, false);
  accept({});
  await saving;
  assert.equal(completed, true);
  await assert.rejects(createBlobInquiryStore(token, {
    ...client, put: async () => { throw new Error(token); },
  }).saveInquiry(record), error => error.message === "Inquiry storage is unavailable.");
});

test("notification status updates use uncached private reads and ETag conditional overwrite", async () => {
  const client = memoryClient();
  const store = createBlobInquiryStore(token, client);
  await store.saveInquiry(record);
  await store.setInquiryNotificationStatus(record.id, "delivered");
  const saved = JSON.parse(client.objects.get(`inquiries/${record.id}.json`).body);
  assert.deepEqual(saved, { ...record, notificationStatus: "delivered" });
  assert.equal(client.writes[1].options.allowOverwrite, true);
  assert.equal(client.writes[1].options.ifMatch, "etag-1");
  await assert.rejects(store.setInquiryNotificationStatus("1286b704-f99a-472c-95ad-51a13aa16eef", "failed"), /storage is unavailable/);
});

test("an ETag conflict cannot overwrite a record modified during notification update", async () => {
  const client = memoryClient();
  const store = createBlobInquiryStore(token, client);
  await store.saveInquiry(record);
  const get = client.get;
  const racingStore = createBlobInquiryStore(token, {
    ...client,
    async get(...args) {
      const response = await get(...args);
      client.objects.get(args[0]).etag = "newer-etag";
      return response;
    },
  });
  await assert.rejects(racingStore.setInquiryNotificationStatus(record.id, "delivered"), /storage is unavailable/);
  assert.deepEqual(JSON.parse(client.objects.get(`inquiries/${record.id}.json`).body), record);
  assert.equal(client.writes.length, 1);
});
