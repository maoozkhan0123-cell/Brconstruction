import test from "node:test";
import assert from "node:assert/strict";
import { createInquiryMail, getInitialInquiryNotificationStatus, sendInquiryNotification } from "../lib/inquiry-notification.ts";

const recipient = "admin@brconstruction.services";
const record = {
  id: "1286b704-f99a-472c-95ad-51a13aa16eee", fullName: "Example visitor", email: "visitor@example.com",
  phone: "+923001234567", service: "Interior Design", location: "Karachi", budget: "To be discussed",
  startDate: "2027-01-10", description: "A private home interior project with custom cabinetry.",
  createdAt: 1800000000000, consentAt: 1800000000000, notificationStatus: "pending",
};
const environment = {
  SMTP_HOST: "mail.example.test", SMTP_PORT: "465", SMTP_USER: "website@example.test", SMTP_PASSWORD: " test-password ",
  INQUIRY_EMAIL_FROM: "BR Construction <website@example.test>", SMTP_SUPPORTED: true,
};
const accepted = { messageId: "<smtp-accepted@example.test>", accepted: [recipient], rejected: [] };
const never = () => { throw new Error("Unexpected external operation"); };

test("unconfigured notifications do not create a transport or contact a provider", async () => {
  assert.equal(getInitialInquiryNotificationStatus({}), "not_configured");
  assert.equal(await sendInquiryNotification(record, {}, { defaultRecipient: recipient, transportFactory: never, fetcher: never }), "not_configured");
});

test("SMTPS uses authenticated TLS with verified certificates and server-owned recipients", async () => {
  let closed = false;
  const status = await sendInquiryNotification(record, environment, {
    defaultRecipient: recipient,
    fetcher: never,
    transportFactory(configuration) {
      assert.equal(configuration.host, environment.SMTP_HOST);
      assert.equal(configuration.port, 465);
      assert.equal(configuration.secure, true);
      assert.equal(configuration.requireTLS, true);
      assert.equal(configuration.ignoreTLS, false);
      assert.equal(configuration.tls.rejectUnauthorized, true);
      assert.equal(configuration.tls.minVersion, "TLSv1.2");
      assert.equal(configuration.tls.servername, environment.SMTP_HOST);
      assert.deepEqual(configuration.auth, { user: environment.SMTP_USER, pass: environment.SMTP_PASSWORD });
      assert.equal(configuration.logger, false);
      assert.equal(configuration.debug, false);
      assert.ok(configuration.connectionTimeout <= 10000 && configuration.socketTimeout <= 10000);
      return {
        async sendMail(message) {
          assert.deepEqual(message.to, [recipient]);
          assert.deepEqual(message.envelope, { from: "website@example.test", to: [recipient] });
          assert.equal(message.from.address, "website@example.test");
          assert.equal(message.replyTo, record.email);
          assert.ok(!message.subject.includes(record.email));
          assert.equal(message.messageId, `<br-inquiry-${record.id}@example.test>`);
          assert.equal(message.disableFileAccess, true);
          assert.equal(message.disableUrlAccess, true);
          assert.match(message.text, /Interior Design/);
          assert.match(message.text, /2027-01-10/);
          assert.match(message.text, /Privacy consent/);
          return accepted;
        },
        close() { closed = true; },
      };
    },
  });
  assert.equal(status, "delivered");
  assert.equal(closed, true);
});

test("port587 requires STARTTLS and does not silently downgrade encryption", async () => {
  const status = await sendInquiryNotification(record, { ...environment, SMTP_PORT: "587" }, {
    defaultRecipient: recipient,
    transportFactory(configuration) {
      assert.equal(configuration.port, 587);
      assert.equal(configuration.secure, false);
      assert.equal(configuration.requireTLS, true);
      assert.equal(configuration.ignoreTLS, false);
      return { sendMail: async () => accepted };
    },
  });
  assert.equal(status, "delivered");
});

test("partial credentials, unsafe ports/headers and invalid recipients fail before a connection", async () => {
  for (const configuration of [
    { SMTP_HOST: "mail.example.test" },
    { ...environment, SMTP_PORT: "25" },
    { ...environment, SMTP_PASSWORD: "" },
    { ...environment, SMTP_HOST: "https://mail.example.test/secret" },
    { ...environment, SMTP_USER: "user\r\nsecret" },
    { ...environment, INQUIRY_EMAIL_FROM: "website@example.test\r\nBcc: attacker@example.test" },
    { ...environment, INQUIRY_EMAIL_TO: "admin@example.test,attacker@example.test" },
  ]) {
    assert.equal(getInitialInquiryNotificationStatus(configuration), "pending");
    assert.equal(await sendInquiryNotification(record, configuration, { defaultRecipient: recipient, transportFactory: never, fetcher: never }), "failed");
  }
});

