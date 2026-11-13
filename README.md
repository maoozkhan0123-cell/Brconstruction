# BR Construction

A responsive architecture, engineering, construction, and interior design website for BR Construction. Built with React, TypeScript, and the Next.js App Router, with a filterable concept portfolio, accessible image galleries, and a server-backed project inquiry form.

The default commands run a standard Next.js application for Vercel. Optional `sites:*` commands preserve the existing Vinext/Cloudflare Worker deployment.

## Run locally

Use Node.js 24.x and npm. On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`, or the address printed if that port is occupied. For a production preview, run `npm run build` followed by `npm start`.

Copy `.env.example` to an ignored `.env.local` and configure durable storage before testing accepted inquiries. The visual pages work without storage; the form returns an error when an inquiry cannot be saved.

Keep `.env.example` as an empty template. Put real API keys and SMTP credentials
only in ignored `.env.local`; Next.js does not load values from `.env.example`.
The local development APIs accept both `localhost` and `127.0.0.1` on the same
port, while deployed requests retain strict same-origin validation.

## Deploy to Vercel

1. Import [the GitHub repository](https://github.com/maoozkhan0123-cell/Brconstruction) into Vercel. Select **Next.js**, use the repository root, and leave the installation and build commands from `vercel.json`: `npm ci` and `npm run build`.
2. Create a **private Vercel Blob store** and connect it to this Vercel project. The connection supplies the server-only `BLOB_READ_WRITE_TOKEN`. Add a random `INQUIRY_RATE_LIMIT_SECRET`, and configure each environment that needs to accept inquiries, including Preview if used. Use separate preview storage when test and production inquiries need isolation.
3. Deploy the `main` branch. Blob storage needs no SQL migration. Check the public pages, mobile navigation, portfolio, contact links, and an accepted test inquiry on the deployed URL. If notifications are configured, verify the receiving endpoint separately.

The application needs Vercel's Next.js runtime; a static export cannot serve `/api/inquiries`. An optional Turso/libSQL database is also supported; its separate setup is described below. A Cloudflare D1 binding from the optional Sites deployment is not available on Vercel.

`NEXT_PUBLIC_SITE_URL` is optional. When omitted, metadata uses Vercel's production project URL, then its deployment URL, and finally `http://localhost:3000` locally. Set it to the final HTTPS custom domain when one is connected, and redeploy so canonical URLs, structured data, `sitemap.xml`, and `robots.txt` agree. Do not use a private preview URL as the production canonical domain.

## Environment variables

Next.js reads local configuration from `.env.local`. Configure hosted values in Vercel's project settings and redeploy after changing them. Keep all storage, database, and notification credentials server-only; never place them in a `NEXT_PUBLIC_*` variable or commit populated environment files.

| Variable | Purpose |
| --- | --- |
| `BLOB_READ_WRITE_TOKEN` | Server-only token for the connected **private** Vercel Blob store. Enables the primary inquiry storage. |
| `TURSO_DATABASE_URL` | Optional alternative Turso/libSQL database URL, used when Blob storage is not configured. |
| `TURSO_AUTH_TOKEN` | Server-only database token; required when using the Turso alternative. |
| `INQUIRY_RATE_LIMIT_SECRET` | Recommended long random server-only value used to HMAC the network identifier for rate limiting. |
| `INQUIRY_NOTIFICATION_WEBHOOK` | Optional approved HTTPS endpoint that accepts a JSON `inquiry.created` event and sends email or creates a CRM record. |
| `INQUIRY_NOTIFICATION_TOKEN` | Optional bearer token sent only to the configured notification endpoint. |
| `SMTP_HOST` | Business email provider's SMTP hostname. |
| `SMTP_PORT` | `465` for implicit TLS or `587` for required STARTTLS. |
| `SMTP_USER` | Server-only business SMTP login. |
| `SMTP_PASSWORD` | Server-only SMTP password or provider-issued app password. |
| `INQUIRY_EMAIL_FROM` | Sender mailbox approved by the SMTP provider. |
| `INQUIRY_EMAIL_TO` | Optional company-controlled recipient; defaults to `admin@brconstruction.services`. |
| `GROQ_API_KEY` | Server-only Groq key for the website's AI assistant. |
| `GROQ_CHAT_MODEL` | Optional Groq chat model; defaults to `openai/gpt-oss-20b`. |
| `NEXT_PUBLIC_SITE_URL` | Optional public canonical origin, such as the final HTTPS custom domain. |
| `NEXT_PUBLIC_HERO_VIDEO_URL` | Optional licensed or company-approved HTTPS video URL; public and included at build time. |

