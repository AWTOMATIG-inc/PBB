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
  `alternator_makes`, `controllers`, `quotations`, `invoices`.
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

## Session — 2026-10-01 — Home hero slideshow

- Client asked for a Sakura-style carousel hero. Built `components/home-hero.tsx`: white hero,
  solid orange block behind a framed image card, 4 auto-rotating slides (Sell / Rental /
  Service / Brands) with labelled progress tabs, pause button, pauses on hover/focus, no
  autoplay under reduced motion. Contact info lives in a 32px near-black `components/top-bar.tsx`
  above the nav on every public page (icons + values only, location hidden under sm).
- User rejected the dark "navy" (ink) hero background: keep heroes white + orange.
- Slide images reuse `/generator.png` and `public/carousel/*.webp` (stock, ~500px wide, other
  makers' logos visible). Swap in real PBB photos (rental site, workshop) when available.

## Session — 2026-10-01 — SEO basics

- Canonical domain is `https://powerbankbangladesh.com` (no www); `SITE_URL` in `lib/seo.ts`.
  Nginx should 301 `www` to it.
- Added `app/robots.ts` (blocks /dashboard, /admin, /api), `app/sitemap.ts` (4 public pages),
  `app/opengraph-image.tsx` (generated 1200x630 share card), root `metadataBase` + title template
  `%s | Power Bank Bangladesh`. Dashboard is `noindex`.
- Public pages use `pageMetadata()` from `lib/seo.ts`: a page-level `openGraph` replaces the root
  one and drops the file-based OG image, so the helper sets it explicitly. New public pages must use it.
- Organization + 2 LocalBusiness (Dhaka, Chattogram) JSON-LD rendered in `app/(site)/layout.tsx`.
- Target searches: "generator price in Bangladesh", "diesel generator Bangladesh",
  "<brand> generator price in Bangladesh", "generator rental Dhaka", "generator service Dhaka".
  Biggest next win: per-model/brand product pages (competitors rank that way); needs client OK.
- TODO (non-code): Google Business Profile for both locations, submit sitemap in Search Console.

## Session — 2026-10-01 — Product photos on public cards

- `ProductCard` hardcoded `/generator.png`, so uploaded product images never showed publicly.
  `GeneratorModel.imageUrl` now comes from `productImageUrl()` in `lib/public-data.ts`; card
  uses a plain `<img>` for it (no `remotePatterns` needed) and keeps `/generator.png` as the
  fallback for products without a photo.

## Session — 2026-10-02 — Invoice module

- Dashboard > Invoices (list/new/edit/delete) + `/api/dashboard/invoices/[id]/pdf`. Migration `1789554851`
  adds `companyName`, `discountType` (amount|percent), `amountInWords`, created/updated. Deploy needs the
  PocketBase restart or the new fields are silently dropped.
- Items JSON `[{ name, qty, unitPrice, total }]`; money math in `lib/invoice-calculator.ts`, recomputed
  server-side on save and again in the PDF. `discount` stores the entered value, not the BDT amount.
- Numbers auto-assigned `INV-YYYY-NNNN` (year of invoice date), retry on unique-index clash. Not editable.
- Form has no date/status fields: create sets `issuedDate` = today (Dhaka, UTC+6) and status `draft`;
  edits never change them. Status is changed by the dropdown in the invoices table
  (`updateInvoiceStatusAction`). New invoices pre-fill Mobil, Mobil Filter, Diesel Filter, Air Filter,
  Service Charge (`DEFAULT_ITEM_NAMES` in `components/admin/invoice-form.tsx`).
- PDF letterhead (watermark, header, footer) now shared in `components/pdf/pdf-letterhead.tsx`, used by
  both quotation and invoice PDFs. Invoice PDF is one flowing page that overflows onto more pages.
- Signatory on invoices is `DEFAULT_SIGNATORY` (no per-invoice fields).
- Optional VAT: stored in the existing `tax` field (value as entered) + `taxType` (amount|percent,
  migration `1789554852`). VAT is charged on the amount after discount: Total = Subtotal - Discount + VAT.
- Quotation totals box now matches invoices via shared `components/admin/adjustment-field.tsx`.
  Quotation VAT/AIT and discount accept Tk or % (`vatAitType`, `discountType`, migration `1789554853`;
  no type = flat amount, so old quotations keep their totals). Delivery is Tk only.
- Not built: quotation-to-invoice conversion, partial payments/balance due.
- Existing bug (not fixed): quotation actions call `describePbError(body, msg)` with args swapped, so
  PocketBase validation errors show as a generic message.

## Session — 2026-10-06 — Money receipts

- Dashboard > Money Receipts (list/new/edit/delete) + `/api/dashboard/money-receipts/[id]/pdf`.
  Collection `money_receipts` (migration `1789554854`; deploy needs the PocketBase restart).
  Numbers `PBB-MR-YYYY-NNNN`; date = today (Dhaka) on create, number/date never change on edit.
  Fields: receivedFrom, amount (whole taka, max 99,99,99,999), onAccountOf + onAccountOf2 (the two
  printed lines), paymentMode cash|cheque, chequeNo/Bank/Date (cheque only), note (stub only).
- PDF `components/pdf/money-receipt-pdf-document.tsx` is laid out from measurements of the approved
  artwork (1600x693 px reference): page 800 x 346.5 pt, every position in reference px via `u()`
  (SCALE 0.5). Change SCALE only to resize. Colours are sampled from the artwork (band orange
  #EF8333, not brand-500). Helvetica, so title/labels differ slightly from the artwork's font.
- The artwork prints "Cell: +88(0)8989 474 447"; the PDF uses the verified +88 (0) 1989 474 447.
- Logo and both watermarks use `public/logo.png` (no new asset). The logo file's small caption is
  masked out of the watermarks with paper-coloured rects, since the artwork's watermark is mark only.
- react-pdf gotcha: an Image/box that runs past the page bottom makes layout loop forever (render
  hangs). Keep absolutely placed boxes inside the page.
- `lib/pdf/text-width.ts` has Helvetica widths so long values shrink to fit their line; stub values
  wrap to max 2 lines (cut with "..."), the receipt side keeps the full text.
- Shared helpers added: `lib/doc-number.ts` (sequential numbers, todayInDhaka, duplicate check;
  invoices now use them too), `numberToTakaWords` in `lib/format-bdt-words.ts`.
- Tooling note: `pocketbase migrate up` on a brand-new DB fails at migration 1789554844 (needs
  existing power band rows). Test against a copy of `pb_data` instead.

## Session — 2026-10-06 — Client flyer images in carousels

- Client sent 12 WhatsApp flyers (text baked in). Originals moved out of the repo to
  `Desktop/PPB-client-originals/`. Optimized WebP copies (q80, max 1600 px wide) in `public/assets/`
  with descriptive names. One near-duplicate (blue "Service" flyer) was dropped.
- Home hero (`components/home-hero.tsx`): 4 square flyers, card is now `aspect-square`.
  `public/carousel/*.webp` (old per-brand slides) removed.
- Products page: `components/brand-carousel.tsx` replaced by `components/promo-carousel.tsx`
  (next/image, `object-contain` so baked-in text is never cropped), 3 landscape flyers.
- Unused but available: `banner-bringing-energy-wide`, `flyer-telecom-tower`, `flyer-ricardo-healthcare`,
  `flyer-perkins-canopy`.
- Several flyers still print "SELL, BUY" (old wording; copy now says Exchange). Needs the client's designer.
- Products header now has a "With every generator" panel (`INCLUDED` in `app/(site)/products/page.tsx`):
  lube oil + lube oil filter (diesel filter) + air filter, coolant liquid, delivery and installation,
  1 year warranty. Client's wording; "lube oil filter (diesel filter)" not yet clarified.
