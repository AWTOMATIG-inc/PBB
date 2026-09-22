# Power Bank Bangladesh (PBB) — Portfolio Website

## What this project is

A simple, static **portfolio website** for Power Bank Bangladesh, a generator dealer in
Bangladesh. It is **not e-commerce** — no cart, no checkout, no online payment, no user
accounts. The site exists to showcase the company and let visitors browse the generator
models they sell/rent/service, then contact the company directly (phone/email) to inquire.

Despite the company name "Power Bank," they do **not** sell portable power banks/battery
packs. Their business is diesel **generators**: sell, buy, rental & service. Never build
content around portable power banks — always generators.

Tagline: *"You Believe, We Assure Trust"* — *"Bringing Energy to Your Doorstep"*

## Source material

The original catalog data came from `Power Bank Bangladesh - Generator Catalog.xlsx` (98
generator models, 6 brands). It was converted once into `data/generators.ts`/`.json` and
later migrated into PocketBase, which is now the source of truth for the live catalog — see
`memory.md`'s "CMS backend" notes for the schema and local run command.

## Business facts to use verbatim in copy (do not invent contact details)

- Business: All kinds of Generator — Sell, Buy, Rental, Service & Spare Parts
- Website: www.powerbankbangladesh.com
- Email: powerbankbd23@gmail.com
- Address (Dhaka): Kamalapur, Biruliya, Savar, Dhaka
- Address (Chattogram): Shop: 8, Subashati Chawk Arcade, 174/A, Nawab Siraj Ud Daulah Road, Chawkbazar, Chattagram
- Phones (approved, use only these two — see `rework-tasks.md` PBB-04/PBB-05): +88 (0) 1989
  474 447 (WhatsApp Business) and +88 (0) 1625 181 403 (office). A third number,
  +88 (0) 1515 675401, previously appeared on the live site and in this file — it is
  **deprecated** per the 2026-09 feedback round, do not use it in new copy, and remove any
  remaining reference to it when working on PBB-04.
- Brands featured: John Deere, Cummins Power Generation, Ricardo, Perkins, Volvo Penta, Deutz
  (full spec tables) plus Caterpillar (CAT) and Doosan (logo/brand mention only — no model
  data exists for these two, do not fabricate model tables for them). May expand per the
  GRAND POWER LTD brochure import (`rework-tasks.md` PBB-08) — check that task before
  assuming this list is final.

## Tech stack & conventions

- **Next.js** (App Router, TypeScript). Static generation — no backend, no database, no API
  routes needed. Product filtering is client-side over the bundled JSON data.
- **Tailwind CSS** for styling.
- **lucide-react** for icons — use it rather than inline SVGs, emoji, or another icon set, so
  iconography stays consistent across pages.
- Keep dependencies minimal — this is a simple site, not a platform. Don't reach for a CMS,
  auth, or a database, or another icon/UI library on top of the above.
- Folder shape (adjust as the project evolves, but keep it this predictable):
  - `app/` — routes: `/`, `/products`, `/about`, `/contact`
  - `components/` — shared UI (nav, footer, brand strip, product card, filter bar)
  - `data/generators.(json|ts)` — the converted catalog data
  - `public/` — logo and any images
- Mobile-first responsive design. Test at ~375px width minimum.

## Site structure (4 public pages — keep it this simple, don't add more without asking)

This describes the public-facing site only. An authenticated `/admin` CMS section
(PocketBase-backed product/filter/home-curation CRUD) was added later, with its own chrome
— see `memory.md`'s "CMS backend" notes. A post-launch feedback round (2026-09) is extending
this further with customers/quotations/invoices — see `rework-tasks.md`, which supersedes
the "no pricing" and "Buy" language below where the two disagree.

1. **Home (`/`)** — hero with tagline, one-line summary of what PBB does, a strip of the
   brand logos, a short "our services" section (Sell / **Exchange** / Rental / Service /
   Spare Parts, five items — "Buy" was renamed to "Exchange" per `rework-tasks.md` PBB-06;
   treat "Exchange" as the correct term in all new copy even before that task ships), and
   CTAs into Products and Contact.
2. **Products (`/products`)** — the core content page. Every model from the catalog data,
   filterable by **brand** and by **kVA band**. Target banding per `rework-tasks.md`
   PBB-01/02 is Small <50 / Medium 50–149 / Large 150–299 / Industrial 300–749 / Heavy
   Industrial 750–1500 (expanded from the original 4-band, 300+-cap scheme to support the
   full 0–1500 kVA range — see that task before assuming the old 4-band scheme is current).
   Each model shows key specs (brand, model, standby/prime kVA, engine, weight, fuel tank) as
   a card or table row. Still no "add to cart" or checkout. Pricing, however, is going from
   "never" to **optional per product**: admin can set a price, and the UI shows it when set
   or falls back to a "Request Quotation" CTA when not — see `rework-tasks.md` PBB-09/10
   before assuming pricing is entirely absent.
3. **About (`/about`)** — company story/trust messaging, and the five services explained in
   a bit more depth (what "sell," "exchange," "rental," "service," and "spare parts" each
   mean for a customer).
4. **Contact (`/contact`)** — **info only, no form.** Both addresses, the two approved phone
   numbers (see "Business facts" above — not three), the email, and (optional, nice-to-have)
   an embedded map for each location.

## Design guidelines

- Pull the palette from the logo and brochure: warm orange as the primary accent, dark
  navy/charcoal for text and dark sections, clean white space. Avoid recreating the busy
  gradient/photo-collage look of the print brochure — this is a cleaner, modern web
  translation of the same brand, not a scan of the PDF.
- Professional, industrial-equipment-dealer feel — trustworthy and straightforward, not flashy.

## Manually-invoked skills

