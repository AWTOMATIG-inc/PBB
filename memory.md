# PBB — Project Memory

Compacted 2026-09-29. Frontend, CMS, motion polish, and the 2026-09 rework round
(`rework-tasks.md`) are all done and live. `git log` has the detailed history.

## PocketBase

- Local: `cd pocketbase` then `.\pocketbase.exe serve` (dashboard `http://127.0.0.1:8090/_/`).
  Binary and `pb_data/` are gitignored; only `pb_migrations/` is tracked.
- VPS: systemd service `pocketbase-PBB` on port 8091; Next.js reads `POCKETBASE_URL` from a
  server-only `.env`. Live data (clients, prices, quotations) exists only on the VPS.
- Migrations apply only on PocketBase start. The VPS `deploy.sh` restarts the service when a
  pull includes new `pb_migrations/` files. If it doesn't restart, PocketBase **silently drops
  writes to unknown fields** (this caused the 2026-09-23 "price saves but nothing stored" bug).
- Collections: `brands`, `power_bands`, `products`, `home_placements`, `clients`,
  `alternator_makes`, `controllers`, `quotations`, `invoices` (schema only, no UI yet).
- Unset `number` fields come back as `0`; `lib/public-data.ts` normalizes kVA/weight to `null`.
- Auth: superuser JWT in an httpOnly cookie (`lib/auth.ts`, `lib/session.ts`, `proxy.ts`).
  Superuser: `khalidh.awtomatig@gmail.com`.

## Behaviour worth knowing

- Public pages use 5-minute ISR plus `revalidatePath` on every dashboard write.
- Price is public only when `showPrice` is on and price > 0. Price filter/sort compare BDT
  only; unpriced sort last. Prices are formatted by hand (not `Intl`) to avoid hydration
  mismatches.
- Product `alternator` = real part number; `alternatorMake`/`controller` are relations to
  managed lists. Many make/controller values are still placeholders.
- Option-list deletes are blocked server-side while in use, and errors are *returned* from
  server actions (thrown messages are masked in production).
- Home "Our Clients" marquee shows active + featured clients, hidden when none. Don't rename
  the section without asking.
- Quotations: 2-page A4 PDF via `@react-pdf/renderer` (`components/pdf/`,
  `lib/pdf/`), revisions numbered `-R1`, `-R2`. BDT amounts in words via `lib/format-bdt-words.ts`.
- Nav uses `public/pbb-logo.png`; `public/logo.png` is only the favicon source.

## Gotchas

- `next build` fails without PocketBase running.
- `.next/cache/fetch-cache` can serve stale PocketBase data locally — delete it when
  verifying data changes.
- On Windows, stopping a background `pocketbase serve` / `next start` can leave the child
  process alive — kill by PID (`netstat -ano`) or the next start hits EADDRINUSE.
- For 375px screenshots use Playwright's `chrome-headless-shell.exe`; regular headless
  Chrome clamps the width.

## Open items

- Invoices: fields never finalized; collection exists, no UI.
- Replace placeholder alternator make / controller values as real data arrives.

## Session log

Append new entries below: date, what changed, decisions, open TODOs. Keep them short.

## Session — 2026-09-29 — Repo cleanup, Vercel removal, docs simplified

- Removed unused docs/PDFs, rewrote README for the VPS setup, deleted all Vercel
  deployments and environments on GitHub. The Vercel GitHub App still needs uninstalling
  from the AWTOMATIG-inc org settings (only an org admin can do it).
- Marked every `rework-tasks.md` item done. Simplified `CLAUDE.md` and this file.

## Session — 2026-10-01 — Per-brand "Show on website" switch

- Client wants only Perkins, Cummins, Ricardo generators public. Added `brands.showOnSite`
  (migration `1789554850`, sets those 3 on, others off). Toggle lives in Dashboard > Filters >
  Brands; new brands default to on. Hidden brands keep their products for dashboard/quotations.
- `lib/public-data.ts` filters products by `brand.showOnSite`; the products brand filter and
  carousel come from `getPublicBrands()`. `BRANDS`/`Brand` constants are gone.
- Carousel slides are hand-made `public/carousel/<slug>.webp`; brands without one are skipped.
- Home logo marquee is a fixed list of all logos. About page, home "All Major Brands" card and
  quotation PDF footer name every brand on purpose (PBB sells parts/service for all).
- Deploy needs the PocketBase restart (new migration) or the flag is missing and the public
  site shows no products.
