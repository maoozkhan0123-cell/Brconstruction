import { z } from "zod";
import type { InquiryNotificationStatus, InquiryRecord } from "./inquiry-store.types";

export interface InquiryNotificationEnvironment {
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  INQUIRY_EMAIL_FROM?: string;
  INQUIRY_EMAIL_TO?: string;
  INQUIRY_NOTIFICATION_WEBHOOK?: string;
  INQUIRY_NOTIFICATION_TOKEN?: string;
  /** Set by the runtime adapter, never by a visitor or public environment value. */
  SMTP_SUPPORTED?: boolean;
}

export type InquiryNotificationResult = Exclude<InquiryNotificationStatus, "pending">;
type Mailbox = { name?: string; address: string };
export interface InquiryMail {
  from: Mailbox;
  to: string[];
  replyTo: string;
  envelope: { from: string; to: string[] };
  subject: string;
  messageId: string;
  text: string;
  html: string;
  disableFileAccess: true;
  disableUrlAccess: true;
}

export interface InquirySmtpOptions {
  host: string;
  port: 465 | 587;
  secure: boolean;
  requireTLS: true;
  ignoreTLS: false;
  pool: false;
  auth: { user: string; pass: string };
  tls: { rejectUnauthorized: true; minVersion: "TLSv1.2"; servername: string };
  connectionTimeout: number;
  greetingTimeout: number;
  socketTimeout: number;
  logger: false;
  debug: false;
}

export interface InquiryMailTransport {
  sendMail(message: InquiryMail): Promise<unknown>;
  close?(): void;
}

interface SendOptions {
  /** The company-owned default is passed by the route, never taken from a form. */
  defaultRecipient: string;
  transportFactory?: (configuration: InquirySmtpOptions) => InquiryMailTransport | Promise<InquiryMailTransport>;
  fetcher?: typeof fetch;
  timeoutMs?: number;
}

const UUID = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
const email = z.string().max(254).email();
const emailKeys = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "INQUIRY_EMAIL_FROM", "INQUIRY_EMAIL_TO"] as const;
const hasValue = (value: unknown): value is string => typeof value === "string" && value.length > 0;
const hasSmtp = (environment: InquiryNotificationEnvironment) => emailKeys.some(key => hasValue(environment[key]));

export function getInitialInquiryNotificationStatus(environment: InquiryNotificationEnvironment): "pending" | "not_configured" {
  return hasSmtp(environment) || hasValue(environment.INQUIRY_NOTIFICATION_WEBHOOK) || hasValue(environment.INQUIRY_NOTIFICATION_TOKEN)
    ? "pending" : "not_configured";
}

function cleanEmail(value: unknown): string | null {
  if (typeof value !== "string" || /[\r\n\u0000]/.test(value)) return null;
  const parsed = email.safeParse(value.trim());
  return parsed.success ? parsed.data : null;
}

function cleanSender(value: unknown): Mailbox | null {
  if (typeof value !== "string" || value.length > 400 || /[\r\n\u0000]/.test(value)) return null;
  const bare = cleanEmail(value);
  if (bare) return { address: bare };
  const match = /^([^<>]+)<([^<>]+)>$/.exec(value.trim());
  if (!match) return null;
  const address = cleanEmail(match[2]);
  const name = match[1].trim().replace(/^"(.*)"$/, "$1");
  return address && name && name.length <= 100 ? { name, address } : null;
}

