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

Copy `.env.example` to an ignored `.env.local` and configure the database before testing accepted inquiries. The visual pages work without a database; the form returns an error when an inquiry cannot be saved.

## Deploy to Vercel

1. Import [the GitHub repository](https://github.com/maoozkhan0123-cell/Brconstruction) into Vercel. Select **Next.js**, use the repository root, and leave the installation and build commands from `vercel.json`: `npm ci` and `npm run build`.
2. Create a Turso/libSQL database and add its URL and authentication token to the Vercel project environment. Also add a random `INQUIRY_RATE_LIMIT_SECRET`. Set variables for each environment that needs to accept inquiries, including Preview if used.
3. Using the same database credentials in your ignored local `.env.local`, run `npm run db:migrate`. Apply the schema before opening the deployed form to visitors. Preview deployments should use a separate test database when test and production inquiries need isolation.
4. Deploy the `main` branch. Check the public pages, mobile navigation, portfolio, contact links, and an accepted test inquiry on the deployed URL. If notifications are configured, verify the receiving endpoint separately.

The application needs Vercel's Next.js runtime; a static export cannot serve `/api/inquiries`. A Cloudflare D1 binding from the optional Sites deployment is not available on Vercel.

`NEXT_PUBLIC_SITE_URL` is optional. When omitted, metadata uses Vercel's production project URL, then its deployment URL, and finally `http://localhost:3000` locally. Set it to the final HTTPS custom domain when one is connected, and redeploy so canonical URLs, structured data, `sitemap.xml`, and `robots.txt` agree. Do not use a private preview URL as the production canonical domain.

## Environment variables

Next.js reads local configuration from `.env.local`. Configure hosted values in Vercel's project settings and redeploy after changing them. Keep all database and notification credentials server-only; never place them in a `NEXT_PUBLIC_*` variable or commit populated environment files.

| Variable | Purpose |
| --- | --- |
| `TURSO_DATABASE_URL` | Database URL supplied by Turso/libSQL. Required for saved inquiries. |
| `TURSO_AUTH_TOKEN` | Server-only database authentication token. Required for the hosted Turso database. |
| `INQUIRY_RATE_LIMIT_SECRET` | Recommended long random server-only value used to HMAC the network identifier for rate limiting. |
| `INQUIRY_NOTIFICATION_WEBHOOK` | Optional approved HTTPS endpoint that accepts a JSON `inquiry.created` event and sends email or creates a CRM record. |
| `INQUIRY_NOTIFICATION_TOKEN` | Optional bearer token sent only to the configured notification endpoint. |
| `NEXT_PUBLIC_SITE_URL` | Optional public canonical origin, such as the final HTTPS custom domain. |
| `NEXT_PUBLIC_HERO_VIDEO_URL` | Optional licensed or company-approved HTTPS video URL; public and included at build time. |

`LIBSQL_DATABASE_URL` and `LIBSQL_AUTH_TOKEN` are accepted aliases for the corresponding Turso variables. Use one consistent pair. Leave the optional video unset to use the default poster photograph. Rebuild after changing a public value; a video URL must never contain a private access token.

The notification event contains `event`, `id`, an ISO `createdAt`, and the submitted project/contact fields. The receiver should authenticate requests, handle repeated event IDs safely, and return success only when it accepts the event. The application uses a five-second timeout and does not automatically retry failed notifications.

An inquiry is saved before the API returns HTTP 201. Its `notification` value is `delivered`, `failed`, or `not_configured`; `delivered` means the webhook accepted the event, not that a human received an email. A failed or unconfigured notification does not erase a saved inquiry. Displaying the company email address on the website does not configure email delivery.

## Database migrations

The schema defines `inquiries` and `inquiry_rate_limits`. With the target database credentials in `.env.local`, apply the committed SQL migrations:

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
npm run build
npm start
```

Check routes, menu and gallery keyboard behavior, filters and shareable URLs, form validation, an accepted test inquiry, the configured notification destination, and mobile layouts. Performance targets are engineering goals; no Lighthouse score is claimed without measurement.

## Inquiry handling

- Zod validates the form and server request; invalid submissions return explicit errors.
- The server accepts same-origin JSON, limits bodies to 16 KiB, and checks a honeypot, privacy consent, and a form age between two seconds and 24 hours.
- Durable rate limiting allows up to five valid inquiries per connection per 15-minute window. A network identifier hash is stored instead of a raw IP address.
- Database errors produce an error response and never a fabricated success. There is no public inquiry listing or unauthenticated administration route.

The database contains personal contact information. Restrict access to authorized operators and implement the company's approved retention and access/correction/deletion process.

## Optional Cloudflare/Sites runtime

The existing Sites identity and D1 binding remain in `.openai/hosting.json`. Preserve the Sites and Cloudflare integrations in `vite.config.ts` when maintaining that deployment. These commands use the separate Worker runtime:

```sh
npm run sites:dev
npm run sites:build
npm run sites:start
```

Its server-only secrets belong in ignored `.dev.vars` locally and the Sites runtime settings when hosted. Its storage uses the `DB` D1 binding rather than Turso environment variables. After `sites:build`, apply a pending local migration using the generated Wrangler configuration, substituting the next migration filename as needed:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_nice_tinkerer.sql
```

Apply local D1 migrations once and in filename order. Local `.wrangler/state` data is separate from hosted data. Use the Sites plugin's publication workflow for its existing project; the Vercel deployment does not update that deployment or move existing inquiries between databases.

## Content

The portfolio contains **clearly labeled illustrative concepts**, not verified company work. Dates, areas, clients, credentials, awards, performance statistics, and testimonials have not been invented. The commitments section stands in for unavailable client testimonials. Company-supplied office, email, and telephone information is maintained in `data/company.ts` and shared by the website and business structured data.

Replace demonstration projects with approved project facts, licensed photography, and client quotes before presenting them as company work. The company still needs to finalize its legal identity, service areas, professional credentials, retention process, and privacy/website terms. Confirm the final canonical domain and verify the notification destination before relying on online inquiries operationally.

The hero defaults to an optimized architectural poster photograph. Optional approved footage plays muted and inline with a pause/play control; reduced motion, data saving, or a 2G connection keeps the poster. An optional renovation comparison is absent until authentic matching before-and-after imagery is available.

Do not commit `node_modules`, `.next`, `dist`, `.vercel`, `.wrangler`, `.sites-runtime`, populated `.env*`/`.dev.vars*`, credentials, inquiry exports, or publication archives. The safe `.env.example` template is the exception.
