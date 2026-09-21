# PBB Website — Project Memory

Compacted 2026-09-16. Sessions 1-18 built the full frontend (Tasks 1-6); that session-by-
session log has been pruned now that the frontend is feature-complete — use `git log` if a
past implementation detail is ever needed. This file now tracks only what a fresh session
still needs to know.

## Status

- Tasks 1-6 (project setup, base layout, Home, Products, About, Contact, responsive/SEO
  polish) are done.
- Task 7 (frontend deployment prep) has not been started.
- New scope added 2026-09-16: a CMS/admin panel (product + filter + home-section CRUD,
  invoice generation with stored PDFs), backed by **PocketBase**. See `tasks.md` for the
  new task list — execute one at a time, same as the original build.

## Durable decisions / conventions (still apply)

- Icon library: `lucide-react` only, site-wide. Don't introduce another icon set even if a
  design skill suggests one — CLAUDE.md pins this explicitly.
- Images are used on the live site (the original Session-1 "logo-only, no images" plan was
  superseded early on): hero/About use `public/generator.png`, product cards reuse it, Home
  has two logo marquees (`public/brands/*.png`), Products has a `brand-carousel.tsx` using
  `public/carousel/*.webp`.
- No em dashes in user-facing copy anywhere on the site (site-wide copy pass) — keep new
  copy consistent (commas/colons instead).
- Nav renders `public/pbb-logo.png` (not `public/logo.png`, which now only survives as the
  favicon source — the favicon needed the icon-only mark cropped without the wordmark).
- Brand palette lives in `design.md` / `app/globals.css` `@theme` tokens (`brand-*`,
  `ink-*`). Primary orange is `#ED7423` (the company's official color, rebased from the
  original logo-sampled `#F07522`).
- Home's "Our Clients" marquee section currently reuses `BRAND_LOGOS` (manufacturer logos)
  as a **disclosed placeholder** — real client logos don't exist yet. This section's name
  has flipped twice already (accuracy-driven rename to "Our Brand Partners," then reverted
  back to "Our Clients" on explicit user instruction). Don't rename it again without
  checking with the user first.
- Catalog data currently ships as static `data/generators.json`/`.ts` (98 models, bundled
  at build time, filtered client-side). The CMS work will likely replace this with
  PocketBase as the source of truth — see `tasks.md`, this needs an explicit architecture
  decision before the admin CRUD is built, not an assumed rewrite.

## CMS backend (PocketBase) — status

- **Local install**: `C:\pocketbase\pocketbase.exe` (v0.40.4), data at `C:\pocketbase\pb_data`
  — both **outside** this git repo, not tracked. Only the schema is tracked, in
  `pocketbase/pb_migrations/` inside this repo (see `pocketbase/README.md`).
- **Run command** (local dev): `C:\pocketbase\pocketbase.exe serve --migrationsDir
  "C:\Users\user\Desktop\PPB\pocketbase\pb_migrations"` — must use this flag (not a bare
  `serve`) or it won't pick up the repo's migrations. Dashboard at
  `http://127.0.0.1:8090/_/`.
- **Task 8 decided**: public pages will fetch PocketBase data at build time with ISR
  revalidation (not runtime/client-side fetching) — keeps pages static and the VPS load
  light, matches the site's existing static-generation approach. This will replace the
  `data/generators.ts` import (task 14), not remove that file's *types* necessarily, just
  its role as the data source.
- **Schema (5 collections, migrated and verified locally)**: `brands`, `power_bands`,
  `products` (relations to both, plus a `specs` JSON field for the brand-specific spec
  columns that already existed in `data/generators.ts`'s `GeneratorSpecs`), `home_placements`
  (section = `new_products`/`featured_models`, relation to a product, `sortOrder` — this is
  what admin task 13 will manage), `invoices` (admin-only, no public list/view rule, since it
  holds customer data — the only collection locked down that way). All five apply cleanly
  from a fresh `pb_data`; verified via `curl` that the four public collections return 200 on
  `/api/collections/<name>/records` and `invoices` returns 403 without auth.
- Field types/options came from PocketBase's own bundled `pb_data/types.d.ts` (read directly
  rather than guessed), so the migration JS matches PocketBase 0.40.4's actual JSVM API
  (`new Collection({...})`, `migrate((app) => {...}, (app) => {...})`).

## Task 9 — product data migration (done)

