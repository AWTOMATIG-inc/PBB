# Power Bank Bangladesh (PBB) — Website

Portfolio site + back-office for Power Bank Bangladesh, a diesel **generator** dealer
(sell, exchange, rental, service, spare parts). Despite the name, they do **not** sell
portable power banks — never write content about those.

Not e-commerce: no cart, checkout, online payment, or customer accounts. Visitors browse
models and contact the company. Prices are optional per product; unpriced models show a
"Request Quotation" (WhatsApp) CTA.

Tagline: *"You Believe, We Assure Trust"* — *"Bringing Energy to Your Doorstep"*

## Business facts (use verbatim, never invent contact details)

- Business: All kinds of Generator — Sell, Exchange, Rental, Service & Spare Parts
  ("Exchange" replaced "Buy" — use it in all copy)
- Website: www.powerbankbangladesh.com
- Email: powerbankbd23@gmail.com
- Address (Dhaka): Kamalapur, Biruliya, Savar, Dhaka
- Address (Chattogram): Shop: 8, Subashati Chawk Arcade, 174/A, Nawab Siraj Ud Daulah Road, Chawkbazar, Chattagram
- Phones (only these two): +88 (0) 1989 474 447 (WhatsApp Business) and
  +88 (0) 1625 181 403 (office). +88 (0) 1515 675401 is deprecated — never use it.
- Brands with model data: John Deere, Cummins, Ricardo, Perkins, Volvo Penta, Deutz.
  Caterpillar and Doosan are logo-only — never fabricate models for them.

## Stack

- Next.js (App Router, TypeScript) + Tailwind CSS + `lucide-react` (only icon set).
- PocketBase is the backend and source of truth for products, brands, power bands,
  clients, quotations. Accessed via raw REST (no SDK) in `lib/`. See `pocketbase/README.md`.
- `@react-pdf/renderer` for quotation PDFs; `cube-motion` for animations.
- Keep dependencies minimal. Don't add another UI/icon library, auth provider, or database.
- Hosted on a VPS (PM2 + Nginx), auto-deployed from `main` by a GitHub webhook. Not Vercel.

## Structure

- `app/(site)/` — public pages: `/`, `/products`, `/about`, `/contact`. Don't add public
  pages without asking. Contact is info only, no form.
- `app/dashboard/` — authenticated back-office (products, filters, home curation, clients,
  quotations). Legacy `/admin` URLs redirect here via `proxy.ts`.
- `app/api/dashboard/` — quotation PDF route.
- `components/`, `components/admin/`, `components/pdf/` — UI.
- `lib/` — PocketBase data access, auth/session, quotation math, formatting.
- `data/generators.ts` — shared types + UI constants (`BRANDS`, `KVA_BANDS`).
  `data/generators.json` + `scripts/migrate-products.mjs` only seed a fresh PocketBase.
- `pocketbase/pb_migrations/` — schema as code.

kVA bands: Small <50 / Medium 50–149 / Large 150–299 / Industrial 300–749 /
Heavy Industrial 750–1500.

## Design

Orange `#ED7423` primary, dark navy/charcoal text and dark sections, clean white space.
Professional industrial-dealer feel, not flashy. Palette tokens in `app/globals.css`.
No em dashes in user-facing copy. Mobile-first, test at 375px.

## Skills

When the user manually invokes a skill (design, polish, etc.), follow it for that work;
it wins over this file where they conflict. Don't invoke skills on your own initiative.

## Workflow

- Read `memory.md` at the start of a session; append a short entry at the end if the work
  changed anything a future session needs to know.
- Two devs: Khalid (`khalid` branch — schema, backend, money math) and Ashikul (`ashikul`
  branch — content, data entry, visual work). Both branch from `main`, PR into `main`.
- CodeGraph CLI is available (`codegraph impact|callers <symbol>`) — use it before changing
  shared types or component props.

## Definition of done

- Responsive at mobile, tablet, desktop.
- `next build` succeeds (needs PocketBase running), no console errors.
- Real business data only — no lorem ipsum or invented phones/brands/models.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