function smtpConfiguration(environment: InquiryNotificationEnvironment) {
  const host = environment.SMTP_HOST?.trim();
  const port = environment.SMTP_PORT?.trim();
  const user = environment.SMTP_USER?.trim();
  const password = environment.SMTP_PASSWORD;
  const from = cleanSender(environment.INQUIRY_EMAIL_FROM);
  if (!host || !/^(?=.{1,253}$)[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i.test(host) || !host.includes(".") || host.includes("..") || /^\d+(?:\.\d+){3}$/.test(host)
    || (port !== "465" && port !== "587") || !user || user.length > 320 || /[\r\n\u0000]/.test(user)
    || !password?.trim() || password.length > 2048 || /[\r\n\u0000]/.test(password) || !from) return null;
  const configuration: InquirySmtpOptions = {
    host, port: Number(port) as 465 | 587, secure: port === "465", requireTLS: true, ignoreTLS: false, pool: false,
    auth: { user, pass: password },
    tls: { rejectUnauthorized: true, minVersion: "TLSv1.2", servername: host },
    connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 10000, logger: false, debug: false,
  };
  return { configuration, from };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

export function createInquiryMail(record: InquiryRecord, from: Mailbox, recipient: string): InquiryMail {
  const replyTo = cleanEmail(record.email);
  if (!UUID.test(record.id) || !replyTo || !cleanEmail(recipient) || !Number.isSafeInteger(record.createdAt) || record.createdAt <= 0
    || !Number.isSafeInteger(record.consentAt) || record.consentAt <= 0) throw new Error("Inquiry notification could not be prepared.");
  const details = [
    ["Reference", record.id], ["Received (UTC)", new Date(record.createdAt).toISOString()],
    ["Name", record.fullName], ["Email", replyTo], ["Phone", record.phone], ["Service", record.service],
    ["Project location", record.location], ["Indicative budget", record.budget], ["Expected start date", record.startDate],
    ["Project description", record.description], ["Privacy consent (UTC)", new Date(record.consentAt).toISOString()],
  ];
  if (details.some(([, value]) => typeof value !== "string")) throw new Error("Inquiry notification could not be prepared.");
  const text = ["BR Construction — new project inquiry", ...details.map(([label, value]) => `${label}: ${value || "Not provided"}`), "Reply to this email to contact the visitor. Website submission does not confirm a quotation or booking."].join("\n\n");
  const rows = details.map(([label, value]) => `<tr><th style="padding:12px;text-align:left;vertical-align:top;width:30%;border-bottom:1px solid #ded9cf">${escapeHtml(label)}</th><td style="padding:12px;white-space:pre-wrap;overflow-wrap:anywhere;border-bottom:1px solid #ded9cf">${escapeHtml(value || "Not provided")}</td></tr>`).join("");
  return {
    from, to: [recipient], replyTo, envelope: { from: from.address, to: [recipient] },
    subject: `New project inquiry | BR Construction | ${record.id}`,
    messageId: `<br-inquiry-${record.id}@${from.address.split("@")[1]}>`,
    text,
    html: `<!doctype html><html><body style="margin:0;background:#f3f1eb;color:#16181d;font-family:Arial,sans-serif"><div style="max-width:680px;margin:0 auto;padding:28px"><h1 style="padding:24px;background:#0d0e11;color:#c5a059;font-size:24px">BR Construction<br><span style="color:#f3f1eb;font-size:15px">New project inquiry</span></h1><table style="border-collapse:collapse;width:100%;font-size:14px">${rows}</table><p style="font-size:12px">Reply to this email to contact the visitor. Website submission does not confirm a quotation or booking.</p></div></body></html>`,
    disableFileAccess: true, disableUrlAccess: true,
  };
}

async function createSmtpTransport(configuration: InquirySmtpOptions): Promise<InquiryMailTransport> {
  const { default: nodemailer } = await import("nodemailer");
  const transport = nodemailer.createTransport(configuration);
  return { sendMail: message => transport.sendMail(message), close: () => transport.close() };
}

async function sendSmtp(record: InquiryRecord, environment: InquiryNotificationEnvironment, options: SendOptions): Promise<InquiryNotificationResult> {
  const configured = smtpConfiguration(environment);
  const recipient = cleanEmail(environment.INQUIRY_EMAIL_TO || options.defaultRecipient);
  if (!configured || !recipient || environment.SMTP_SUPPORTED === false) return "failed";
  let transport: InquiryMailTransport | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const message = createInquiryMail(record, configured.from, recipient);
    transport = await (options.transportFactory || createSmtpTransport)(configured.configuration);
    const timeoutMs = Number.isFinite(options.timeoutMs) && Number(options.timeoutMs) > 0 ? Math.min(15000, Number(options.timeoutMs)) : 15000;
    const result: unknown = await Promise.race([
      transport.sendMail(message),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("Notification timeout.")), timeoutMs); }),
    ]);
    const accepted = result as { messageId?: unknown; accepted?: unknown; rejected?: unknown } | null;
    return accepted && typeof accepted.messageId === "string" && accepted.messageId.trim() && !/[\r\n\u0000]/.test(accepted.messageId)
      && Array.isArray(accepted.accepted) && accepted.accepted.some(value => typeof value === "string" && value.toLowerCase() === recipient.toLowerCase())
      && Array.isArray(accepted.rejected) && accepted.rejected.length === 0 ? "delivered" : "failed";
  } catch {
    return "failed";
  } finally {
    if (timer) clearTimeout(timer);
    try { transport?.close?.(); } catch { /* Closing a transport does not change confirmed SMTP acceptance. */ }
  }
}

async function sendWebhook(record: InquiryRecord, environment: InquiryNotificationEnvironment, fetcher: typeof fetch): Promise<InquiryNotificationResult> {
  try {
    const url = new URL(environment.INQUIRY_NOTIFICATION_WEBHOOK || "");
    if (url.protocol !== "https:" || url.username || url.password || url.hash) return "failed";
    const response = await fetcher(url, {
      method: "POST", redirect: "error",
      headers: { "Content-Type": "application/json", ...(environment.INQUIRY_NOTIFICATION_TOKEN ? { Authorization: `Bearer ${environment.INQUIRY_NOTIFICATION_TOKEN}` } : {}) },
      body: JSON.stringify({ event: "inquiry.created", id: record.id, createdAt: new Date(record.createdAt).toISOString(), fullName: record.fullName, email: record.email, phone: record.phone, service: record.service, location: record.location, budget: record.budget, startDate: record.startDate, description: record.description }),
      signal: AbortSignal.timeout(5000),
    });
    const status = response.ok ? "delivered" : "failed";
    await response.body?.cancel();
    return status;
  } catch {
    return "failed";
  }
}

/** Call only after durable storage succeeds. SMTP acceptance is not a guarantee of inbox delivery. */
export async function sendInquiryNotification(record: InquiryRecord, environment: InquiryNotificationEnvironment, options: SendOptions): Promise<InquiryNotificationResult> {
  if (getInitialInquiryNotificationStatus(environment) === "not_configured") return "not_configured";
  // The optional Worker cannot use this Node SMTP transport. Its existing approved webhook remains available.
  if (hasSmtp(environment) && environment.SMTP_SUPPORTED !== false) return sendSmtp(record, environment, options);
  if (hasValue(environment.INQUIRY_NOTIFICATION_WEBHOOK)) return sendWebhook(record, environment, options.fetcher || fetch);
  return "failed";
}