- `scripts/migrate-products.mjs` (repo root) imports `data/generators.json` into
  PocketBase: upserts the 6 brand records (order/slugs matching `data/generators.ts`'s
  `BRANDS`) and the 4 power-band records (thresholds matching CLAUDE.md's banding), then
  creates/updates all 98 `products` records with real `brand`/`powerBand` relation ids
  (not free text). Uses Node's built-in `fetch` only, no new npm dependency, to keep with
  the project's minimal-deps convention.
- Idempotent by design: brands matched by `name`, power bands by `value`, products by
  `(brand, model)` — verified by running it twice locally; second run produced 0 new
  records (0 created / 98 updated) and left `products` at 98 total.
- Run via `npm run migrate:products` with `POCKETBASE_ADMIN_EMAIL` /
  `POCKETBASE_ADMIN_PASSWORD` env vars set to a PocketBase superuser (the user already has
  one: `khalidh.awtomatig@gmail.com`, created when PocketBase was first set up in task 8 —
  this same account is the natural choice to authenticate the task 10 admin login, so no
  new superuser was created). `POCKETBASE_URL` env var overrides the default local URL for
  when this needs to be re-run against the VPS after task 16.
- Brands collection has only the 6 full-catalog brands (script only creates brands
  actually referenced in `generators.json`). User confirmed 2026-09-16: CAT and Doosan
  are **not** needed in `brands` — skip them, don't add logo-only brand records later.
- Ran the script locally end-to-end and confirmed via the PocketBase REST API
  (`/api/collections/products/records?expand=brand,powerBand`) that relations resolve and
  `totalItems` is 98.

## Task 10 — admin foundation (done)

- **Restructured `app/`** to give the admin section its own chrome, separate from the public
  site's `Nav`/`Footer`: public pages moved into a route group, `app/(site)/` (`page.tsx`,
  `products/`, `about/`, `contact/`), with `app/(site)/layout.tsx` now owning `Nav`/`Footer`
  (moved out of the root layout). Root `app/layout.tsx` is now just html/body/fonts/metadata
  and renders `{children}` directly — no route-visible change (route group folders don't
  affect URLs), verified all four public pages still return 200 and render `Nav`/`Footer`.
- **Auth talks to PocketBase's REST API directly, no `pocketbase` SDK dependency** — same
  choice task 9's migration script made (`/api/collections/_superusers/auth-with-password`
  and `/api/collections/_superusers/auth-refresh`), kept for consistency and to avoid a new
  dependency. Lives in `lib/pocketbase.ts`.
- **Session = the raw PocketBase JWT in an httpOnly cookie** (`pb_admin_auth`, `lib/session.ts`,
  name shared via `lib/auth-cookie.ts` so `proxy.ts` doesn't need to import `next/headers`
  code). No separate app-level session encryption (no `jose`/`SESSION_SECRET`) since
  PocketBase's own token is already a signed JWT — `lib/auth.ts`'s `verifyAdminSession()`
  (React `cache()`-wrapped, per the Next.js DAL pattern) validates it against PocketBase's
  `auth-refresh` endpoint on every protected request rather than trusting the cookie's mere
  presence. Deliberately does **not** rewrite the cookie on refresh (Next 16 forbids
  `cookies().set()` outside a Server Action/Route Handler, so no sliding-expiry — session
  lives until the cookie's own 7-day `maxAge` or the PocketBase token's own expiry, whichever
  is first).
- **This Next.js version (16.3.5) renamed `middleware.ts` to `proxy.ts`** (confirmed by
  reading `node_modules/next/dist/docs` per this project's own instructions — `middleware.js`
  is documented as deprecated). `proxy.ts` at the repo root does the *optimistic* check
  (cookie presence only, matcher `/admin`, `/admin/:path*`) and redirects to `/admin/login`;
  the real check against PocketBase happens in the protected layout, matching the two-tier
  pattern the Next.js authentication guide recommends.
- **Route layout**: `app/admin/login/` (public, own centered-card UI, no admin chrome) +
  `app/admin/(protected)/` (route group; `layout.tsx` calls `verifyAdminSession()` and
  renders `components/admin/admin-nav.tsx`, `page.tsx` is a placeholder dashboard). Login
  form is a client component (`app/admin/login/login-form.tsx`) using `useActionState` against
  a `"use server"` `login` action in `app/admin/actions.ts` (also holds `logout`, invoked
  directly as a `<form action={logout}>` from `AdminNav`).
- `AdminNav` reuses `design.md`'s `ink`/`brand` tokens only (dark `ink-900` bar, `brand-500`
  "Admin" badge) — no new theme, no new icon library (still `lucide-react`). Its nav-links
  array currently has only "Dashboard"; deliberately didn't add Products/Filters/Home-curation
  links yet since those routes don't exist until tasks 11-13 (avoids dead links).
  `verifyAdminSession()` is called again in the dashboard page on top of the layout — safe,
  React's `cache()` dedupes it to one PocketBase call per request.
