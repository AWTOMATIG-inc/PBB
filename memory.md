# PBB Website — Session Memory

## Session 1 — 2026-09-14 — Folder organization + Next.js scaffold + data/design setup

- **What was done:**
  - Organized the working folder: moved everything that isn't logo/catalog/CLAUDE.md
    (brochure page exports `1-4.png`, alt logo files `IMG_7623/7624.PNG`, small brand/graphic
    crops `IMG_8778/8792/8795/8796.PNG`, hero banner `Work-07-07.png`, the brochure PDF, and
    two large Illustrator `.ai` files) into a top-level `reference/` folder. These are kept
    for reference only and are **not** shipped to `public/`.
  - Scaffolded Next.js (TypeScript + Tailwind v4 + App Router + ESLint, no `src/` dir) via
    `create-next-app`. Removed the default template SVGs from `public/`, the tool's own
    nested `.git`, `AGENTS.md`, and its auto-generated `CLAUDE.md` stub (the real one at
    project root is authoritative).
  - Moved `logo.PNG` → `public/logo.png`.
  - Installed `lucide-react` per CLAUDE.md's icon convention.
  - Converted `ppb.xlsx` → `data/generators.json` + `data/generators.ts` (typed wrapper).
    98 models total (John Deere 15, Cummins 22, Ricardo 22, Perkins 23, Volvo Penta 9,
    Deutz 7 — matches Overview sheet counts). Merged the "All Models" sheet (common fields:
    brand, model, standby/prime kVA, engine, alternator, fuel tank, weight, kVA band) with
    each brand sheet's full original spec columns (matched by normalized model name) into a
    per-model `specs` object, so a future model detail view has every original brochure
    column available. The two brand-sheet-flagged OCR corrections (John Deere JD 65 GX kVA,
    Perkins "P350B"→P650B duplicate, Deutz D21B/D100B dimensions) came through with their
    `notes` field preserved — no fabricated data, corrections were already in the source
    sheet's own Notes column.
  - Extracted the brand palette from `public/logo.png` via a Pillow pixel-color histogram
    (dominant opaque colors: white, `#000000`, `#F07522`) and wrote `design.md` documenting
    a full orange (`brand`) and navy-charcoal (`ink`) tonal scale, wired into
    `app/globals.css` as Tailwind v4 `@theme` tokens (`bg-brand-500`, `text-ink-900`, etc.).
  - Removed the default `prefers-color-scheme: dark` override in `globals.css` — this is a
    single-theme (light) marketing site per CLAUDE.md's design direction, not an
    auto-dark-mode app.
  - Updated `app/layout.tsx` metadata title/description away from the "Create Next App"
    default (minimal placeholder copy; full SEO metadata is task 6).

- **Key decisions made:**
  - Non-essential brochure/marketing assets go in `reference/`, not `public/` — confirmed
    with the user. The brochure page scans (`reference/1-4.png`) do contain real generator
    product photos that could be cropped for the Products page later, but that hasn't been
    done — flagged as a future option, not acted on.
  - `create-next-app` can't target a directory named `PPB` directly (npm name lowercase
    restriction), so it was scaffolded into a temp `power-bank-bangladesh/` subfolder and
    then merged up into the project root; the subfolder's own `.git` was discarded rather
    than kept, so **the project root is currently not a git repo**.
  - Spec-column header→camelCase mapping was done with an explicit lookup table (not a
    generic slugify), because generic conversion mangled acronym headers like "P.R.P. kVA"
    into `pRPKva` — explicit mapping gives clean keys (`prpKva`, `standbyKva`, etc.).
  - Ink/charcoal dark tones are navy-tinted near-black (`#0E1113`–`#1E2327`), not pure
    `#000000`, based on sampling the brochure's dark panel backgrounds — pure black is
    reserved for reproducing the logo mark itself.

- **Skills invoked this session:** none (no frontend-design/taste skill invoked by the user
  yet — this was foundational setup, not a UI polish pass).

- **Files touched:** `reference/*` (moved), `public/logo.png`, `public/*.svg` (removed),
  `data/generators.json`, `data/generators.ts`, `design.md`, `tasks.md`, `memory.md`,
  `app/globals.css`, `app/layout.tsx`, `package.json` (lucide-react added), full Next.js
  scaffold (`app/`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, etc.).