test("visitor content is escaped and never becomes sender, subject headers or extra recipients", () => {
  const malicious = {
    ...record, fullName: '<img src=x onerror="alert(1)">\r\nBcc: attacker@example.test',
    description: 'A <script>alert("x")</script> & custom "finish" with file:///private/server-key',
    to: "attacker@example.test", from: "forged@example.test", attachments: [{ path: "file:///private/server-key" }],
  };
  const message = createInquiryMail(malicious, { name: "BR Construction", address: "website@example.test" }, recipient);
  assert.ok(!message.html.includes("<script>"));
  assert.ok(!message.html.includes("<img"));
  assert.match(message.html, /&lt;script&gt;/);
  assert.match(message.html, /&amp;/);
  assert.equal(message.subject, `New project inquiry | BR Construction | ${record.id}`);
  assert.deepEqual(message.to, [recipient]);
  assert.equal(message.from.address, "website@example.test");
  assert.equal("attachments" in message, false);
  assert.equal(message.disableFileAccess, true);
  assert.equal(message.disableUrlAccess, true);
  assert.throws(() => createInquiryMail({ ...record, email: "visitor@example.com\r\nBcc: attacker@example.test" }, message.from, recipient));
});

test("SMTP rejection, missing recipient acceptance and malformed acknowledgments never report delivery", async () => {
  for (const result of [
    { messageId: "accepted-without-recipient" },
    { ...accepted, accepted: ["someone-else@example.test"] },
    { ...accepted, rejected: [recipient] },
    { ...accepted, messageId: "" },
    { ...accepted, messageId: "header\r\ninjection" },
    null,
  ]) {
    assert.equal(await sendInquiryNotification(record, environment, { defaultRecipient: recipient, transportFactory: () => ({ sendMail: async () => result }) }), "failed");
  }
  const status = await sendInquiryNotification(record, environment, { defaultRecipient: recipient, transportFactory: () => ({ sendMail: async () => { throw new Error(`private SMTP failure: ${environment.SMTP_PASSWORD}`); } }) });
  assert.equal(status, "failed");
});

test("a stalled SMTP send has a bounded deadline and the connection is closed", async () => {
  let closed = false;
  const status = await sendInquiryNotification(record, environment, {
    defaultRecipient: recipient, timeoutMs: 5,
    transportFactory: () => ({ sendMail: () => new Promise(() => {}), close() { closed = true; } }),
  });
  assert.equal(status, "failed");
  assert.equal(closed, true);
});

test("approved HTTPS webhook remains supported without SMTP and excludes storage-only fields", async () => {
  let calls = 0;
  const status = await sendInquiryNotification(record, { INQUIRY_NOTIFICATION_WEBHOOK: "https://approved.example.test/inquiry", INQUIRY_NOTIFICATION_TOKEN: "private-webhook-test" }, {
    defaultRecipient: recipient, transportFactory: never,
    fetcher: async (url, configuration) => {
      calls++;
      assert.equal(String(url), "https://approved.example.test/inquiry");
      assert.equal(configuration.redirect, "error");
      assert.equal(configuration.headers.Authorization, "Bearer private-webhook-test");
      const payload = JSON.parse(configuration.body);
      assert.equal(payload.event, "inquiry.created");
      assert.equal(payload.id, record.id);
      assert.equal(payload.createdAt, new Date(record.createdAt).toISOString());
      assert.equal("notificationStatus" in payload, false);
      assert.equal("consentAt" in payload, false);
      return new Response(null, { status: 202 });
    },
  });
  assert.equal(status, "delivered");
  assert.equal(calls, 1);
  for (const url of ["http://unapproved.test", "https://user:password@example.test/path", "https://example.test/#fragment"]) {
    assert.equal(await sendInquiryNotification(record, { INQUIRY_NOTIFICATION_WEBHOOK: url }, { defaultRecipient: recipient, transportFactory: never, fetcher: never }), "failed");
  }
});

test("SMTP has precedence without duplicate webhook delivery; Worker can retain its existing webhook", async () => {
  const combined = { ...environment, INQUIRY_NOTIFICATION_WEBHOOK: "https://approved.example.test/inquiry" };
  assert.equal(await sendInquiryNotification(record, combined, { defaultRecipient: recipient, transportFactory: () => ({ sendMail: async () => accepted }), fetcher: never }), "delivered");
  assert.equal(await sendInquiryNotification(record, { ...combined, SMTP_PASSWORD: "" }, { defaultRecipient: recipient, transportFactory: never, fetcher: never }), "failed");
  assert.equal(await sendInquiryNotification(record, { ...combined, SMTP_SUPPORTED: false }, { defaultRecipient: recipient, transportFactory: never, fetcher: async () => new Response(null, { status: 204 }) }), "delivered");
  assert.equal(await sendInquiryNotification(record, { ...environment, SMTP_SUPPORTED: false }, { defaultRecipient: recipient, transportFactory: never, fetcher: never }), "failed");
});

test("only a server-configured override may change the notification recipient", async () => {
  const override = "owner@example.test";
  const status = await sendInquiryNotification(record, { ...environment, INQUIRY_EMAIL_TO: override }, {
    defaultRecipient: recipient,
    transportFactory: () => ({ sendMail: async message => {
      assert.deepEqual(message.to, [override]);
      assert.deepEqual(message.envelope.to, [override]);
      assert.equal(message.replyTo, record.email);
      return { ...accepted, accepted: [override] };
    } }),
  });
  assert.equal(status, "delivered");
});
