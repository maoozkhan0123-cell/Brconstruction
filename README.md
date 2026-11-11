# BR Construction

A responsive architecture, engineering, construction, and interior design website for BR Construction. The experience combines an editorial homepage, filterable concept portfolio, project and service pages, accessible image galleries, and a server-backed project inquiry form.

This delivery uses React, TypeScript, Next.js App Router conventions, and **Vinext** to build a Cloudflare Worker through ChatGPT Sites. It is not a static export or a conventional Node-hosted Next.js deployment. Preserve `sites()` and the Cloudflare integration in `vite.config.ts`.

Navigation intentionally uses native anchors to keep fragment links and full-page routes reliable in the portable Worker build.

## Run locally

Requirements: Node.js 22.13 or newer, npm, Git, and `tar` for Sites publication. Windows PowerShell users can use `npm.cmd` when their execution policy blocks `npm.ps1`.

```sh
npm run install:ci
npm run dev
```

Open the loopback URL printed by the development server, normally `http://localhost:5173`. The project uses the portable execution profile on Windows, macOS, and ordinary Linux hosts. The Sites installer can also install dependencies using the plugin’s `install-dependencies.mjs` helper; run one installer at a time.

The visual pages work without optional notification credentials. The inquiry form needs the D1 binding and migrations described below. It displays an error when the backend cannot persist an inquiry.

## Application structure

```text
app/                         App Router pages, metadata, and API routes
  api/inquiries/route.ts      Validated, server-side inquiry submission
  projects/[slug]/            Individual illustrative concept pages
  services/[slug]/            Individual service pages
  privacy/, terms/            Preview website information
components/                  Shared layout, homepage, portfolio, and gallery UI
data/projects.ts             Illustrative project content and image references
data/services.ts             Services and capabilities
db/                          D1 access and Drizzle schema
drizzle/                     Versioned SQL migrations and Drizzle metadata
lib/validations.ts           Shared inquiry validation rules
public/images/               Local WebP architectural reference photographs
worker/index.ts              Production Worker entry point
.openai/hosting.json          Sites project identity and storage bindings
```

[`public/images/CREDITS.md`](public/images/CREDITS.md) records the reference photography; [`public/fonts/README.md`](public/fonts/README.md) records font sources. These photographs are illustrative and must never be described as BR Construction commissions.

## Runtime environment

For local Cloudflare Worker development, put the server-only variables from `.env.example` in an ignored `.dev.vars` file in the project root. Restart the development server after changing it. Configure hosted runtime variables through Sites environment settings; do not commit runtime secrets or put them in `NEXT_PUBLIC_*` variables.

The optional `NEXT_PUBLIC_HERO_VIDEO_URL` is a **public, build-time** value. Put it in ignored `.env.local` before building, using only a licensed or company-approved HTTPS video URL. It is intentionally exposed to visitors and must never contain a token or other secret. Rebuild after changing it; setting it as a Worker runtime secret does not change an existing client build. No video URL is configured by default.

| Variable | Purpose |
| --- | --- |
| `INQUIRY_RATE_LIMIT_SECRET` | Recommended long random server-only value used to HMAC the network identifier for rate limiting. |
| `INQUIRY_NOTIFICATION_WEBHOOK` | Optional HTTPS endpoint that accepts a JSON `inquiry.created` event and sends email or creates a CRM record. |
| `INQUIRY_NOTIFICATION_TOKEN` | Optional bearer token sent only to the configured notification endpoint. |
| `NEXT_PUBLIC_HERO_VIDEO_URL` | Optional approved video URL, configured in `.env.local` at build time; public, not a secret. |

The `DB` binding is provisioned by Sites from `"d1": "DB"` in `.openai/hosting.json`; it is not a database URL environment variable. No R2 storage is required.

The notification event contains `event`, `id`, an ISO `createdAt`, and the submitted project/contact fields. The endpoint must authenticate requests where appropriate and return a successful HTTP status only when it accepts the event. It should handle repeated event IDs safely. The application uses a five-second timeout and does not automatically retry failed notifications.

**A saved inquiry and a delivered email are different outcomes.** The API returns HTTP 201 only after D1 accepts the inquiry. Its `notification` value is `delivered`, `failed`, or `not_configured`; `delivered` confirms the webhook accepted the request, not that a human received an email. The database keeps the notification status. Configure and test the company’s email/CRM endpoint before relying on notifications. Until then, accepted inquiries remain available to the site owner through authorized database tools.

## Database migrations

The schema defines `inquiries` and `inquiry_rate_limits`. Migrations belong in source control with their Drizzle metadata. Do not alter already-applied migrations, create tables inside request handlers, or store real inquiry data in migration files.