- **Deviations from tasks.md / this CLAUDE.md, and why:** Task 1's original scope bundled
  "base layout (nav + footer)" into project setup; that was split out as task 1b and not
  built this session — the user's request this turn was specifically organize + scaffold +
  data + palette, not page/component work, so nav/footer was left for a follow-up session
  to avoid scope creep.

- **Open issues / TODOs for next session:**
  - Build shared nav + footer (task 1b) before starting the Home page.
  - Favicon is still the Next.js default (`app/favicon.ico`) — replace with a PBB mark
    derived from `public/logo.png` in task 6 (no other source image to pull from — see
    below).
  - Project root has no git repo. If the user wants version control, `git init` at
    `C:\Users\user\Desktop\PPB` still needs to happen (not done automatically since it
    wasn't asked for).

- **Resolved:** the open question about cropping `reference/1-4.png` brochure photos into
  product images is settled — **`public/logo.png` is the only image the site uses.** No
  generator photography, brand logos, or other imagery from `reference/` should be pulled
  in anywhere (Home hero, brand strip, Products cards, About, etc.). Build every page as
  typography/layout/color/icons (lucide-react) only. If a future session is tempted to add
  an image for visual interest, don't — check back with the user first, this was an
  explicit instruction.

## Session 2 — 2026-09-14 — Git init, commit, push

- **What was done:** Initialized git at the project root, committed the full scaffold from
  Session 1, added remote `origin` → `AWTOMATIG-inc/PBB` on GitHub, and pushed `main`.
- **Key decisions made:**
  - `ppb.xlsx` and `reference/` were added to `.gitignore` and excluded from the commit —
    per CLAUDE.md, the xlsx is "source material... not in this repo by default" and is
    fully captured in `data/generators.json`/`.ts`; `reference/` is 35MB of brochure
    scans/.ai files not needed to build the site. Only what the site actually uses (`app/`,
    `data/`, `public/logo.png`, config, docs) is tracked.
  - Initial push over HTTPS failed with a 403 (git was authenticating as a personal account
    without write access to the org repo). Switched the remote to SSH
    (`git@github.com:AWTOMATIG-inc/PBB.git`) — the user's SSH key authenticates directly as
    the `AWTOMATIG-inc` org, which has access — and the push succeeded.
- **Files touched:** `.git/` (initialized), `.gitignore` (added `/ppb.xlsx`, `/reference/`).
- **Open issues / TODOs for next session:** none new — same as Session 1's remaining items
  (nav/footer, favicon, and now: images are logo-only, see resolved note above).

## Session 3 — 2026-09-14 — Task 1b: base layout (nav + footer)

- **What was done:**
  - Built `components/nav.tsx` (client component): sticky white header, logo
    (`public/logo.png`, which already bakes in the "POWER BANK BANGLADESH" wordmark, so no
    duplicate text next to it), four nav links (Home/Products/About/Contact) with
    active-link highlighting via `usePathname`, a `brand-500` "Call Us" pill button
    (`tel:` link to the first listed phone number), and a mobile hamburger menu
    (lucide `Menu`/`X`) that toggles an inline dropdown panel below `md`.
  - Built `components/footer.tsx` (server component): dark `ink-900` section, 4-column
    responsive grid (1 col mobile → 2 col `sm` → 4 col `lg`) with brand/tagline, quick
    links, contact (all 3 phones as `tel:` links + email as `mailto:`), both addresses
    (Dhaka + Chattogram, verbatim from CLAUDE.md), and a copyright bar using
    `new Date().getFullYear()`.
  - Wired both into `app/layout.tsx` around `{children}` (`<Nav /> <main className="flex
    flex-1 flex-col"> <Footer />`).
  - Verified: `next build` succeeds (static, no type errors). Checked live in Chrome via
    `npm run dev` — desktop rendering confirmed correct (nav, active-link color, Call Us
    button, footer 4-column layout, real contact data). Clicked through to `/products`
    (expected 404 since that page doesn't exist yet) — confirmed Nav + Footer still render
    correctly around the Next.js 404 boundary, active-link highlighting works on the 404
    route too, no crash.
- **Key decisions made:**
  - Logo used as-is in the nav (white background works fine there); **not** reused in the
    dark footer since the logo's black wordmark strokes would vanish against `ink-900` —
    footer uses a plain white/brand-colored text lockup instead. Confirmed the logo PNG is
    RGBA/transparent (Pillow check), so this was a deliberate legibility choice, not a
    missing-asset workaround.
  - Nav links point to `/products`, `/about`, `/contact` even though those routes don't
    exist yet (tasks 3–5) — expected 404s until those pages are built; this is the normal
    task order, not a bug.
- **Skills invoked this session:** none.
- **Files touched:** `components/nav.tsx` (new), `components/footer.tsx` (new),
  `app/layout.tsx` (wired Nav/Footer around children), `tasks.md`, `memory.md`.
- **Deviations from tasks.md / this CLAUDE.md, and why:** none.
- **Open issues / TODOs for next session:**
  - Mobile-width (~375px) rendering of the hamburger menu was **not** visually confirmed
    in-browser this session — the Chrome automation tool's `resize_window` did not actually
    shrink the tab's viewport in this environment (confirmed via
    `window.innerWidth` staying at 1920 after multiple resize attempts), so screenshots at
    375px weren't obtainable. The responsive classes used (`hidden md:flex`, `md:hidden`,
    `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) are standard, already-proven Tailwind
    mobile-first patterns and desktop behavior was confirmed correct, but a real device/
    narrow-window check is still worth doing next time the browser tool is used, or via the
    OS window manually resized narrow.
  - `app/page.tsx` is still the default `create-next-app` template (broken `next.svg`/
    `vercel.svg` image references since those files were deleted in Session 1) — expected,
    task 2 (Home page) replaces it.
  - A `next dev` server may be left running on port 3000 from this session's verification
    (background process, not tied to a terminal) — if `npm run dev` refuses to start with
    "port 3000 is in use," that's why; stop it via Task Manager or
    `taskkill /PID <pid> /F` (PID was 19416 at the time of this session, but will differ on
    restart).

## Session 4 — 2026-09-14 — Task 2: Home page

- **What was done:** Replaced the default `create-next-app` `app/page.tsx` with the real
  Home page: hero (tagline pill "Bringing Energy to Your Doorstep", headline "You Believe,
  We Assure Trust", one-line summary, "Browse Generators" / "Contact Us" CTAs), a stats
  strip computed from real data (`generators.length` for model count, `BRANDS.length` +
  the two logo-only brands for brand count — not hardcoded), a brand strip (the 6 full-spec
  brands as solid pills, Caterpillar/Doosan as dashed "mention only" pills, per CLAUDE.md's
  no-fabricated-model-tables rule for those two), a 4-card "Our Services" grid (Sell/Buy/
  Rental/Service, lucide icons, one sentence each), and a dark `ink-900` bottom CTA band
  mirroring the footer's dark treatment. No images used anywhere (logo stays nav-only, per
  Session 1's resolved image policy) — every visual element is typography/color/lucide-react
  icons/layout only.
- **Key decisions made:**
  - Brand/stat counts are derived from `data/generators.ts` (`generators`, `BRANDS`) at
    build time rather than hardcoded numbers, so they stay correct if the catalog data
    changes later.
  - Caterpillar and Doosan are shown in the brand strip (dashed border, muted `ink-400`
    text) to satisfy CLAUDE.md's "brands featured" list, but visually deemphasized vs. the
    6 solid-pill brands with real spec data — signals "we carry these too" without implying
    a full model catalog exists for them.
  - Reused the existing PID-19416 background `next dev` server (from Session 3) rather than
    starting a second one — starting `npm run dev` in this session hit the same port
    conflict again and confirmed that server is still serving current code correctly via
    Turbopack HMR.
- **Verification:** `next build` succeeds (static, no type errors). Checked live in Chrome:
  hero, stats, brand strip, services grid, bottom CTA, and footer all render correctly with
  real data and correct spacing/contrast. One console error appeared in the Next.js dev
  overlay ("A tree hydrated but some attributes... `bis_skin_checked`") — confirmed as a
  browser-extension artifact (Next's own error text names this exact cause), not an app bug;
  no code change made for it.
  - Mobile-width (~375–390px) check was **attempted again** via `resize_window` and again
    did not actually shrink the viewport in this environment (`window.innerWidth` stayed
    1920 after resizing to 390×844, same failure mode as Session 3) — did not keep retrying
    per "avoid rabbit holes" guidance. Relied on the same mobile-first Tailwind patterns
    already proven in `nav.tsx`/`footer.tsx` (`grid-cols-1 sm:...`, `flex-wrap`, responsive
    padding) rather than a literal narrow screenshot.
- **Skills invoked this session:** none.
- **Files touched:** `app/page.tsx` (full rewrite), `tasks.md`, `memory.md`.
- **Deviations from tasks.md / this CLAUDE.md, and why:** none.
- **Open issues / TODOs for next session:**
  - Move on to Task 3 (Products page: listing + brand/kVA-band filtering) — this is the
    core content page and will need client-side filter state over `data/generators.ts`.
  - The mobile-viewport verification gap from Session 3 is still open (Chrome tool
    limitation, not a code issue) — if the browser tool's resize behavior is ever fixed in
    this environment, a real narrow-width pass across all pages (not just Home) would be
    worth doing once more pages exist.

## Session 5 — 2026-09-14 — Home page density pass

- **What was done:** User flagged the Home page (Session 4) as too empty. Reworked
  `app/page.tsx` without adding any images (still logo-only, per Session 1's policy) or any
  fabricated business facts (no invented "years in business"/"customers served" style
  stats):
  - Hero is now two-column on `lg:` — right column is a new "Catalog at a Glance" panel
    showing the real kVA-band breakdown (`KVA_BANDS` × counts filtered from `generators`)
    as labeled progress bars, filling what was previously empty white space.
  - Removed the old thin standalone "Stats" bar (98+/8/4) — its content was folded into the
    new hero panel instead of kept as a redundant separate section.
  - Added a "Why Power Bank Bangladesh" 4-card section (All Major Brands / Full Power Range
    / Two Locations / Full Lifecycle One Partner) — all four are facts already established
    in CLAUDE.md or derived from the dataset, not invented marketing numbers.
  - Added a "Featured Models" section: one real model per brand (`BRANDS.map(brand =>
    generators.find(...))`, 6 cards total) showing brand, model, standby kVA, engine, and
    power band, with a "View All Models" link into `/products`.
  - Restored alternating white/`ink-50` section backgrounds across the longer page for
    visual rhythm (Hero white → Brand strip white → Why Us `ink-50` → Featured Models white
    → Services `ink-50` → CTA `ink-900` → Footer `ink-900`).
- **Key decisions made:**
  - Every new number/fact on the page is either read from `data/generators.ts` at build
    time or copied verbatim from CLAUDE.md's business facts — deliberately avoided the
    "trust badge" pattern (e.g. "15+ years of experience", "500+ happy customers") since no
    such facts were supplied and CLAUDE.md prohibits inventing business data.
  - Featured Models picks the *first* model per brand in data order (not curated/sorted by
    size) — simplest deterministic selection, avoids the impression of hand-picked
    "bestsellers" that aren't a real concept for this catalog.
- **Verification:** `next build` succeeds (no type errors). Checked live in Chrome — hero
  panel bars render correct counts (23/23/23/29 across Small/Medium/Large/Industrial,
  summing to 98), Why Us and Featured Models sections both render with real data, page flows
  correctly through to footer. Same `bis_skin_checked` browser-extension console artifact
  noted in Session 4 is still present and still not an app issue. Did not re-attempt the
  known-broken `resize_window` mobile check (see Session 3/4 notes) — new sections reuse the
  same proven responsive grid patterns (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`, etc.).
