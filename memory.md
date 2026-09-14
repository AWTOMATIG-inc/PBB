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
  - Favicon is still the Next.js default (`app/favicon.ico`) — replace with a PBB mark in
    task 6.
  - Project root has no git repo. If the user wants version control, `git init` at
    `C:\Users\user\Desktop\PPB` still needs to happen (not done automatically since it
    wasn't asked for).
  - Consider whether `reference/1-4.png` brochure photos are worth cropping into real
    product images for the Products page, or whether the site stays spec-table-only with no
    generator photography — open question, not decided.
