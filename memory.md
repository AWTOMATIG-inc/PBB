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

## Session — 2026-09-22 — design-task.md 1: install cube-motion

- What was done: ran `npm i cube-motion`. Verified the installed package (not just trusted
  the name) — `node_modules/cube-motion/package.json`'s description and `exports` map
  (`.`, `./react`, `./vue`, `./solid`, `./svelte`) and `dist/` (`rise`, `leave`, `morph`,
  `reveal`, `tokens`) match `cube-motion.md`'s spec exactly, and peer dependency ranges
  match (`react >=18 <20` etc.).
- Note for next session: the installed package's `package.json` lists author "Daniel Belyi"
  / repo `Danilaa1/cube-motion`, not the "Daniel White" / `danielwh2/cube-motion` that
  `cube-motion.md` cites. Functionally it's the right package (API surface matches
  exactly), so this wasn't treated as blocking, but flagging it in case that attribution
  ever matters.
- Key decisions made: none beyond the install itself.
- Files touched: `package.json`, `package-lock.json`, `design-task.md` (item 1 checked).
- Deviations from tasks.md / CLAUDE.md: none.
- Open issues / TODOs for next session: `design-task.md` item 2 (Nav mobile menu
  rise/leave + hamburger↔X morph) is next.

## Session — 2026-09-22 — design-task.md 2: Nav mobile menu motion

- What was done: `components/nav.tsx`'s mobile menu now uses `Rise` (`show={open}`,
  `targets="children"`, `as="nav"`) instead of the old `{open && (<nav>...)}` instant
  mount/unmount, so each link/the Call Us button rises in staggered and leaves before the
  node unmounts. Merged the old two nested elements (outer `<nav>` + inner flex `<div>`)
  into one, since `Rise`'s `targets="children"` needs the links to be its direct children
  to stagger them individually. The hamburger button's icon swap now uses `Morph`
  (`active={open}`, `off={<Menu/>}`, `on={<X/>}`) instead of a ternary.
- Verified for real, not just typechecked: `npx tsc --noEmit` and `npx eslint
  components/nav.tsx` both clean; then actually started the dev server and drove it with a
  headless Playwright script (chromium-cli wasn't available on this npm registry, so wrote
  a one-off `nav-test.cjs` run via `npx -p playwright node ...` with `NODE_PATH` pointing
  at npx's cached install — see that command if this needs repeating) at a 375px viewport:
  clicked the hamburger, confirmed `aria-expanded` flips true→false correctly, confirmed
  the nav fully unmounts after closing (`navElementCountAfterClose: 0`, proving `leave`
  actually completes before unmount rather than just being CSS-hidden), zero console
  errors, and visually confirmed via screenshot that the menu renders correctly open with
  the icon morphed to X.
- Key decisions made: merged the two nested nav/div elements into one Rise-rendered `<nav>`
  (see above) — no visual/behavioral change, just required by how `targets="children"`
  works.
- Skills invoked this session: none new (craft-design-engineering and i-have-adhd were
  loaded in an earlier session in this same conversation, not re-invoked here).
- Files touched: `components/nav.tsx`, `design-task.md` (item 2 checked).
- Deviations from tasks.md / CLAUDE.md: none.
- Open issues / TODOs for next session: `design-task.md` item 3 (Products filter panel:
  mobile toggle + `FilterGroup` chevron collapse, both `rise`/`leave`) is next. Playwright
  itself is still not a project dependency (deliberately, ran via `npx -p playwright` each
  time to avoid adding a devDependency for a one-off check) — if UI verification like this
  becomes routine across the remaining `design-task.md` items, worth asking the user
  whether to add it as a real devDependency instead of re-resolving it via npx every time.

## Session — 2026-09-22 — design-task.md 3: Products filter panel motion

- What was done: `components/products-browser.tsx`. `FilterGroup`'s options list (the
  per-group checkbox list under the Brand/Power Band chevrons) now uses `Rise`
  (`show={open}`, `targets="children"`) instead of `{open && (<div>...)}`. The mobile
  filter panel `<aside>` (previously one element toggled via a `mobileFiltersOpen ? "block"
  : "hidden"` class swap, with `lg:block` forcing it visible on desktop regardless of that
  state) is now split into two siblings, same pattern as `nav.tsx`'s mobile/desktop nav
  split: a `Rise as="aside"` (`show={mobileFiltersOpen}`, `targets="children"`, `lg:hidden`)
  for the animated mobile toggle, and a separate always-rendered plain `<aside>` (`hidden
  lg:block lg:sticky ...`) for desktop. Both share the same `filtersPanel` JSX const, so
  brand/band selection state stays lifted and in sync between the two DOM copies; only each
  copy's own `FilterGroup` open/collapsed UI state is independent, which matches how
  `nav.tsx` already duplicates mobile/desktop link lists.