- **Skills invoked this session:** none.
- **Files touched:** `app/page.tsx` (restructured), `memory.md`.
- **Deviations from tasks.md / this CLAUDE.md, and why:** none — task 2 (Home page) was
  already checked off in Session 4; this session revised its content in place rather than
  adding a new task line.
- **Open issues / TODOs for next session:** none new — same as Session 4 (Task 3: Products
  page is next; mobile-viewport tool limitation still open).

## Session 6 — 2026-09-14 — Task 3: Products page (listing + filtering)

- **What was done:**
  - Read `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
    per CLAUDE.md's "not the Next.js you know" note before writing code — confirmed standard
    App Router Server/Client Component conventions apply (Next 16.3.5), no unusual breaking
    change affecting this page.
  - Built `app/products/page.tsx` — a Server Component with real `metadata` (title/description)
    that renders a page header and passes the full `generators` array into a client component.
  - Built `components/products-browser.tsx` (`"use client"`) — brand and kVA-band filter pills
    (both default to "All"), a live "Showing X of 98 models" count, a "Clear filters" action
    (only shown when a filter is active), an empty state for filter combos with zero matches,
    and a responsive card grid (1/2/3 cols) reusing the same card visual language as Home's
    "Featured Models" section (brand label, model name, spec `dl` list, `Factory` icon).
    Filtering/sorting done client-side with `useMemo` over the bundled JSON — no API route,
    per CLAUDE.md's static-generation approach.
  - **Data gap found and handled:** all 22 Ricardo models have `standbyKva`/`primeKva`/
    `fuelTank` as `null` at the top level — confirmed via inspecting `generators.json` that
    this isn't a Session-1 conversion bug but a real difference in Ricardo's brochure sheet
    structure (one combined `ratedOutputKwKva` field like `"8/10"` instead of separate
    standby/prime columns, and a fuel *consumption rate* like `"2 L/hr"` instead of a tank
    *capacity* column — every other brand has both standby+prime and a real tank-L number).
    Rather than showing Ricardo cards with only Engine/Weight (too thin for a "browsable spec
    sheet"), added `getRatedOutputFallback`/`getFuelConsumptionFallback` in
    `products-browser.tsx` that surface `model.specs.ratedOutputKwKva` as a "Rated Output"
    row and `model.specs.fuelConsumption` as a "Fuel Consumption" row whenever the standard
    fields are null — real bundled data under an honest label, nothing fabricated. Cummins'
    22 models are all missing `weightKg` too (brochure sheet has no weight/dimensions column
    at all) — left as a silent skip (existing conditional already omits that row), since
    there's no analogous real field to fall back to for that one.
  - **Verification:** `next build` succeeds (static, no type errors, `/products` prerendered).
    Checked live in Chrome via the already-running dev server: full unfiltered grid renders
    correctly (Ricardo cards now show Rated Output/Fuel Consumption fallback fields), clicking
    a brand pill + a kVA-band pill with zero real matches (Volvo Penta + Small) renders the
    empty state correctly with working pill active-states, "Clear filters" correctly resets
    both filters back to "All" and restores all 98 models. Console showed only the same
    `bis_skin_checked` browser-extension hydration warning noted in Sessions 4–5 — not an app
    bug, no code change needed.
- **Key decisions made:**
  - Kept the whole browser as one client component rather than trying to isolate filter state
    from the grid — the grid re-renders on every filter change anyway (that's the point), so
    splitting them would add complexity (lifting state, prop drilling) without reducing client
    JS in any meaningful way for a catalog this size (98 models, all data already client-side).
  - Sort order within filtered results: kVA band order (Small→Industrial) then ascending
    standby kVA — makes browsing within a band easier than data-file insertion order.
  - Did not add a text/model-name search box — CLAUDE.md specifies filtering "by brand and by
    kVA band" only; adding search would be scope creep beyond what was asked.
- **Skills invoked this session:** none.
- **Files touched:** `app/products/page.tsx` (new), `components/products-browser.tsx` (new),
  `tasks.md`, `memory.md`.
- **Deviations from tasks.md / this CLAUDE.md, and why:** none — the Ricardo/Cummins fallback
  fields are additive display logic surfacing real bundled data, not a change to `data/
  generators.ts`'s shape or CLAUDE.md's required card fields (brand, model, standby/prime kVA,
  engine, weight, fuel tank are all still shown whenever present).
- **Open issues / TODOs for next session:**
  - Move on to Task 4 (About page).
  - The mobile-viewport `resize_window` tool limitation (Sessions 3–5) is still open — not
    re-attempted this session; Products reuses the same proven responsive grid/pill-wrap
    patterns (`flex-wrap`, `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
  - If a future session builds a per-model detail view, the Ricardo `ratedOutputKwKva`/
    `fuelConsumption` fallback pattern in `products-browser.tsx` is a useful reference for
    how to handle that brand's differently-shaped `specs` object.
