# PBB Website — Project Memory

Compacted 2026-09-22. Frontend (tasks 1-6) and the PocketBase-backed CMS/admin panel
(tasks 8-14, plus follow-up fixes) are both complete and the site is live — the detailed
session-by-session build log has been pruned now that this work is stable, same reasoning
as the first compaction on 2026-09-16. Use `git log` if a past implementation detail is
ever needed. This file now tracks only what a fresh session still needs to know.

## Status

- Tasks 1-6 (frontend: Home, Products, About, Contact, responsive/SEO polish) — done.
- Tasks 8-14 (PocketBase CMS: schema, product migration, admin foundation, Products/
  Filters/Home-curation CRUD, wiring the public site to PocketBase) — done.
- Task 7 (frontend deployment prep), task 15 (invoices), task 16 (PocketBase VPS
  deployment) — not started. See `tasks.md`.
- New scope added 2026-09-22: a motion/visual-polish pass using `cube-motion` (zero-dep
  WAAPI animation library, see `cube-motion.md`) and the `/craft-design-engineering` skill.
  Full prioritized task list lives in `design-task.md` — read that file and work through it
  in order, same convention as `tasks.md`. Nothing in it is implemented yet as of this entry.

## Durable decisions / conventions

- Icon library: `lucide-react` only, site-wide. Don't introduce another icon set even if a
  design skill suggests one — CLAUDE.md pins this explicitly.
- Images are used on the live site: hero/About use `public/generator.png`, product cards
  reuse it, Home has two logo marquees (`public/brands/*.png`), Products has a
  `brand-carousel.tsx` using `public/carousel/*.webp`.
- No em dashes in user-facing copy anywhere on the site — keep new copy consistent
  (commas/colons instead).
- Nav renders `public/pbb-logo.png` (not `public/logo.png`, which now only survives as the
  favicon source).