`LIBSQL_DATABASE_URL` and `LIBSQL_AUTH_TOKEN` are accepted aliases for the corresponding Turso variables. Use one consistent pair. Leave the optional video unset to use the default poster photograph. Rebuild after changing a public value; a video URL must never contain a private access token.

When SMTP is not configured, the optional notification webhook receives `event`, `id`, an ISO `createdAt`, and the submitted project/contact fields. The receiver should authenticate requests, handle repeated event IDs safely, and return success only when it accepts the event. The webhook uses a five-second timeout and does not automatically retry failed notifications.

An inquiry is saved before the API returns HTTP 201. With Blob storage, each accepted inquiry is a private JSON object, and the application confirms the write before acknowledging it. Its `notification` value is `delivered`, `failed`, or `not_configured`; `delivered` means the SMTP server accepted the company recipient or the webhook accepted the event, not that a human received an email. A failed or unconfigured notification does not erase a saved inquiry. Displaying the company email address on the website does not configure email delivery.

## Business email alerts

Configure the six SMTP/sender values above in ignored `.env.local` for local work
and in the Vercel production environment before redeploying. Use the business mail
provider's verified hostname, mailbox, and SMTP/app password. The sender must be
authorized for that mailbox. Do not paste passwords into chat, commit them, or use
a `NEXT_PUBLIC_*` variable. Recipient configuration is server-controlled; a visitor
cannot choose an email destination. Their validated email is used only as Reply-To.

SMTP takes priority over the optional webhook, so one inquiry does not generate
duplicate notifications through both channels. Port 25, plaintext authentication,
TLS downgrades, and invalid certificates are rejected. The send attempt has a
15-second deadline. A partial SMTP configuration records a notification failure
without losing the saved inquiry. No emails are sent until valid settings exist.
Verify one clearly labeled test inquiry and the company mailbox after setup.

## Quotation handoff and WhatsApp

The assistant's **Request a quote** flow collects a service, location, optional
budget, and project notes. **Continue to inquiry** creates a short-lived draft in
the current tab's session storage. The URL contains only an opaque reference, and
the contact form consumes the draft once. The visitor reviews the fields, supplies
contact information, and gives consent before any submission. Drafts expire after
30 minutes; missing or blocked browser storage produces a manual-entry notice.
Chat text is copied only when the visitor explicitly selects **Use my messages**.

WhatsApp links use the owner-confirmed `+92-332-2249951` number configured in
`data/company.ts`. They open a generic project message; the visitor sends it.

## Approved company evidence

`data/company-proof.ts` supports approved team members, genuine testimonials, and
real case studies, including before/after images. These datasets are intentionally
empty because no approved content has been supplied. About and Projects sections
render only when published records exist. Keep the original illustrative portfolio
clearly labeled; do not describe stock photographs as completed commissions.
Add local photography with meaningful alternative text, dimensions, and explicit
publication permission. Confirm names, claims, quotations, and photo rights with
the company and the people involved before adding a record.

## Website chat assistant

The floating BR Construction assistant answers from the website's shared company,
services, process, and illustrative portfolio content. It follows the visitor's
language, including English and Roman Urdu. This is website context supplied with
each request, so edits to those shared data files update its knowledge on the next
deployment; no model fine-tuning is required. Prices, schedules, bookings, and
unpublished company information must be confirmed by the team.

Set server-only `GROQ_API_KEY` in Vercel and optionally `GROQ_CHAT_MODEL` (default
`openai/gpt-oss-20b`). Never place the key in client code or a `NEXT_PUBLIC_*`
variable. The `/api/chat` route owns the system instructions, validates bounded
same-origin conversations, and sends them to Groq. Private Blob counters limit
usage separately from project inquiries; production requires the connected private
Blob store. The browser keeps chat only in memory, and the server does not save chat
text as an inquiry or send notifications. Clearing chat or reloading removes the
browser transcript. Groq processes message content under its own terms, as disclosed
in the widget and privacy page.

For local testing, use ignored `.env.local`. Configure Groq values on Vercel before
deploying. Check English and Roman Urdu replies, real contact information, honest
quote guidance, mobile keyboard behavior, loading/retry states, and provider failure
handling. A saved chat reply does not submit a project inquiry or book a consultation.

## Optional Turso/libSQL storage

When `BLOB_READ_WRITE_TOKEN` is configured, the application uses the private Blob store and needs no SQL migration. To use Turso instead, leave the Blob token unset, configure `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`, and apply the committed SQL migrations with those credentials in `.env.local`. The schema defines `inquiries` and `inquiry_rate_limits`:

```sh
npm run db:migrate
```

The command records applied migrations, skips them on later runs, and rejects changes to already applied SQL. After changing `db/schema.ts`, generate and review the next migration with `npm run db:generate`, commit its SQL and Drizzle metadata, then apply it to each target database. Do not edit migrations already applied, create tables inside request handlers, or include real inquiry data in migrations.

## Application structure

```text
app/                         App Router pages, metadata, and API routes
  api/inquiries/route.ts      Validated server-side inquiry submission
  projects/[slug]/            Individual illustrative concept pages
  services/[slug]/            Individual service pages
components/                  Shared layout, homepage, portfolio, and gallery UI
data/company.ts              Company-supplied office, email, and telephone details
data/projects.ts             Illustrative project content and image references
data/services.ts             Services and capabilities
db/                          Database adapters and Drizzle schema
drizzle/                     Versioned SQL migrations and Drizzle metadata
lib/validations.ts           Shared inquiry validation rules
scripts/migrate-inquiries.mjs Turso/libSQL migration command
public/images/               Local WebP architectural reference photographs
```

[`public/images/CREDITS.md`](public/images/CREDITS.md) records the reference photography; [`public/fonts/README.md`](public/fonts/README.md) records font sources. The photographs are illustrative and must never be described as BR Construction commissions. Native anchors intentionally keep fragment links and full-page routes reliable across the two supported runtimes.

## Verification

```sh
npm run typecheck
node --test tests/inquiries.validation.test.mjs
node --test tests/chatbot.test.mjs
npm run build
npm start
```

Check routes, menu and gallery keyboard behavior, filters and shareable URLs, form validation, an accepted test inquiry, the configured notification destination, and mobile layouts. Performance targets are engineering goals; no Lighthouse score is claimed without measurement.

## Inquiry handling

- Zod validates the form and server request; invalid submissions return explicit errors.
- The server accepts same-origin JSON, limits bodies to 16 KiB, and checks a honeypot, privacy consent, and a form age between two seconds and 24 hours.
- Durable rate limiting allows up to five valid inquiries per connection per 15-minute window. Blob storage claims one of five slots in each aligned 15-minute window using a keyed network identifier; no raw IP address is stored.
- Storage errors produce an error response and never a fabricated success. There is no public inquiry listing or unauthenticated administration route.

Stored inquiries contain personal contact information. Keep the Blob store private, restrict storage access to authorized operators, and implement the company's approved retention and access/correction/deletion process. The site does not automatically delete or export inquiries; authorized owners manage those operations through storage tools. Include the small rate-limit objects in the storage retention process.

## Optional Cloudflare/Sites runtime

The existing Sites identity and D1 binding remain in `.openai/hosting.json`. Preserve the Sites and Cloudflare integrations in `vite.config.ts` when maintaining that deployment. These commands use the separate Worker runtime:

```sh
npm run sites:dev
npm run sites:build
npm run sites:start
```

Its server-only secrets belong in ignored `.dev.vars` locally and the Sites runtime settings when hosted. Its storage uses the `DB` D1 binding rather than the Blob token or Turso environment variables. After `sites:build`, apply a pending local migration using the generated Wrangler configuration, substituting the next migration filename as needed:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_nice_tinkerer.sql
```

Apply local D1 migrations once and in filename order. Local `.wrangler/state` data is separate from hosted data. Use the Sites plugin's publication workflow for its existing project; the Vercel deployment does not update that deployment or move existing inquiries between databases.

## Content

The portfolio contains **clearly labeled illustrative concepts**, not verified company work. Dates, areas, clients, credentials, awards, performance statistics, and testimonials have not been invented. The commitments section stands in for unavailable client testimonials. Company-supplied office, email, and telephone information is maintained in `data/company.ts` and shared by the website and business structured data.

Replace demonstration projects with approved project facts, licensed photography, and client quotes before presenting them as company work. The company still needs to finalize its legal identity, service areas, professional credentials, retention process, and privacy/website terms. Confirm the final canonical domain and verify the notification destination before relying on online inquiries operationally.

The hero defaults to an optimized architectural poster photograph. Optional approved footage plays muted and inline with a pause/play control; reduced motion, data saving, or a 2G connection keeps the poster. An optional renovation comparison is absent until authentic matching before-and-after imagery is available.

Do not commit `node_modules`, `.next`, `dist`, `.vercel`, `.wrangler`, `.sites-runtime`, populated `.env*`/`.dev.vars*`, credentials, inquiry exports, or publication archives. The safe `.env.example` template is the exception.