After changing `db/schema.ts`, generate the next migration:

```sh
npm run db:generate
```

Build once to generate the local Wrangler configuration:

```sh
npm run build
```

The initial migration is `drizzle/0000_nice_tinkerer.sql`. Apply it once to a new local database:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_nice_tinkerer.sql
```

Apply subsequent **pending** migrations in filename order, replacing the filename in that command. Keep a record of local applications and do not replay them. Use `.wrangler/state` as the persistence root; Wrangler adds its versioned directories. Rebuild the generated Wrangler configuration whenever storage bindings change.

Local migrations affect only the preview database. Sites applies committed migrations to the hosted database during publication.

## Inquiry behavior and safeguards

- Zod validates both the form fields and the server request. Invalid submissions return explicit errors.
- The server accepts same-origin JSON requests, caps request bodies at 16 KiB, and rejects unsupported content types.
- A hidden honeypot and a form age between two seconds and 24 hours deter automated submissions.
- Durable rate limiting allows up to five valid inquiries per connection per 15-minute window. A network identifier hash is stored rather than a raw IP address; set `INQUIRY_RATE_LIMIT_SECRET` for keyed hashing.
- The server requires privacy consent and records its timestamp.
- Database failure returns an error, never a fabricated success. A notification failure does not erase an inquiry already saved.

The database contains personal contact information. Grant access only to authorized operators, define and implement a company retention policy, and handle access/correction/deletion requests through an approved process. This implementation has no public inquiry listing or unauthenticated administration route.

## Verification

```sh
node node_modules/typescript/bin/tsc --noEmit
node --test tests/inquiries.validation.test.mjs
npm run build
```

To preview the production Worker after building and applying local migrations:

```sh
npm start
```

Use the printed URL. The development and built previews share `.wrangler/state`. Keep preview servers on loopback unless a supported preview environment requires otherwise.

Before a public release, check navigation, menu and gallery keyboard behavior, filters and shareable URLs, form validation, a real accepted test inquiry, the configured notification destination, and mobile layouts at 360, 390, 768, 1024, 1440, and 1920 pixels. Performance targets in the brief are engineering goals; no Lighthouse score is claimed without measurement.

## Sites deployment

`.openai/hosting.json` retains this Site’s project ID and the `DB` binding. Reuse that identity for updates; do not register a second Site for this checkout. Keep the Site private unless the owner explicitly requests an audience change.

With the Sites plugin, follow its source workflow to build, push the exact source state, package the matching Worker artifact, save a version, and deploy the saved version privately. Use the plugin’s `build-site.mjs` entrypoint for hosted packaging. The production build must include `dist/server/index.js`, its generated configuration, static assets, and committed migrations. A static-only deployment cannot serve this inquiry API.

For standalone build verification, `npm run build` remains available. A deployment outside Sites requires a Cloudflare-compatible deployment configuration, D1 provisioning, migrations, runtime secrets, and access controls; those are not created by a generic Node.js host.

Do not commit `node_modules`, `dist`, `.wrangler`, `.sites-runtime`, local `.env*`/`.dev.vars*`, credentials, inquiry exports, or publication archives. The intentionally safe `.env.example` template is the exception. Keep archives outside the checkout or under ignored `outputs/`.

## Content and public launch

The portfolio consists of **clearly labeled illustrative concepts**, not verified company work. Dates, areas, clients, office locations, phone numbers, social accounts, credentials, awards, performance statistics, and testimonials have not been invented. The commitments section stands in for unavailable client testimonials.

Before public business publication, supply and approve:

- The company’s legal identity, verified business contact details, service areas, and relevant professional credentials.
- Authentic project information, photography permissions, and approved client quotes where used.
- The privacy contact, data retention process, finalized privacy/website terms, and any required notices.
- The company’s notification/CRM destination and an end-to-end accepted inquiry test.
- The final canonical domain and corresponding metadata, sitemap, structured data, and hosting configuration.

The hero defaults to an optimized architectural **poster photograph**; no footage is configured or presented as an actual company project. The optional video component accepts the public build-time `NEXT_PUBLIC_HERO_VIDEO_URL`, plays muted and inline with looping autoplay, and provides a pause/play control. It keeps the poster when reduced motion, data saving, or a 2G connection is detected. Supply only licensed or company-approved optimized footage and rebuild. Do not substitute unrelated footage that could imply a fabricated delivery history.

The optional renovation comparison is intentionally absent until matching authentic before-and-after imagery exists. Replace demonstration material with verified content through the existing data files and reusable page templates.