- Verified for real: `npx tsc --noEmit` and `npx eslint components/products-browser.tsx`
  both clean. Then hit the running dev server (was already up on :3000) with a headless
  Playwright script at a 375px viewport (cached npx playwright install reused via
  `NODE_PATH`, same approach noted in the session-2 entry): opened the mobile filter panel,
  collapsed the Brand `FilterGroup` chevron (screenshot confirms chevron flips and options
  fade via `leave`), then closed the panel and confirmed via both a class-based aside query
  and a computed-style check that zero `<aside>` remains visible/mounted afterward (leave
  completes before unmount), with zero console errors throughout.
- Key decisions made: split the single conditionally-classed `<aside>` into two siblings
  (animated mobile / static desktop) rather than trying to make one `Rise` element serve
  both breakpoints, since `Rise`'s `show` prop fully unmounts on false and has no way to
  stay force-visible at a CSS breakpoint — same reasoning `nav.tsx` already used for its
  mobile vs. desktop link lists.
- Skills invoked this session: none new.
- Files touched: `components/products-browser.tsx`, `design-task.md` (item 3 checked).
- Deviations from tasks.md / CLAUDE.md: none.
- Open issues / TODOs for next session: `design-task.md` item 4 (product grid re-render on
  filter change, `rise` with `targets: "children"` and stagger — flagged in the task list as
  the single highest-impact item) is next.

## Session — 2026-09-22 — design-task.md 4: Product grid rise on filter change

- What was done: `components/products-browser.tsx`. The product grid `<div className="grid
  ...">` is now a `<Rise targets="children">`, keyed on `` `${brands.join(",")}|${bands.join(",")}` ``.
  Changing that key forces React to fully unmount/remount the grid, which retriggers
  `Rise`'s mount-time entrance (staggered ~70ms/card by cube-motion's default) for the new
  filtered set of `ProductCard`s. Deliberately did **not** include `currentPage` in the key:
  `design-task.md`'s "Explicitly out of scope" section rules out animating pagination
  page-number clicks, so paging through the same filtered set must not retrigger the rise.
- Verified for real: `npx tsc --noEmit` and `npx eslint components/products-browser.tsx`
  both clean. Then hit the running dev server at desktop width (1280px, so the always-
  mounted desktop `<aside>` filter panel is in play) with headless Playwright: clicking a
  brand checkbox produced 16 WAAPI animations (staggered entrance across the newly filtered
  cards, confirmed visually via screenshot); clicking to page 2 with no filter change
  produced 0 animations whose target was inside the grid container (the ~4 stray
  `document.getAnimations()` entries on that click were the pagination buttons' own
  `transition-colors` CSS transitions, confirmed by filtering animations to only those whose
  effect target was contained in the grid element). Zero console errors throughout.
- Key decisions made: used the React "remount via changed `key`" pattern to retrigger
  `Rise`'s mount-based entrance, rather than driving the animation with `show`/a ref +
  `useRise`/imperative `rise()` call — simpler, and matches how the library's React docs
  describe mount-triggered rise (`<Rise as="section" targets="children">` with no `show`
  prop) versus the toggle-driven `show` pattern used for the nav menu and filter panel.