- **Verified against the real local PocketBase** (not mocked): built (`next build`, all
  routes resolve, `/admin` is correctly dynamic `ƒ` while public pages stay static `○`), then
  ran the dev server and used `curl` to confirm: unauthenticated `/admin` → 307 to
  `/admin/login`; `/admin/login` with *any* cookie present → 307 to `/admin` (proxy's
  optimistic check); `/admin` with a **forged/invalid** cookie value → still 307 to
  `/admin/login`, proving the layout's real PocketBase-backed check (not just cookie
  presence) is what actually gates access; all four public pages still 200 with `Nav`/`Footer`
  present; `/admin/login` has no public nav bleeding through. Did not test a real successful
  login end-to-end (don't have the superuser password) — user should smoke-test signing in
  with their PocketBase superuser account (`khalidh.awtomatig@gmail.com`, see task 9's note)
  before relying on this.
- Files touched: `app/layout.tsx`, new `app/(site)/layout.tsx` + moved `page.tsx`/`products/`
  `about/`/`contact/` under it, new `lib/auth-cookie.ts`, `lib/pocketbase.ts`, `lib/session.ts`,
  `lib/auth.ts`, `proxy.ts`, `app/admin/actions.ts`, `app/admin/login/page.tsx` +
  `login-form.tsx`, `app/admin/(protected)/layout.tsx` + `page.tsx`,
  `components/admin/admin-nav.tsx`.
- Found (and stopped, since it was stale/superseded by this session's testing) a `next dev`
  server already running in the background on port 3000 from an earlier session — worth
  knowing a stray dev server can persist across sessions on this machine.

## Task 11 — admin products CRUD (done)

- New `lib/products.ts`: server-only data layer for the `products`/`brands`/`power_bands`
  collections, same no-SDK REST-via-`fetch` convention as `lib/pocketbase.ts` and
  `scripts/migrate-products.mjs`. All calls take the raw PocketBase superuser token (from
  `getAdminSessionToken()`) as the `Authorization` header — since `products`/`brands`/
  `power_bands` have `createRule`/`updateRule`/`deleteRule: null` (superuser-only via API,
  per the task-8 migration files), the admin session's superuser token already has full
  write access; no separate PocketBase API rules were added or changed. `listProducts()`
  supports `page`/`perPage`/`search` (search does a `model ~ "..."` filter, with quotes/
  backslashes escaped since it's string-interpolated into PocketBase's filter query param,
  not parameter-bound like the JS SDK's `pb.filter()` would do). `productImageUrl()` builds
  the `/api/files/products/{id}/{filename}` URL PocketBase serves file fields from.
- New `app/admin/(protected)/products/actions.ts` (`"use server"`): `createProductAction`,
  `updateProductAction(id, ...)` (bound via `.bind(null, id)` when wired to the edit form's
  `useActionState`), `deleteProductAction(id)`. All three build a fresh `FormData` from the
  submitted form (not the raw one) so numeric/JSON fields get validated/normalized before
  hitting PocketBase: empty number fields are omitted (not sent as `""`), `specs` textarea
  JSON is parsed and re-serialized (returns a form error on invalid JSON), `isActive`
  checkbox becomes `"true"`/`"false"` strings, and the image `File` is only forwarded if
  non-empty (a `removeImage` checkbox sends `image: ""` instead to clear an existing file,
  which is PocketBase's documented way to clear a single-file field). Create/update redirect
  to `/admin/products` on success (fresh request, no caching concern); delete does not
  redirect (used inline from a table row) so it calls `revalidatePath("/admin/products")`
  instead.
- New `components/admin/product-form.tsx` (client): single form shared by create/edit,
  `useActionState` same pattern as `login-form.tsx`. Handles all `products` fields including
  a raw JSON textarea for the brand-specific `specs` blob (pretty-printed via
  `JSON.stringify(specs, null, 2)` when editing) rather than building per-brand structured
  inputs — deliberate, since spec columns vary by brand and a generic JSON editor avoids a
  much larger schema-aware form for a site this size.
- New `components/admin/delete-product-button.tsx` (client): confirm() + `useTransition`
  wrapping `deleteProductAction`. Takes an optional `redirectTo` — the products list page
  uses it without one (stays on the page, relies on the action's `revalidatePath`), the edit
  page passes `redirectTo="/admin/products"` (via `router.push` after an async transition,
  React 19's async-transition support) since deleting the product currently being edited
  can't sensibly stay on that page.
- New routes: `app/admin/(protected)/products/page.tsx` (list, table with thumbnail/brand/
  power band/standby kVA/active badge, search-by-model box, numbered pagination via
  `?page=`), `.../products/new/page.tsx`, `.../products/[id]/edit/page.tsx` (404s via
  `notFound()` if the id doesn't resolve). All three use the Next 16 `PageProps<'/route'>` /
  typed-params helper already established by `LayoutProps<"/admin">` in task 10's layout.
- `components/admin/admin-nav.tsx`: added a "Products" link (`Package` icon); active-state
  check changed from exact `pathname === href` to `startsWith` for non-root links so it stays
  highlighted on `/admin/products/new` and `/admin/products/[id]/edit`. Dashboard
  (`app/admin/(protected)/page.tsx`) placeholder copy replaced with a real "Products" card
  linking into the section.
- No `next/image` remote pattern was configured for the PocketBase file URLs — admin image
  thumbnails/previews use plain `<img>` tags (`eslint-disable-next-line @next/next/no-img-element`),
  deliberate for this internal-only, small-scale admin tool rather than adding
  `images.remotePatterns` config for a host that may still change before task 16's VPS
  deployment.
- Verified: `next build` succeeds, all three new routes are dynamic (`ƒ`, expected — they
  read cookies/searchParams), public routes unaffected. Confirmed field shapes against the
  **real local PocketBase** via `curl` (`GET /api/collections/products/records?expand=...`)
  before writing `lib/products.ts`'s types. Ran the dev server and curl-verified
  unauthenticated `GET` on `/admin/products`, `/admin/products/new`, and
  `/admin/products/<real-id>/edit` all 307-redirect to `/admin/login` (same reject-path
  verification approach as task 10, since this session also didn't have the superuser
  password for a full authenticated click-through).

## Task 12 — admin filters CRUD (done)

- Scale-appropriate design decision: unlike products (98 records, separate list/new/edit
  pages), brands (6) and power bands (4) are managed on a **single page**
  (`/admin/filters`) with inline add/edit forms rather than dedicated routes per record —
  no pagination/search needed at this size, and it avoids proliferating near-empty admin
  routes. Each manager component (`BrandsManager`, `PowerBandsManager`) keeps client state
  for which row is being edited and whether the "add new" form is open; the add form
  remounts via a `key` bump on success to reset its uncontrolled inputs.
- `BrandForm`/`PowerBandForm` (`components/admin/`) use the same `useActionState` pattern
  as `product-form.tsx`, plus a `useEffect` that watches `pending` transitioning true→false
  with no error to fire an `onSuccess` callback (closes the edit row / collapses the add
  form) — there's no server-side redirect to signal completion since everything stays on
  one page, so this transition-edge-detection is how the UI knows a submit succeeded.
- Extracted `describePbError` (PocketBase 400-body → readable message) out of
  `app/admin/(protected)/products/actions.ts` into `lib/pb-error.ts` since
  `app/admin/(protected)/filters/actions.ts` needed the identical logic — both action
  files now import it.
- `lib/products.ts` gained `createBrand`/`updateBrand`/`deleteBrand`,
  `createPowerBand`/`updatePowerBand`/`deletePowerBand`, and `brandLogoUrl()` (same
  `/api/files/{collection}/{id}/{filename}` pattern as `productImageUrl`). `BrandRecord`
  gained a `logo: string` field (the migration always had a `logo` file field on `brands`;
  it just wasn't exposed in the type/UI until now). Brand logo upload/remove reuses the
  same file-input + "remove current" checkbox pattern as the product image field.
- **Delete now surfaces PocketBase errors in the UI**, unlike `deleteProductAction` (which
  ignores `res.ok`): `deleteBrandAction`/`deletePowerBandAction` throw on a non-OK response,
  and a new shared `components/admin/delete-filter-button.tsx` catches it and shows an
  inline message. This matters more here than for products because `products.brand` and
  `products.powerBand` are required relations with `cascadeDelete: false` (set in task 8's
  migrations) — deleting a brand/power band that's still referenced by a product will 400,
  and the admin needs to see why rather than have it fail silently.
- Added a "Filters" link to `AdminNav` and a second dashboard card on `/admin` (next to
  Products), both reusing existing icons/tokens (`SlidersHorizontal`, `design.md` palette).
- Files touched: `lib/products.ts`, new `lib/pb-error.ts`,
  `app/admin/(protected)/products/actions.ts` (now imports `describePbError` instead of
  defining it), new `app/admin/(protected)/filters/actions.ts` + `page.tsx`, new
  `components/admin/brand-form.tsx`, `power-band-form.tsx`, `brands-manager.tsx`,
  `power-bands-manager.tsx`, `delete-filter-button.tsx`, `components/admin/admin-nav.tsx`,
  `app/admin/(protected)/page.tsx`.
- Verified: `next build` succeeds, `/admin/filters` is dynamic (`ƒ`) like the other admin
  routes, public routes unaffected. Confirmed against the real local PocketBase: `GET
  /api/collections/brands/records` and `/power_bands/records` return the expected 6/4
  records (all brand `logo` fields currently empty, as expected — no logos uploaded yet).
  Same reject-path curl verification as tasks 10/11 (no superuser password available this
  session): unauthenticated and forged-cookie requests to `/admin/filters` both 307 to
  `/admin/login`. Did **not** click-test the authenticated create/edit/delete flow in a
  browser — user should smoke-test brand and power-band CRUD (including logo upload/remove
  and the delete-blocked-by-referenced-product error path) before relying on it, same as
  they did for task 11's products CRUD. Left the dev server running on port 3000 at the end
  of this session for that purpose.
- **User hit a runtime error in-browser on first load, fixed same session**:
  `/admin/filters` crashed with "Functions cannot be passed directly to Client Components"
  — the first cut passed `brandLogoUrl` (a plain function from `lib/products.ts`) as a prop
  from the server `page.tsx` into the client `BrandsManager`. Fixed by computing a plain
  `Record<brandId, url|null>` map server-side in `page.tsx` and passing that data instead
  of the function; `BrandsManager` now does `logoUrls[brand.id]` lookups. Lesson: a
  function from a server-only lib module can't cross into a `"use client"` component as a
  prop, even with no server-only side effects — only plain serializable data (or a
  `"use server"` action) can cross that boundary. `next build` and the dev server were both
  re-verified clean after the fix, and the user confirmed in-browser 2026-09-16 that
  `/admin/filters` now loads without the crash.

## Task 13 — admin home-page curation CRUD (done)

- New `home_placements` collection (from task 8's migration) has a unique `(section,
  product)` index and a plain `sortOrder` number — no ordering helper on the PocketBase side,
  so ordering logic lives entirely in the admin app.
- `lib/products.ts` gained `HomeSection`, `HomePlacementRecord` (`id`, `section`, `product`,
  `sortOrder` — deliberately **no** `expand` on this type: rather than relying on PocketBase's
  nested `expand=product.brand` syntax, `/admin/home`'s page component fetches the full
  `products` list separately (already expanding `brand`) and builds a plain `productsById`
  map, then looks up each placement's product/brand/image from that map. Simpler and reuses
  data already being fetched, avoids a second unverified expand shape) plus
  `listHomePlacements`/`createHomePlacement`/`updateHomePlacement`/`deleteHomePlacement`
  following the same no-SDK `pbAuthedFetch` convention as the rest of the file.
- New `app/admin/(protected)/home/actions.ts`: `addHomePlacementAction(section, ...)`
  computes `sortOrder` as "count of existing placements in that section" (append-at-end) by
  re-listing all placements server-side on every add — fine at this scale (a curated handful
  of items per section, not the full 98 products). `moveHomePlacementAction(section, id,
  "up"|"down")` re-lists, sorts by `sortOrder`, finds the adjacent item, and **swaps their
  two `sortOrder` values** via two parallel PATCHes — no drag-and-drop library, just up/down
  buttons, consistent with the project's minimal-deps convention.
  `deleteHomePlacementAction(id)` mirrors `deleteBrandAction`'s throw-on-failure shape so the
  UI can surface PocketBase errors.
- New `components/admin/home-placement-manager.tsx` (client), one instance per section
  (`new_products` / `featured_models`), reusing `DeleteFilterButton` for delete. The "add a
  product" form is a single `<select>` (grouped implicitly by brand sort order, not
  `<optgroup>`) built from products that are **active** and **not already placed in this
  section**; after a successful add it remounts via a `key` bump (same
  wasPending-ref-detects-success-edge pattern as `BrandForm`/`PowerBandForm`) so the
  uncontrolled select resets to its placeholder.
- Design decision: task 13 only builds the admin CRUD for `home_placements` — it does **not**
  wire the actual public Home page (`app/(site)/page.tsx`) to read from this collection yet.
  That page still computes `featuredModels`/`newProducts` from the static
  `data/generators.ts` import, exactly as before. Wiring the public site to PocketBase
  (including making Home read `home_placements` instead of its current "first N per brand"
  logic) is explicitly task 14's job, not this one — don't conflate them.
- Added a "Home Page" link to `AdminNav` (`Home` icon, after Filters) and a third dashboard
  card on `/admin`, matching the Products/Filters card style.
- Files touched: `lib/products.ts`, new `app/admin/(protected)/home/actions.ts` + `page.tsx`,
  new `components/admin/home-placement-manager.tsx`, `components/admin/admin-nav.tsx`,
  `app/admin/(protected)/page.tsx`.
- Verified: `next build` succeeds, `/admin/home` is dynamic (`ƒ`) like the other admin
  routes, all public routes and the existing `/admin/products`, `/admin/filters` routes
  unaffected (spot-checked all return their expected status codes). Same reject-path
  verification as tasks 10-12 (still no superuser password available this session):
  unauthenticated request to `/admin/home` gets a 307 from the proxy's optimistic cookie
  check; a request with a forged/invalid `pb_admin_auth` cookie also 307s, proving the
  protected layout's real PocketBase-backed `verifyAdminSession()` check (not just cookie
  presence) is what gates it. Confirmed via unauthenticated `curl` against PocketBase
  directly (both `products` and `home_placements` have public `listRule`/`viewRule`) that the
  `home_placements` collection is currently empty (0 records, as expected — nothing curated
  yet) and that products correctly return with `expand=brand` populated. Did not click-test
  the authenticated flow myself (no superuser password this session), but the **user
  confirmed in-browser 2026-09-16** that `/admin/home` renders correctly when signed in:
  placements list with thumbnails/brand/model, reorder and delete icons, and the "Add a
  product" picker all display as expected for both sections. Left the dev server running on
  port 3000 for that check.

## Open items

- Real client logos still needed for the "Our Clients" section (swap into the
  `BRAND_LOGOS` reuse in `app/(site)/page.tsx` when supplied).
- Task 7 (frontend deployment prep) not started — see the `/deploy` skill when ready.
- Invoice fields not yet finalized with the user — the `invoices` collection's `items` field
  is deliberately a JSON blob for now so task 15 can nail down the real shape without a
  schema rewrite.
- Task 12: the initial-load crash is confirmed fixed (`/admin/filters` renders correctly).
  The create/edit/delete actions themselves (both brands and power bands, including logo
  upload/remove and the "delete a brand/band still used by a product" error path) haven't
  been separately click-tested yet — worth a pass if anything looks off in daily use.
- Task 13: admin `home_placements` CRUD is built and confirmed rendering correctly in-browser
  by the user (see above). The add/reorder/delete actions themselves weren't separately
  exercised in that check (screenshot showed existing placements displaying correctly, not a
  full click-through) — worth a pass if anything looks off in daily use, same as the task
  11/12 caveats.
- Task 14 (wire the public site to PocketBase, including making Home actually read
  `home_placements`) not started yet — task 13 only built the admin side.

## Task 14 — wire the public site to PocketBase (done)

- New `lib/public-data.ts`: public (unauthenticated) data layer for `/` and `/products`,
  reading `products`/`home_placements` straight from PocketBase's REST API with no token
  (all four collections have `listRule`/`viewRule: ""`, confirmed via unauthenticated
  `curl` before writing this). Uses `fetch(..., { next: { revalidate: 300 } })` instead of
  `lib/products.ts`'s `cache: "no-store"` — this is what gives task 8's ISR architecture
  its teeth: both `app/(site)/page.tsx` and `app/(site)/products/page.tsx` are now `async`
  Server Components with `export const revalidate = 300`, and `next build` confirms both
  still prerender as static (`○`) with a 5-minute revalidate window, not `ƒ` dynamic.
  `getPublicGenerators()` only returns `isActive = true` products (PocketBase filter query
  param) — inactive/draft products the admin has toggled off no longer show on the live
  site, whereas the admin list (`lib/products.ts`) intentionally shows all of them.
- **Found and fixed a real data bug while wiring this up**: PocketBase stores unset number
  fields as `0`, not `null` (the admin's `createProductAction`/`updateProductAction` just
  omit empty numeric fields from the FormData rather than sending null, per task 11's
  notes, and PocketBase's own zero-value for an unset `number` field is `0`). Confirmed via
  curl against real records: Ricardo's `standbyKva`/`primeKva` (which only has a combined
  `specs.ratedOutputKwKva` rating, not separate standby/prime) came back as `0`, and
  several Cummins `weightKg` also `0`. `ProductCard`'s `getHighlight()` checks
  `model.standbyKva !== null` to decide whether to fall back to
  `specs.ratedOutputKwKva` — with raw `0` instead of `null` this would have rendered
  "0 kVA Standby Output" on every Ricardo card instead of falling back correctly.
  `public-data.ts`'s `toGeneratorModel()` normalizes `standbyKva`/`primeKva`/`weightKg`
  through a `zeroToNull()` helper (no real generator has a 0 kVA rating or 0 kg weight) to
  restore the `null`-based fallback contract `ProductCard`/`ProductsBrowser` already
  depend on. Verified post-fix via curl against the running dev build that Ricardo's
  `GF2-100KW` now serializes with `standbyKva: null, primeKva: null` on `/products`.
- Home's "New Products"/"Featured Models" sections now read `home_placements` via
  `getHomeSections()`, replacing the old inline "N per brand" logic that lived in
  `app/(site)/page.tsx`. That logic wasn't deleted, just moved: it's now the **fallback**
  `getHomeSections()` uses per-section when a section has zero curated placements, so the
  page can't ship visibly empty before the admin curates it. Turned out to be low-stakes at
  verification time: `home_placements` already had 4 real records (2 `new_products`, 2
  `featured_models`) from the user's task 13 smoke-test, confirmed rendering correctly on
  `/` in this session (curl-grepped the built HTML for those exact model names).
- **Deliberately left static / out of scope**: `BRANDS`/`KVA_BANDS` in `data/generators.ts`
  are still hardcoded constants, not read from PocketBase's `brands`/`power_bands`
  collections, and `components/brand-carousel.tsx` and the Home marquees still key off
  `BRANDS` to look up local `/brands/*.png` and `/carousel/*.webp` asset files. Rationale:
  those images only exist for the 6 hardcoded brands, admin's brand CRUD (task 12) has no
  way to supply new carousel art, and the task's own wording ("replace the static
  `data/generators.ts` read... with live data") is about the *catalog*, not the filter
  chrome. If a brand is ever added/renamed via `/admin/filters`, the Products page's
  brand/kVA-band filter checkboxes and the carousels will silently drift out of sync with
  PocketBase until someone updates `BRANDS`/`KVA_BANDS` by hand — worth revisiting if that
  ever actually happens, but not done preemptively here.
- Cleaned up `data/generators.ts`: removed its `import raw from "./generators.json"` and
  `export const generators = ...` now that nothing reads the static array anymore (grepped
  first to confirm no other importer used it) — the module is now types/UI-constants only
  (`Brand`, `KvaBand`, `GeneratorModel`, `GeneratorSpecs`, `BRANDS`, `KVA_BANDS`).
  `data/generators.json` itself is untouched and still used directly (by path, not through
  the `.ts` module) by `scripts/migrate-products.mjs` as the one-time seed source.
- Files touched: new `lib/public-data.ts`, `app/(site)/page.tsx`, `app/(site)/products/page.tsx`,
  `data/generators.ts`.
- Verified: `next build` succeeds, `/` and `/products` both static (`○`) with `5m` revalidate
  in the build output, admin routes unaffected. Ran `next start` against the real local
  PocketBase (port 3100, stopped afterward) and curl-verified: `/products` shows all 98
  active models with correct counts, Ricardo's `GF2-100KW` serializes `standbyKva: null`
  (not `0`), and `/` renders exactly the 4 real `home_placements`-curated models by name
  (`JD 30 GX`, `JD120 GX` under New Products; `C170D5`, `C110D5` under Featured Models). Did
  not browser-test visually (no dev server left running this session, unlike some prior
  admin-task sessions) — worth a quick visual pass next session or whenever convenient.
- Open for next session: task 15 (invoices, fields still undecided) and task 16 (VPS
  deployment of PocketBase) are the two remaining CMS tasks; task 7 (frontend deployment
  prep) is also still outstanding from the original build. `POCKETBASE_URL` env var is
  still unset anywhere (`lib/public-data.ts` defaults to `http://127.0.0.1:8090` like the
  other PocketBase-talking modules) — will need setting once task 16 stands up PocketBase
  on the VPS, same as task 9's migration script notes.
- **Same-session follow-up**: user reported admin edits (adding a home placement, editing
  a product) took up to 5 minutes and a couple of refreshes to show on the live site. Root
  cause: `/` and `/products` only had time-based ISR (the 5-minute `revalidate` above), so
  a change had to wait out the window, and Next's stale-while-revalidate serves the old
  cached page on the *first* request after expiry while it regenerates in the background —
  hence "a few refreshes." Fixed with on-demand revalidation: every admin write action that
  can affect public-facing product data now also calls `revalidatePath("/")` and/or
  `revalidatePath("/products")` right after its existing `revalidatePath("/admin/...")` —
  `app/admin/(protected)/home/actions.ts` (add/delete/move a placement → `/`),
  `app/admin/(protected)/products/actions.ts` (create/update/delete → both, since a product
  can appear in Home's curated sections or fallback), `app/admin/(protected)/filters/actions.ts`
  (brand/power-band create/update/delete → both, since a rename changes what's displayed on
  existing product cards). The 5-minute `revalidate` on both pages is now just the fallback
  ceiling for a stale read (e.g. if a write ever happens outside these actions); real admin
  edits should reflect within one request now. Rebuilt (`next build`) to confirm `/` and
  `/products` are still static (`○`) with the same `5m` window — `revalidatePath` is a
  targeted trigger, not a config change, so this didn't turn them dynamic.
- **Same-session follow-up 2**: added a per-section cap on Home page curation (12 for New
  Products, 6 for Featured Models, per user request). New `lib/home-section-limits.ts`
  exports `HOME_SECTION_LIMITS: Record<HomeSection, number>` as the single source of
  truth — deliberately a plain constants file with no `fetch`/env code (unlike
  `lib/products.ts`) so it's safe to import as a runtime value from both the server action
  and the client component without pulling admin data-layer code into the client bundle.
  If the client ever asks for different numbers, this is the one file to edit; the server
  check and both UI displays read from it, nothing hardcoded twice.
  - Enforced server-side (source of truth, can't be bypassed) in
    `addHomePlacementAction` (`app/admin/(protected)/home/actions.ts`): counts existing
    placements for the section and returns a form error once at/over the limit, before
    ever calling PocketBase.
  - Surfaced in the admin UI two ways per the user's ask ("add this information that how
    many products can be added"): `HomePlacementManager` now shows a `{count} / {limit}
    used` badge (amber once at limit) next to each section's heading, and swaps the
    add-product form for a plain "limited to N products, remove one to add another"
    message when at limit (distinct from the pre-existing "all active products already
    placed" message, which is a different condition — catalog exhausted vs. section full).
    `app/admin/(protected)/home/page.tsx`'s per-section `description` strings also now
    interpolate `HOME_SECTION_LIMITS.new_products`/`.featured_models` directly ("Max 12
    products." / "Max 6 models.") so the cap is visible even before scrolling to the badge.
  - Files touched: new `lib/home-section-limits.ts`,
    `app/admin/(protected)/home/actions.ts`, `components/admin/home-placement-manager.tsx`,
    `app/admin/(protected)/home/page.tsx`.
  - Verified: `next build` succeeds, `/` and `/products` still static with `5m` revalidate
    (unaffected, this change is admin-only). Did **not** click-test the limit end-to-end in
    a browser (still no PocketBase superuser password available this session, same
    constraint as tasks 10-14) — only 4 `home_placements` exist right now (2 per section,
    see task 14 entry above), well under both caps, so the at-limit UI/error path is
    unexercised. Worth adding test rows up to 12/6 and confirming the badge, the swapped-in
    message, and the server-side rejection next time someone's signed in.
- **Same-session follow-up 3**: user found the manual `products.sortOrder` field in the
  admin product form confusing and asked to remove it, replace it with an admin "sort by"
  control (like the public Products page's filters), and have new products just sort by
  creation order. Asked one clarifying question (admin Products page currently has zero
  sort/filter UI, just a model search box) — user picked "sort-by dropdown only" over
  adding brand/power-band filters too.
  - **New PocketBase migration** `pocketbase/pb_migrations/1789554842_add_products_created_field.js`
    adds an `autodate` field `created` (`onCreate: true, onUpdate: false`) to `products` —
    the collection had no timestamp field at all (PocketBase 0.40.4 doesn't auto-add
    `created`/`updated`; they only exist if a migration explicitly adds them, and none of
    this project's 5 collections have them). Applied it by stopping and restarting the
    local `pocketbase.exe serve --migrationsDir ...` process (it only runs pending
    migrations on boot) and confirmed via curl: the field now exists, `sort=created`
    (previously a 400) now returns 200, and all 98 existing records show `created: ""`
    since PocketBase doesn't backfill autodate values for pre-existing rows — only records
    created **after** this migration get a real timestamp.
  - That empty-string behavior turned out to be exactly the desired continuity mechanism:
    `lib/products.ts`'s new `ProductSort` type (`"newest" | "oldest" | "model" | "brand"`)
    maps to PocketBase sort strings `-created,sortOrder,model` / `created,sortOrder,model` /
    `model,brand.name` / `brand.name,model`. Since `""` sorts before any real timestamp,
    "Newest first" (the new default) puts any future admin-added product at the very top
    and falls back to the legacy `sortOrder` (still populated 0-97 from the original
    catalog migration, just no longer admin-editable) to preserve today's existing catalog
    order underneath it — so this shipped with **zero visible reordering** of the current
    98 products, only new ones behave differently. `sortOrder` field itself was
    deliberately left in the PocketBase schema (not dropped via migration) since it's
    still load-bearing as that tie-breaker; it's just no longer exposed as an editable
    admin field. **Discovered while implementing**: PocketBase 0.40.4's `sort=` param does
    support one level of relation dot-notation (`sort=brand.name`), confirmed by curl
    against the live 98-record catalog (grouped correctly: Cummins, Deutz, John Deere,
    Perkins, Ricardo, Volvo Penta — real alphabetical order) — this was the pleasant
    surprise that made "Brand (A–Z)" possible as a genuine server-side sort instead of
    needing a client-side sort workaround.
  - `app/admin/(protected)/products/page.tsx`: added a "Sort by" `<select>` (Newest first /
    Oldest first / Model A–Z / Brand A–Z) into the same GET form as the existing model
    search box, with an explicit "Apply" submit button (kept it a plain Server Component,
    no client JS, consistent with the rest of this page — deliberately did not add
    auto-submit-on-change, which would've required a client component for one dropdown).
    Pagination links now go through a `pageHref(p)` helper that carries `q` and `sort`
    (when not the default) through page changes, replacing the old inline template string
    that only carried `q`.
  - Removed the "Sort order" number input from `components/admin/product-form.tsx`
    (shared by both create and edit) and dropped `"sortOrder"` from
    `NUMBER_FIELDS` in `app/admin/(protected)/products/actions.ts`'s
    `buildProductPayload` — new products no longer send a `sortOrder` value at all
    (PocketBase defaults it to `0`, which is harmless now that it's only a tie-breaker).
  - Files touched: new `pocketbase/pb_migrations/1789554842_add_products_created_field.js`,
    `lib/products.ts`, `app/admin/(protected)/products/page.tsx`,
    `components/admin/product-form.tsx`, `app/admin/(protected)/products/actions.ts`.
  - Verified: `next build` succeeds (same route shapes as before, admin-only change).
    Curl-verified all four sort modes directly against the live local PocketBase and
    confirmed correct ordering for each (including that "Newest"/"Oldest" currently produce
    identical output, expected since all 98 records still tie on empty `created`). Did
    **not** click-test the admin UI (search + sort form, pagination carrying `sort`) in a
    browser this session (still no superuser password) — worth a look next time someone's
    signed in, and worth creating one new product then to confirm it actually floats to the
    top under "Newest first" as designed.
  - **Deployment note for task 16**: this is the first schema-changing migration added
    since task 8's initial five. When PocketBase gets stood up on the VPS, all 6 migration
    files in `pocketbase/pb_migrations/` apply in filename order on first boot — no special
    handling needed, but worth double-checking after that deploy that `products.created`
    exists there too before assuming "Newest first" works correctly in production.

## Local PocketBase install location changed (2026-09-16, outside normal task flow)

- **Correction to the task-8 note above**: the local PocketBase binary and `pb_data/` no
  longer live at `C:\pocketbase`. Per user request, they were moved into the repo folder
  itself, at `pocketbase/pocketbase.exe` and `pocketbase/pb_data/` (same machine, same
  `pb_data` contents — moved, not recreated, so all 98 products/brands/etc. are intact).
  They are still **not tracked by git**: `.gitignore` gained explicit
  `/pocketbase/pocketbase.exe`, `/pocketbase/pb_data/`, `/pocketbase/*.log` entries so this
  works safely from inside the repo. Only `pocketbase/pb_migrations/` and
  `pocketbase/README.md` are committed, unchanged from before.
- **Run command changed accordingly**: no more `--migrationsDir` flag needed. From now on,
  run PocketBase from inside the `pocketbase/` folder and it picks up the sibling
  `pb_migrations/` by default:
  ```
  cd pocketbase
  .\pocketbase.exe serve
  ```
  `pocketbase/README.md` was updated to describe this new command; the old
  `C:\pocketbase\pocketbase.exe serve --migrationsDir "..."` command no longer applies.
- **Why**: user wanted one self-contained project folder (simpler to reason about when also
  juggling other unrelated PocketBase projects on the same machine) rather than a fixed
  external path. Verified after the move: `next.exe` unaffected; started the relocated
  `pocketbase.exe` with no flags, confirmed `/api/health` returns 200 and
  `/api/collections/products/records` still returns all 98 real records, then stopped it
  again. No app code changes needed — `lib/pocketbase.ts` and friends already talk to
  `http://127.0.0.1:8090`, which is unaffected by where the binary's files live on disk.
- **Task 16 (VPS deployment) note updated**: the VPS will still get its own separate
  directory for PocketBase (a fresh install, not this local `pb_data`), so this local path
  change doesn't affect that task's plan — just corrects where to find/run PocketBase
  locally in the meantime.