Beyond this file, the user will sometimes manually invoke additional skills mid-session —
for example a frontend-design skill, a "taste"/visual-polish skill, or others they judge
relevant to the task at hand. These are **their** deliberate calls, made because a specific
moment (e.g. a UI polish pass) needs it — not something to second-guess, skip, or substitute
with your own judgment because this file already covers the basics. When the user invokes
one, load and follow its instructions for that turn on top of everything in this file; where
the two conflict, the invoked skill's guidance wins for that specific piece of work, since it
was chosen on purpose for it. Don't invoke skills on your own initiative that the user hasn't
called for — wait for them to trigger it.

## CodeGraph (code intelligence)

CodeGraph is initialized for this repo (`.codegraph/` — local to the machine, self-managing
its own `.gitignore`, never committed). It indexes symbols, imports, and call relationships
across the codebase and is queryable via the `codegraph` CLI: `codegraph query <term>`,
`codegraph explore <query...>`, `codegraph context <task...>`, `codegraph node <name>`,
`codegraph callers <symbol>`, `codegraph callees <symbol>`, `codegraph impact <symbol>`,
`codegraph affected [files...]`, `codegraph status`.

This site is small and mostly static data + presentational components, so for most
single-page tasks reading the relevant files directly is enough — don't reach for CodeGraph
reflexively. It's most useful once the component tree grows (task 2+): before renaming or
changing the shape of something shared (`data/generators.ts` types, a `components/` prop
API), use `codegraph impact <symbol>` or `codegraph callers <symbol>` to see what else
depends on it before editing, rather than grepping by hand. If the index looks stale
(`codegraph status` shows it out of sync with recent edits), run `codegraph sync`.

The MCP server variant (`codegraph install`) has not been set up for this project — only the
CLI is available, so invoke it via a shell tool rather than expecting `codegraph_*` MCP
tools to be present.

## Session workflow — read this before doing anything

Each feature is built in its own fresh conversation with no memory of prior sessions.
`tasks.md` and `memory.md` carry context forward for the core build; `design-task.md` does
the same for the motion/visual-polish pass (now complete — see below), and `rework-tasks.md`
does the same for the 2026-09 post-launch feedback round (catalogue expansion, pricing,
quotations/invoices — currently the active work). **At the start of every session, read
`memory.md`, `tasks.md`, `rework-tasks.md`, and (if touching motion/visual polish)
`design-task.md` in full before writing any code.** At the end of every session, update
whichever of these the session's work applies to.

### `tasks.md`

A checklist of discrete, one-session-sized tasks, roughly in build order. Regenerate/update
this list as scope becomes clearer, but don't let it drift far from something like:

```markdown
# PBB Website — Tasks

- [ ] 1. Project setup: init Next.js (TS + Tailwind + App Router), project structure,
      convert the xlsx catalog into data/generators, add logo to public/, base layout
      (nav + footer) shared across pages
- [ ] 2. Home page
- [ ] 3. Products page: listing + brand/kVA-band filtering
- [ ] 4. About page
- [ ] 5. Contact page
- [ ] 6. Responsive/cross-browser polish, basic SEO metadata (titles, descriptions, favicon)
- [ ] 7. Deployment prep (build check, env/config for chosen host)
```

Check items off as they're completed. Split a task further if a session runs out of room
before finishing it — don't leave "half of task 3" unmarked with no note (use `memory.md`
for that).

### `memory.md`

A running log, most recent entry last. Every entry should let the *next* session (which has
zero context) pick up correctly without re-reading all the code. After finishing work in a
session, append an entry:

```markdown
## Session N — <date> — <task worked on>

- What was done: <brief summary>
- Key decisions made: <e.g. "used a tab bar instead of dropdown for brand filter">
- Skills invoked this session (if any): <e.g. "frontend-design skill for the hero section">
- Files touched: <list>
- Deviations from tasks.md / this CLAUDE.md, and why: <if any>
- Open issues / TODOs for next session: <if any>
```

Never delete prior entries — this file is an append-only project history. If a decision
recorded earlier turns out wrong, add a new entry correcting it rather than editing the old
one away. Exception: once a whole phase of work (e.g. the original frontend build, or the
CMS build) is complete and stable, it's fine to compact that phase's entries into a short
summary in the "Status"/durable-facts sections at the top, same as this file already does —
`git log` remains the source of truth for exact history if it's ever needed.

### `design-task.md`

A third tracking file, same checklist convention as `tasks.md`, scoped to the motion and
visual-polish pass (see `cube-motion.md` and the `/craft-design-engineering` skill). All 12
items are complete as of 2026-09-22 — nothing currently active here, kept for reference.

### `rework-tasks.md`

The active work as of 2026-09-22. Covers the post-launch feedback round: expanded kVA range,
catalogue redesign and brochure import, optional pricing, and a new
customers/quotations/invoices layer. Two owners, Khalid and his junior dev Ashikul — the file
states the split (backend/schema/financial-calculation logic stays with Khalid; content
edits, admin-UI data entry, and visual-only work go to Ashikul) and, critically, the
**sequencing**: Ashikul's half of a task starts only after Khalid's half for that same area
is merged to `main` and deployed, never off an unmerged branch. When working from this file,
check which owner a task belongs to before starting it, and check any "Depends on" note
against what's actually merged, not just what's checked off — a checked box that hasn't been
deployed yet still blocks the dependent task.

## Definition of done (per page/feature)

- Matches the page's content requirements above (no scope creep into e-commerce features).
- Responsive at mobile, tablet, and desktop widths.
- No console errors/warnings; `next build` succeeds.
- Real business data only — no lorem ipsum, no placeholder phone numbers, no invented brands
  or models beyond what's in the catalog data.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