- Skills invoked this session: none new.
- Files touched: `components/products-browser.tsx`, `design-task.md` (item 4 checked).
- Deviations from tasks.md / CLAUDE.md: none.
- Open issues / TODOs for next session: `design-task.md` item 5 (tabular numbers on
  `product-card.tsx`'s kVA/weight/fuel-tank figures — a craft concept, not cube-motion,
  cheap, and pairs with item 4 so numbers don't jitter in width as the grid re-flows) is
  next.

## Session — 2026-09-22 — design-task.md 5: Tabular numbers on spec figures

- What was done: `components/product-card.tsx`. Added Tailwind's `tabular-nums` utility
  (`font-variant-numeric: tabular-nums`) to the big highlight figure (kVA/kW-kVA number,
  line 58) and to the shared spec-chip `<dd>` (Engine/Weight/Fuel Tank values, line 74) so
  digits render at a fixed width instead of each digit's natural proportional width. Pairs
  with item 4's grid re-render: as filtered cards swap in different numbers, glyph widths
  stay constant instead of nudging card layout.
- Verified for real: `npx tsc --noEmit` and `npx eslint components/product-card.tsx` both
  clean. Then checked computed styles on the live dev server via headless Playwright —
  `getComputedStyle(...).fontVariantNumeric` returned `"tabular-nums"` on both the highlight
  `<p>` and a `<dd>` — confirming the Tailwind utility actually compiled and applied rather
  than just trusting the class name. Zero console errors.
- Key decisions made: applied it to all three spec chips via the shared `dd` className
  (Engine's value is alphanumeric, e.g. "3029DF128", not purely numeric) rather than only
  the two purely-numeric chips (Weight, Fuel Tank), since a per-chip conditional class would
  add complexity for no visible benefit — tabular-nums is a no-op on non-digit characters.
- Skills invoked this session: none new.
- Files touched: `components/product-card.tsx`, `design-task.md` (item 5 checked).
- Deviations from tasks.md / CLAUDE.md: none.
- Open issues / TODOs for next session: `design-task.md` item 6 (Home page scroll reveals:
  "Why Choose Us" cards, Featured Models grid, Services cards in `app/(site)/page.tsx` —
  `reveal`, staggered) is next.

## Session — 2026-09-22 — design-task.md 6: Home page scroll reveals

- What was done: `app/(site)/page.tsx`. Wrapped the three card grid `<div>`s ("Why Choose
  Us"/`WHY_US`, "Featured Models"/`featuredModels`, "Our Services"/`SERVICES`) with `Reveal`
  (`as="div"`, `targets="children"`) from `cube-motion/react` instead of a plain `<div>`, so
  each row of cards fades/rises in staggered as the section scrolls into view. `Home` is an
  async server component with no `"use client"`; this works because `Reveal`'s own module
  carries the client boundary and it's used here purely as a JSX element (children passed as
  markup, not a function prop), same pattern Next.js allows for any client component
  imported into a server component tree. New Products (`NewProductsCarousel`, item 9, not
  yet reached) and the two brand-logo marquees were deliberately left untouched: marquees
  already animate continuously via CSS and aren't card grids.
- Verified for real: `npx tsc --noEmit` and `npx eslint "app/(site)/page.tsx"` both clean
  (only 2 pre-existing `no-img-element` warnings on the brand marquees, unrelated to this
  change). Then hit the running dev server on :3000 with headless Playwright at 1280px
  width (cached npx playwright install reused via `NODE_PATH`, same approach as prior
  sessions): confirmed all three grids' cards start at `opacity: 0` before scrolling
  (reveal's pre-mount hide), scrolling each section's heading into view and waiting ~1.2s
  flips the cards in that viewport to `opacity: 1`, and screenshotted the Services section
  fully revealed. Cards below the fold in a taller grid (Featured Models' 2nd row, Services'
  5th card) correctly stayed at `opacity: 0` until scrolled to, matching `reveal`'s
  documented per-target IntersectionObserver behavior (not a whole-section fade). Zero
  console errors throughout.
- Key decisions made: used `Reveal` (client component) as a plain JSX wrapper directly
  inside the server component `Home`, no client-boundary wrapper file needed, since only
  markup is passed as children.
- Skills invoked this session: none new.
- Files touched: `app/(site)/page.tsx`, `design-task.md` (item 6 checked).
- Deviations from tasks.md / CLAUDE.md: none.
- Open issues / TODOs for next session: `design-task.md` item 7 (Home hero entrance: `rise`
  with `targets: "children"` on the badge/heading/subtext/CTA sequence, lines ~100-130) is
  next.

## Session — 2026-09-22 — design-task.md 7: Home hero entrance rise

- What was done: `app/(site)/page.tsx`. Wrapped the hero's left column (the plain `<div>`
  holding the "Bringing Energy to Your Doorstep" badge, the `<h1>`, the subtext `<p>`, and
  the CTA button row) with `Rise` (`as="div"`, `targets="children"`, no `show` prop) from
  `cube-motion/react`, same mount-triggered pattern used for item 4's product grid, so the
  four elements rise in staggered on page load instead of appearing instantly. Right-column
  hero image (`Image` with `priority`) was left untouched, matching the task's scope
  (badge/heading/subtext/CTA sequence only).
- Verified for real: `npx tsc --noEmit` and `npx eslint "app/(site)/page.tsx"` both clean
  (same 2 pre-existing unrelated `no-img-element` warnings). Then headless Playwright against
  the running :3000 dev server: navigated with `waitUntil: "domcontentloaded"` (before
  animations finish) and confirmed `document.getAnimations()` had running animations
  immediately post-mount, then waited ~1.5s and confirmed all four hero children settle at
  `opacity: 1` with no elements stuck hidden, and screenshotted the settled hero. Zero
  console errors throughout.
- Key decisions made: none beyond reusing item 4's established mount-rise pattern.
- Skills invoked this session: none new.
- Files touched: `app/(site)/page.tsx`, `design-task.md` (item 7 checked).
- Deviations from tasks.md / CLAUDE.md: none.
- Open issues / TODOs for next session: `design-task.md` item 8 (active filter count badge
  in `components/products-browser.tsx`, lines ~169-172: `morph` when the number changes) is
  next.

## Session — 2026-09-22 — design-task.md 8: Active filter count badge morph

- What was done: `components/products-browser.tsx`. The mobile filter-toggle badge (the
  small pill showing `activeCount`, e.g. "1", "2"...) now morphs its digits when the count
  changes instead of snapping instantly. The React `Morph` component/`useMorph` hook don't
  fit here: both are boolean two-state (`active`, fixed `off`/`on` faces), but this badge
  cycles through arbitrary integers as filters are toggled. Built a small local
  `MorphCount({ value })` component that ping-pongs the core `morph(outgoing, incoming)`
  function (imported from `"cube-motion"`, not `/react`) across two stacked faces, mirroring
  the layout convention `cube-motion/react`'s own compiled source uses internally for its
  boolean `Morph` (`position: relative` wrapper, `position: absolute; inset: 0; opacity: 0`
  on the inactive face, `aria-hidden` swapped each call). Text content on each face is set
  imperatively via `textContent` through refs, not React children, since letting JSX bind
  `{value}` to both faces would make React overwrite the outgoing face's stale digits on
  every re-render and defeat the crossfade/diff the library computes at call time.
- Verified for real: `npx tsc --noEmit` and `npx eslint components/products-browser.tsx`
  both clean. Then hit the running dev server on :3000 with headless Playwright (cached npx
  playwright install reused via `NODE_PATH`, same approach as prior sessions in this pass):
  toggled one filter (badge shows "1", no animation on this mount, matching "settles without
  motion on mount" per the library's own `useMorph` behavior), toggled a second filter and
  confirmed via `document.getAnimations()` filtered to elements inside the badge that real
  animations fired targeting `<cube-morph-char>` overlay elements (proof the library's actual
  per-grapheme text diff ran, not just a generic crossfade), then confirmed after settling:
  exactly one face has `opacity: 1`/`aria-hidden: false` and shows the correct final count
  ("2"), the other has `opacity: 0`/`aria-hidden: true`. Zero console errors throughout.
- Key decisions made: used the core `morph()` function directly with a hand-rolled two-face
  ping-pong instead of the `Morph` component, since `Morph`'s API is fundamentally
  boolean-only and this badge's value isn't. Set face text via imperative `textContent`
  rather than JSX children for the reason above.
- Skills invoked this session: none new.
- Files touched: `components/products-browser.tsx`, `design-task.md` (item 8 checked).
- Deviations from tasks.md / CLAUDE.md: none.
- Open issues / TODOs for next session: `design-task.md` item 9 (`NewProductsCarousel` in
  `components/new-products-carousel.tsx` — needs a read of that file first, not yet
  inspected in this pass, to decide if `morph` or scroll-based `rise` fits its slide
  transition) is next.

## Session — 2026-09-22 — design-task.md 9: NewProductsCarousel reveal

- What was done: read `components/new-products-carousel.tsx` first, as the task called for.
  It's a native CSS scroll-snap horizontal carousel (`overflow-x-auto`, `snap-x`,
  `scrollBy({ behavior: "smooth" })`), not a React state-swap slideshow: all cards stay
  mounted simultaneously, paging just scrolls the track. Neither `morph` (no off/on state
  swap to diff) nor mount/unmount `rise` (nothing unmounts between "slides") fits the
  horizontal paging itself, and per `cube-motion.md`'s own scope rules, gesture/scroll-driven
  paging belongs to native scroll-behavior, not this library. What did fit, and was still
  unaddressed after item 6: the section's entrance as the page scrolls down to it (item 6's
  session note explicitly flagged New Products as "deliberately left untouched" pending this
  item). Wrapped the scrollable track (`components/new-products-carousel.tsx`, the `<div
  ref={trackRef} onScroll={...}>` holding the `data-card` children) with `Reveal` from
  `cube-motion/react` (`as="div"`, `targets="children"`), passing `ref`/`onScroll`/
  `className` straight through since `Reveal` forwards a merged ref and spreads other props,
  same pattern `Rise` already uses elsewhere in this codebase. Each card now fades/rises in
  the first time it scrolls into the viewport, whether that's from vertical page scroll or
  from horizontally paging the carousel itself (both are real intersection events against the
  same IntersectionObserver root).
- Verified for real: `npx tsc --noEmit` and `npx eslint components/new-products-carousel.tsx`
  both clean. Then headless Playwright against the running :3000 dev server: confirmed all 7
  New Products cards start at `opacity: 0`; scrolling the section heading into view and
  waiting ~1.2s revealed exactly the cards within the horizontal viewport at that scroll
  position (4 of 7, matching the visible lg:w-[31%] columns) while the remaining 3
  (off-screen to the right inside the horizontal scroller) stayed at `opacity: 0`; clicking
  the "Next models" arrow twice progressively revealed more cards as they entered the
  horizontal viewport (confirmed via computed opacity), proving none get stuck permanently
  hidden; separately confirmed the native carousel's `scrollLeft` still moves on arrow click
  (0 → 401), so the existing prev/next paging behavior is unchanged. Zero console errors
  throughout.
- Key decisions made: applied `Reveal` to the section-entrance only, left the horizontal
  slide-to-slide paging as plain native scroll-snap, since that's explicitly out of
  cube-motion's scope (see `cube-motion.md`'s "Which function" section: gestures/scroll
  paging → "Motion or GSAP. Not this library").