- Brand palette lives in `design.md` / `app/globals.css` `@theme` tokens (`brand-*`,
  `ink-*`). Primary orange is `#ED7423` (the company's official color).
- Home's "Our Clients" marquee section reuses `BRAND_LOGOS` (manufacturer logos) as a
  **disclosed placeholder** — real client logos don't exist yet. This section's name has
  flipped before (renamed and reverted); don't rename it again without checking with the
  user first.
- Catalog data: originally static `data/generators.json`/`.ts` (98 models), now
  **PocketBase is the source of truth** for products/brands/power bands (task 14).
  `data/generators.ts` survives only as types/UI constants (`Brand`, `KvaBand`,
  `GeneratorModel`, `GeneratorSpecs`, `BRANDS`, `KVA_BANDS`) plus a one-time seed source for
  `scripts/migrate-products.mjs`.

## CMS backend (PocketBase) — durable facts

- **Local run**: `cd pocketbase` then `.\pocketbase.exe serve` — binary and `pb_data/` live
  inside the repo at `pocketbase/` (gitignored; only `pb_migrations/` and `README.md` are
  tracked). Dashboard at `http://127.0.0.1:8090/_/`.
- **5 collections**: `brands`, `power_bands`, `products` (relations to both, plus a `specs`
  JSON field for brand-specific spec columns), `home_placements` (curates Home's "New
  Products"/"Featured Models" sections, capped at 12/6 via `lib/home-section-limits.ts`),
  `invoices` (admin-only, no public read, fields still undecided — task 15).
- **Auth**: raw PocketBase REST API, no SDK dependency (superuser JWT in an httpOnly
  cookie) — see `lib/pocketbase.ts`, `lib/auth.ts`, `lib/session.ts`, `proxy.ts` (this
  Next.js version renamed `middleware.ts` to `proxy.ts`).
- **Public pages** (`/`, `/products`) fetch PocketBase at build time with 5-minute ISR
  (`lib/public-data.ts`) plus on-demand `revalidatePath` from every admin write action, so
  admin edits reflect on the live site within one request instead of waiting out the ISR
  window.
- **Admin routes**: `app/admin/login` (public) + `app/admin/(protected)` (session-gated via
  `verifyAdminSession()`), CRUD screens under `components/admin/` for Products, Filters
  (brands + power bands), and Home curation. Superuser account:
  `khalidh.awtomatig@gmail.com`.
- `products.created` (autodate) was added via a later migration; admin product sort
  defaults to "Newest first" and falls back to the legacy `sortOrder` field for
  pre-existing catalog rows (empty `created` sorts first, so this shipped with zero visible
  reordering of the original 98 products).
- PocketBase's unset `number` fields come back as `0`, not `null` — `lib/public-data.ts`
  normalizes `standbyKva`/`primeKva`/`weightKg` back to `null` so `ProductCard`'s fallback
  logic (e.g. Ricardo's combined rated-output spec) still works correctly.

## Open items

- Real client logos still needed for the "Our Clients" section.
- Task 7 (frontend deployment prep) — see the `/deploy` skill when ready.
- Task 15 (invoices) — fields not finalized with the user; `invoices.items` is a JSON blob
  until that's decided.
- Task 16 (PocketBase VPS deployment) — not started; `POCKETBASE_URL` env var is unset
  everywhere (defaults to `http://127.0.0.1:8090`), will need setting once this ships.
- Admin CRUD flows (brands/power-bands create/edit/delete, home-placement add/reorder/
  delete, the home-section limit UI) were built and spot-verified against the real
  PocketBase but not fully click-tested end-to-end in a browser in every session — worth a
  pass if anything looks off in daily use.

## design-task.md — cube-motion + craft polish pass (2026-09-22, compacted 2026-09-22)

All 12 items complete and stable; `design-task.md` is fully checked off. Compacted per
`memory.md`'s own compaction convention (whole phase done and stable) — `git log` has the
session-by-session detail if ever needed. Summary of what shipped:

- Installed `cube-motion` (zero-dep WAAPI animation lib: `rise`, `leave`, `morph`, `reveal`).
  Installed package's `package.json` attributes to "Daniel Belyi"/`Danilaa1/cube-motion`, not
  the "Daniel White"/`danielwh2` repo `cube-motion.md` cites — API surface matches exactly,
  not treated as blocking.
- `components/nav.tsx`: mobile menu mount/unmount → `Rise`; hamburger↔X icon → `Morph`.
- `components/products-browser.tsx`: `FilterGroup` option lists and the mobile filter
  `<aside>` → `Rise`/`leave` (desktop `<aside>` stays a separate always-rendered sibling,
  same split pattern as nav's mobile/desktop link lists). Product grid re-renders with
  `Rise targets="children"` keyed on the brand/band filter selection (deliberately excludes
  `currentPage` — pagination clicks must not retrigger the entrance). Active-filter-count
  badge uses a hand-rolled `MorphCount` (core `morph()`, not the boolean `Morph` component,
  since the badge cycles arbitrary integers, not two fixed faces).
- `components/product-card.tsx`: `tabular-nums` on the kVA/weight/fuel-tank figures.
- `app/(site)/page.tsx`: Home hero (badge/heading/subtext/CTA) → mount `Rise`; "Why Choose
  Us"/Featured Models/Services card grids → scroll-triggered `Reveal`.
- `components/new-products-carousel.tsx`: section-entrance `Reveal` on the scroll-snap track
  (the horizontal slide-to-slide paging itself stays native CSS scroll-snap — out of
  cube-motion's scope per its own docs).
- Admin (`components/admin/delete-filter-button.tsx`, `brands-manager.tsx`,
  `power-bands-manager.tsx`, `home-placement-manager.tsx`): imperative `leave()` before row
  deletion; `Rise` on add/edit form panels; edit-row toggle uses the "remount via changed
  key" trick (same technique as the product-grid rise) since a `<tr>` can't cleanly hold two
  coexisting display/edit variants.
- `delete-product-button.tsx` / `delete-filter-button.tsx`: replaced `window.confirm()` with
  an inline two-click `Morph` confirm state (3s auto-reset, disarms on blur).
- Craft polish: `ring-1 ring-inset` outlines on the three unbounded product/hero photos,
  `rounded-t-2xl` on `product-card.tsx`'s image div (nested-radius fix), hover-transition
  audit (all clean, no changes needed), `html` background rule added alongside `body`'s in
  `app/globals.css` (overscroll-color fix).
- **Verification gap** (still open): the admin-list changes (item 10) and delete-confirm
  buttons (item 11) were checked via `tsc`/`eslint`/`next build` and manual diff review only
  — never click-tested live, because no PocketBase superuser session/credentials were
  available in that environment. Worth a real click-test next time `/admin` is touched with
  credentials on hand.

## Session — 2026-09-22 — rework-tasks.md created, docs decluttered, live-site feedback intake

- What was done: client feedback arrived (`pbb-feedback-and-development-breakdown.md`, the
  full AWTOMATIG post-launch scope doc) plus Khalid's own tracker screenshots (PBB-01
  through PBB-19 cards). Broke the combined scope into `rework-tasks.md`: two owners
  (`khalid` for schema/backend/financial-calculation work, `ashikul` for content edits and
  admin-UI data entry once Khalid's schema piece is merged — Khalid confirmed this split and
  the sequencing rule explicitly, not assumed), sprint-grouped per the feedback doc's section
  8, IDs matched to the tracker card titles so progress can be copied straight back into
  tracker updates. Four items from the feedback doc (PBB-05, 07, 13, 14) aren't in the
  tracker screenshots — included anyway per Khalid's explicit call, flagged in the file so he
  can check whether they exist elsewhere in his tracker.
- Verified current codebase state before writing task descriptions (not guessed): confirmed
  phone numbers are hardcoded in `components/nav.tsx` (`PRIMARY_PHONE`, already correct) and
  `components/footer.tsx` (`PHONE` array, still has the deprecated third number) and
  `app/(site)/contact/page.tsx`; confirmed "Buy" appears in `app/(site)/page.tsx`'s
  `SERVICES` array and `app/(site)/about/page.tsx`; confirmed the Home "Our Clients" marquee
  still reuses `BRAND_LOGOS` (no real `clients` collection exists yet); read
  `pocketbase/pb_migrations/1789554839_create_products.js` and confirmed `products` has no
  `price`/`showPrice`/`condition`/`countryOfOrigin`/`controller`/gallery/brochure fields yet,
  and `data/generators.ts`'s `KvaBand` type still stops at 4 bands (no Heavy Industrial).
  These gaps are exactly why PBB-08a/09+10/12 are scoped as Khalid's schema work before
  Ashikul's data-entry half.
- Key decisions made: Khalid's two confirmed calls (recorded so they aren't re-litigated) —
  include the 4 off-tracker IDs, and use the backend/content ownership split described above.
  Also updated `CLAUDE.md`'s "Business facts" phone line (marked the third number,
  +88 (0) 1515 675401, deprecated per PBB-04) and its "Site structure" section (kVA banding,
  optional pricing, Buy→Exchange) to describe the *target* state per the feedback doc, ahead
  of implementation — treated as safe since it's documentation only and the target state is
  explicit and client-confirmed, not guessed.
- Skills invoked this session: none (the `i-have-adhd` skill from the user's global CLAUDE.md
  can no longer be invoked by the model itself — user must run `/i-have-adhd` directly).
- Files touched: `rework-tasks.md` (new), `CLAUDE.md` (business facts, site structure,
  session-workflow section), `memory.md` (this entry + compacted the design-task.md
  session-by-session log above into one summary, since that phase is complete and stable).
- Deviations from tasks.md / CLAUDE.md: none — `rework-tasks.md` follows the same convention
  `design-task.md` established for a third parallel tracking file.
- Open issues / TODOs for next session: see `rework-tasks.md`'s "Blockers" section — the
  GRAND POWER brochure file, real client logos, and the two quotation sample documents are
  all needed from Khalid before their respective tasks can start, and the invoice-fields
  decision (long-standing open item, see above) still needs to be finalized before PBB-15.
  Next actual build session should start with whichever Sprint 1 `khalid` item Khalid wants
  tackled first (PBB-01/02 is the natural first pick — nothing else depends on it, and
  several Sprint 2 items depend on it).

## Session — 2026-09-22 — PBB-01/PBB-02 (power band expansion to 1500 kVA)

- What was done: implemented the kVA range expansion. `data/generators.ts`'s `KvaBand` type
  gained `"Heavy Industrial"`; `KVA_BANDS` now reads Small/Medium/Large/Industrial
  (300-749)/Heavy Industrial (750-1500) — 5 bands total, replacing the old 4-band, 300+-cap
  scheme. `data/generators.json` reclassified the two models whose standby kVA crosses 750
  (Perkins P730B, P805B) from `Industrial` to `Heavy Industrial` — confirmed by checking
  every model's kVA against the new boundary (no Ricardo GF2 model crosses it; their
  specs.ratedOutputKwKva tops out at 625). `scripts/migrate-products.mjs`'s
  `POWER_BAND_DEFS` updated to match; also fixed a latent bug in `upsertPowerBands` where it
  only created missing bands and silently skipped updating existing ones despite the file's
  own doc comment claiming re-runs "update existing records" — it now PATCHes changed bands
  too, needed for the "Industrial" band's label/maxKva change to actually take on re-run.
  Applied the change to the local PocketBase instance directly via a new migration file
  (`pocketbase/pb_migrations/1789554844_expand_power_bands_to_1500kva.js`, with a proper
  down-migration) rather than the Node script, since it's the project's established
  convention for schema/data changes and needs no admin credentials — stopped the running
  local `pocketbase.exe serve`, ran `pocketbase.exe migrate up`, restarted `serve`, then
  verified via the REST API that all 5 power_bands records and both reclassified products
  are correct.
- Key decisions made: added a data-mutation migration (not just schema) following the
  existing `migrate((app) => {...}, (app) => {...})` pattern, since PocketBase JSVM
  migrations can manipulate records directly and this project already checks in schema
  changes this way — more consistent than relying on a re-run of the Node seed script (which
  needs superuser credentials I didn't have in this session). Also fixed stale "300+ kVA"
  copy in `app/(site)/page.tsx`'s "Full Power Range" feature blurb (now "up to 1500 kVA
  heavy industrial generators") since it would otherwise undersell the new range — in scope
  since it's the exact claim this task changes the truth of, not unrelated copy polish.
  `components/products-browser.tsx`'s `FilterGroup` and `components/admin/
  power-bands-manager.tsx` needed zero code changes — both already read bands data-driven
  (static `KVA_BANDS` import for filter options, live PocketBase `PowerBandRecord[]` for
  admin CRUD), confirming CLAUDE.md's note that this was "already true."
- Skills invoked this session: none.
- Files touched: `data/generators.ts`, `data/generators.json`, `scripts/migrate-products.mjs`,
  `pocketbase/pb_migrations/1789554844_expand_power_bands_to_1500kva.js` (new),
  `app/(site)/page.tsx`, `rework-tasks.md` (checked off PBB-01/02, updated Cycle 1 log),
  `memory.md` (this entry).
- Verification: `tsc --noEmit` clean, `next build` succeeds with no warnings, live dev-server
  check of `/products` confirms the "Heavy Industrial (750-1500 kVA)" filter renders and both
  Perkins models show the correct band; PocketBase REST API confirms all 5 `power_bands`
  records and the two reclassified `products` records.
- Deviations from tasks.md / CLAUDE.md: none.
- Open issues / TODOs for next session: **PBB-01/02 is done** — merged to `main` via PR #2
  (manually merged by Khalid on GitHub, merge commit `24235ed`) and confirmed deployed live.
  `gh` CLI was installed this session (`winget install --id GitHub.cli`) but is **not yet
  authenticated** (`gh auth status` → not logged in); needs a one-time `gh auth login` from
  Khalid (interactive browser flow) before it's usable for future PRs. Important correction:
  merging PBB-01/02 does **not** by itself unblock PBB-03b/07/08b/11 for Ashikul — each has
  its own separate Khalid prerequisite that hasn't shipped yet (3a for 3b, 8a for 8b, 9+10/12
  for 07, 9+10 for 11's pricing-adjacent layout). Ashikul stays capped at PBB-04/05/06 until
  one of those lands. Khalid's next slice candidates: PBB-03a or PBB-09+10 (PBB-08a is
  blocked on the still-missing GRAND POWER brochure file regardless). See `rework-tasks.md`'s
  Cycle 1 "Next up" note (corrected in this session — it previously overstated what PBB-01/02
  alone would unblock).