- Skills invoked this session: none new.
- Files touched: `components/new-products-carousel.tsx`, `design-task.md` (item 9 checked).
- Deviations from tasks.md / CLAUDE.md: none.
- Open issues / TODOs for next session: `design-task.md` item 10 (admin lists —
  `home-placement-manager.tsx`, `brands-manager.tsx`, `power-bands-manager.tsx`: `leave`
  before row removal, `rise`/`leave` on inline add/edit forms opening) is next.

## Session — 2026-09-22 — design-task.md 10: Admin list leave/rise motion

- What was done: four files.
  - `components/admin/delete-filter-button.tsx` (shared by all three admin list managers):
    on confirmed delete, now finds the ancestor row via `e.currentTarget.closest("tr, li")`
    and awaits the core `leave()` function (imported from `"cube-motion"`, not `/react`,
    since this is an imperative DOM call, not a mounted component) on it before calling
    `onDelete()`. This delays the actual server-action deletion until the row has visually
    faded/dropped out, so by the time PocketBase revalidation removes it from the array and
    React unmounts the row, it's already invisible instead of popping out instantly. Wrapped
    in try/catch since `leave()`'s returned animations reject `finished` with `AbortError` if
    interrupted (per `cube-motion.md`); deletion still proceeds either way.
  - `components/admin/brands-manager.tsx` / `power-bands-manager.tsx`: the `showAdd` panel
    converted from `{showAdd && (<div>...)}` to `<Rise show={showAdd}>`, same pattern as
    item 3's filter panel. The editing-row ternary (`editingId === x.id ? <tr>edit form</tr>
    : <tr>display cells</tr>`) converted to `<Rise as="tr" targets="children">` on both
    branches, with the `key` changed from the bare id to `${id}-edit` / `${id}-view` so
    switching a specific row into/out of edit mode forces a real remount (retriggering
    `Rise`'s mount-based entrance), same "remount via changed key" technique item 4 used for
    the product grid. Only the row being toggled remounts; sibling rows keep a stable key and
    are untouched. `Rise`'s default `targets="self"` wasn't used here since a `<tr>` has
    multiple `<td>` children that should stagger in individually, same reasoning as item 3's
    `FilterGroup`.
  - `components/admin/home-placement-manager.tsx`: the `atLimit ? <p>message</p> : <>form
    fragment</>` swap converted to an always-rendered `{atLimit && <p>...}` message plus
    `<Rise show={!atLimit}>` wrapping the add-product form block (the bare fragment had to
    become a real element for `Rise` to wrap, matching the "merge into one element" precedent
    from item 2's nav work). This ties directly into the row-removal leave: deleting a
    placement that was at the section's cap now visibly un-limits and the add-form rises back
    in, rather than snapping into existence.
  - Per-row `<li>`/`<tr>` removal itself (not just the edit-row swap) relies entirely on the
    shared `DeleteFilterButton` change above; no separate `Rise` wrapper was added around each
    list `<li>` in `home-placement-manager.tsx`, since the imperative `leave()` call targets
    whatever row DOM node is closest regardless of whether that row's JSX happens to be
    wrapped in a `Rise` component.
- Verified for real, with one gap: `npx tsc --noEmit`, `npx eslint` (all four files), and a
  full `npx next build` are all clean (build lists `/admin`, `/admin/filters`, `/admin/home`
  etc. compiling with no errors). Could **not** do the headless-Playwright click-test used in
  every prior session in this pass, because driving `/admin` requires a logged-in PocketBase
  superuser session and this environment has no admin password available (not in `.env*`,
  not asked for). Instead did a careful manual re-read of all four diffs for structural
  correctness (JSX tag balance, `key` scoping per-row vs. shared, `Rise`'s `as`/`show`/
  `targets` props matching its documented API, `closest("tr, li")` correctly resolving from
  a button nested inside either element type). This matches `memory.md`'s pre-existing "Open
  items" note that admin CRUD flows aren't fully click-tested in every session — flagging
  explicitly here since this session's changes are less verified than the public-page ones.
- Key decisions made: used the imperative core `leave()` in `DeleteFilterButton` rather than
  restructuring each manager to hold a "pending removal" shadow list, since delaying the
  server-action call until the animation finishes is simpler and doesn't require the managers
  to diverge from their existing server-revalidated-data pattern. Used the changed-key
  remount trick for the edit-row toggle rather than a `show`-driven two-branch `Rise` pair,
  since a `<table>`'s `<tr>`/`<td>` structure doesn't cleanly support two coexisting rows for
  the same logical item (display cells vs. a colSpan form cell), unlike the FilterGroup/nav
  cases where the toggled content is genuinely additive.
- Skills invoked this session: none new.
- Files touched: `components/admin/delete-filter-button.tsx`,
  `components/admin/brands-manager.tsx`, `components/admin/power-bands-manager.tsx`,
  `components/admin/home-placement-manager.tsx`, `design-task.md` (item 10 checked).
- Deviations from tasks.md / CLAUDE.md: none.
- Open issues / TODOs for next session: this session's admin changes should get a real
  click-test in a browser once admin credentials are available (see "Verified for real"
  note above) — worth doing before/alongside whenever task 16 (PocketBase VPS deployment)
  or the next admin-touching session happens. `design-task.md` item 11 (delete-confirmation
  buttons — `delete-product-button.tsx`, `delete-filter-button.tsx`: `morph` for a
  label-swap confirm state, replacing `window.confirm()`) is next.

## Session — 2026-09-22 — design-task.md 11: Delete-confirmation buttons morph

- What was done: replaced the native `window.confirm()` dialog in both
  `delete-product-button.tsx` and `delete-filter-button.tsx` with an inline two-click confirm
  state, using cube-motion's `Morph` component (`cube-motion/react`) to swap the button's face
  from the plain trash icon to an icon + "Confirm?" label. First click arms the button
  (`confirming = true`, background turns solid red) and starts a 3s auto-reset timer; a second
  click while armed cancels the timer, resets state, and runs the existing delete logic
  unchanged (server action + optional redirect for products; `leave()` on the closest
  `tr`/`li` before `onDelete()` for filters). Losing focus (`onBlur`) also disarms it, so
  tabbing or clicking away doesn't leave a stuck "Confirm?" button. Followed the existing
  `off`/`on` `Morph` pattern already established in `nav.tsx`'s hamburger↔X icon swap rather
  than inventing a new convention.
- Key decisions made: used a real confirm-state button instead of a modal/popover, since these
  are single icon-button actions in dense admin rows/tables and a two-click affordance is
  proportionate to the size of the action. Button padding was normalized to a constant
  `px-3 py-2` in both states (was `p-2` icon-only before) so only background/text color needs
  a CSS transition; the width change from icon-only to icon+label is left entirely to
  `Morph`'s own crossfade-and-width-ease behavior rather than fighting it with a second
  padding transition. Picked a 3s auto-reset over no timeout, so an armed button left alone
  (e.g. user got distracted) doesn't stay a hair-trigger delete indefinitely.
- Skills invoked this session: none new.
- Files touched: `components/admin/delete-product-button.tsx`,
  `components/admin/delete-filter-button.tsx`, `design-task.md` (item 11 checked).
- Deviations from tasks.md / CLAUDE.md: none.
- Open issues / TODOs for next session: not click-tested in a live browser (same admin-auth
  gap noted in the item-10 session entry — no PocketBase superuser session available in this
  environment). `npx tsc --noEmit` is clean; a manual re-read of both diffs confirmed the
  confirm/cancel/delete branches and the `Morph` off/on faces are structurally correct.
  `design-task.md` item 12 (craft polish pass: image outlines, border-radius audit,
  hover-restraint audit, `<html>` background check) is next and is the last item on the list.

## Session — 2026-09-22 — design-task.md 12: Craft polish pass (final item)

- What was done, one sub-item at a time:
  - Image outlines: added `ring-1 ring-inset ring-ink-950/5` to the three generator photo
    containers that had no defined edge against a plain white/light background —
    `product-card.tsx`'s image wrapper (also used by the Home "New Products" carousel and
    "Featured Models" grid, since they all render `ProductCard`), the Home hero photo
    (`app/(site)/page.tsx`), and the About hero photo (`app/(site)/about/page.tsx`). The
    Contact page's location photo already had an explicit `border border-ink-200` and needed
    no change.
  - Nested-border-radius audit: confirmed `product-card.tsx`'s outer card
    (`overflow-hidden rounded-2xl`) already clips the flush top image corners correctly, so no
    structural fix was needed there; added `rounded-t-2xl` directly to the inner image div
    (previously unrounded, relying entirely on the ancestor's clip) so the new ring's own
    corners are drawn correctly rather than just being clipped square-then-cropped.
  - Hover-restraint audit: grepped every `transition`/`duration`/`ease` class across
    `app/` and `components/`. Every frequently-hovered control (filter checkboxes, card
    hovers, nav links, pagination, admin row actions) uses plain `transition-colors` /
    `transition-transform` with Tailwind's default ~150ms duration — no explicit slow
    `duration-*` anywhere on a high-frequency element. The only `duration-500` in the
    codebase is `brand-carousel.tsx`'s full-panel slide transform, which is correct as-is
    (a carousel panel change is infrequent and reads better slower, unlike a checkbox or
    button hover). No changes made; audit passed clean.
  - `<html>` background: `app/globals.css` only set `background` on `body`, not `html` —
    added a matching `html { background: var(--background); }` rule right above the existing
    `body` rule, so an iOS/Android overscroll bounce shows the same white instead of the
    browser chrome's default color.
- Key decisions made: extended the image-outline treatment to the About page's hero photo
  even though design-task.md's item 12 only named `product-card.tsx` and the Home hero —
  it's the exact same unlabeled-photo-on-white-background pattern, so leaving it out would
  have been an inconsistency the audit itself was meant to catch. Used `ring-1 ring-inset`
  (a box-shadow, doesn't affect layout) rather than a `border` utility, since these are
  `fill`-positioned `next/image` elements sitting inside an already-sized wrapper div and a
  `border` would shrink the image's box by the border width instead of overlaying it.
- Skills invoked this session: none new (this is the craft-design-engineering-flavored pass
  called for in `design-task.md`'s own header, but the skill itself wasn't manually invoked
  by the user this session, so per CLAUDE.md it wasn't loaded on my own initiative).
- Files touched: `components/product-card.tsx`, `app/(site)/page.tsx`,
  `app/(site)/about/page.tsx`, `app/globals.css`, `design-task.md` (item 12 checked — all
  12 items now complete).
- Deviations from tasks.md / CLAUDE.md: none, aside from the About-page extension noted above
  (judged in-scope as the same craft issue, not new scope).
- Verified: `npx tsc --noEmit` clean, `npx eslint app components` clean (only two
  pre-existing `no-img-element` warnings on the brand-logo marquees, unrelated to this
  session), `npx next build` succeeds and prerenders `/`, `/about`, `/contact`, `/products`
  as static. Not click-tested live in a browser (no dev server run this session) — the
  changes are CSS-only (a box-shadow ring, one Tailwind class, one CSS rule) with no new
  interactive logic, so the static/type/lint/build checks are reasonably strong signal, but
  worth a visual glance next time the dev server is up regardless.
- Open issues / TODOs for next session: `design-task.md` is now fully checked off — the
  cube-motion + craft polish pass described at the top of that file is complete. No specific
  next task queued from this file; check `tasks.md` for what's next in the core build, or
  ask the user what they'd like to work on.
