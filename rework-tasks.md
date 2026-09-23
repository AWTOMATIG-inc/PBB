# PBB Post-Launch Rework — Tasks

Source: `pbb-feedback-and-development-breakdown.md` (the full AWTOMATIG feedback doc) and
Khalid's tracker (PBB-01 through PBB-19 cards). IDs below match the tracker card titles
exactly where a card exists, so progress here can be copied straight into tracker updates.
PBB-05, PBB-07, PBB-13, PBB-14 aren't in the tracker screenshots Khalid shared but are
required by the feedback doc (other visible cards depend on them) — added here per Khalid's
call; check whether they exist under different names on the tracker.

## How this file works

- **Two owners only**: `khalid` (backend/schema/business-logic/financial-calculation work —
  anything that can break data integrity or money math if done wrong) and `ashikul`
  (content edits, data entry through the admin UI that already exists, and visual/layout
  work with no schema changes).
- **Sequencing is mandatory, not just nice-to-have**: where a task says "Depends on", that
  Khalid task must be merged to `main` and deployed before Ashikul starts his half. Ashikul
  should not work off Khalid's branch — wait for the merge.
- **Branching**: one persistent branch per person, both cut from `main`, never from each
  other. Khalid works on `khalid`, Ashikul on `ashikul` (created 2026-09-23 off `main` @
  `56a9a7e`). Flow for each cycle: push/PR your branch into `main` → Khalid merges → the
  *other* person pulls `main` and rebases/recreates their branch from it before starting the
  next slice — don't keep piling commits on a branch that's drifted behind a merged `main`.
- Same conventions as `tasks.md` / `design-task.md`: check items off as completed, split a
  task further if a session runs out of room, log decisions in `memory.md`.
- Sprint grouping follows the feedback doc's section 8 recommendation. Work sprints in
  order; within a sprint, Khalid's items still gate Ashikul's.

## Cycle log

Work happens in small handoff cycles, not sprint-sized batches: Khalid pushes/merges a small
slice, tells Ashikul exactly which task IDs are now unblocked, Ashikul completes those and
reports back, then Khalid starts the next slice. Log each cycle here (most recent last) so a
fresh session — or Ashikul checking this file — can see exactly what's merged, what's handed
off, and what's still waiting. Update the relevant task's checkbox in the sections below too;
this log is the timeline, the checkboxes are the current state.

```markdown
## Cycle N — <date>
- Khalid pushed/merged: <task IDs + one-line summary, or "nothing yet — assigned to Ashikul only">
- Handed to Ashikul: <task IDs> — <what he was told to do>
- Ashikul reported back: <date, what shipped, or "waiting">
- Next up: <task IDs, whoever owns them>
```

### Cycle 1 — 2026-09-22

- Khalid pushed: **PBB-01-Product Filtering** and **PBB-02-Product Filtering** (kVA range
  expansion to 1500 + power band rework). Changes: `data/generators.ts`'s `KvaBand` type
  gained `"Heavy Industrial"`; `KVA_BANDS` split `Industrial` into `300-749 kVA` and added
  `Heavy Industrial (750-1500 kVA)`; `data/generators.json` reclassified the two models that
  cross the new 750 kVA line (Perkins P730B at 750 standby, P805B at 800 standby) from
  `Industrial` to `Heavy Industrial`; `scripts/migrate-products.mjs`'s `POWER_BAND_DEFS`
  updated to match, and `upsertPowerBands` now patches existing band records on re-run
  instead of only creating missing ones (it previously silently skipped stale bands). Applied
  directly to the local PocketBase instance via a new migration,
  `pocketbase/pb_migrations/1789554844_expand_power_bands_to_1500kva.js` (updates the
  `Industrial` record's label/maxKva, creates `Heavy Industrial`, and reassigns any product
  with standby/prime kVA >= 750 onto it) — ran `pocketbase.exe migrate up` locally and
  verified via the API that all 5 bands and both reclassified products are correct.
  `components/products-browser.tsx`'s `FilterGroup` and `power-bands-manager.tsx` needed no
  code changes since both already read bands data-driven (from `KVA_BANDS`/PocketBase, not
  hard-coded cards). Also fixed stale "300+ kVA" marketing copy on `/` (Home's "Full Power
  Range" feature) that would otherwise have undersold the new 1500 kVA ceiling.
  `next build`/`tsc --noEmit` both pass; verified live in the dev server that `/products`
  renders the new "Heavy Industrial (750-1500 kVA)" filter option and both reclassified
  Perkins models. **Merged to `main` and deployed** — PR #2 (manually merged by Khalid on
  GitHub, merge commit `24235ed`), confirmed live on the production site. PBB-01/02 is fully
  done. Note this does **not** by itself unblock PBB-03b/07/08b/11 — those each have their
  own separate Khalid prerequisite that hasn't shipped yet (3a for 3b, 8a for 8b, 9+10/12 for
  07, 9+10 for 11's pricing-adjacent layout) — see Sprint 2/3 below. The earlier "Next up"
  note undersold that; corrected here.
- Handed to Ashikul (can start immediately, no dependency on the above): **PBB-04-Contact**
  (remove the deprecated third phone number), **PBB-05-WhatsApp** (confirm the WhatsApp CTA
  number), **PBB-06-Services** (replace "Buy" with "Exchange" site-wide). All three are
  content-only edits — see each task's description above for exact file locations.
- Ashikul reported back: waiting.
- Next up: PBB-01/02 merged + deployed (see above) — Ashikul is still capped at PBB-04/05/06
  until Khalid ships one of PBB-03a, PBB-08a, or PBB-09+10/12. Khalid's next slice candidates:
  PBB-03a (clients collection + admin CRUD) or PBB-09+10 (pricing schema) — pick whichever
  unblocks Ashikul's next batch fastest; PBB-08a is blocked on the GRAND POWER brochure file
  regardless. Once Ashikul reports PBB-04/05/06 done and no Khalid slice has landed yet, there
  is genuinely nothing else on Sprint 1/2 for him to pick up — flag that rather than starting
  PBB-11 early, since 11 depends on 9+10 for its pricing-adjacent layout.

### Cycle 2 — 2026-09-23

- Khalid pushed/merged: PBB-01/PBB-02 merge confirmed live (PR #2, `24235ed`) plus a docs-only
  PR #3 (`56a9a7e`) correcting the Cycle 1 "Next up" note and `memory.md`. `main` is now the
  sync point for both branches.
- Handed to Ashikul: same three tasks as Cycle 1 — **PBB-04, PBB-05, PBB-06** (no dependency,
  see their task entries above for exact files). New this cycle: a dedicated `ashikul` branch
  was cut from `main` @ `56a9a7e` and pushed to `origin/ashikul` — work there, not on
  `khalid`. Open a PR from `ashikul` into `main` when ready; Khalid merges it.
- Ashikul reported back: 2026-09-23 — completed PBB-04 (dropped deprecated third phone number from footer and contact page), PBB-05 (verified WhatsApp link uses approved business number), and PBB-06 (replaced Buy with Exchange across Home, About, Footer, and layout metadata); build and typecheck pass clean. Ready for PR review and merge by Khalid.
- Next up: once Ashikul's PR merges into `main`, pull `main` on both sides before starting the next slice (Khalid: PBB-03a or PBB-09+10; Ashikul: waiting for Khalid's next backend slice to unblock dependent tasks).

---

## Blockers — need from Khalid before certain tasks can start

- [ ] **GRAND POWER LTD brochure** (PDF/images) — not in the repo. Needed before PBB-08/8b
      (catalogue import) or the PBB-08a schema-field decisions can be finalized (some fields
      in section 4.2 may not all be present in this particular brochure).
- [ ] **Real client logos** for the 7 approved clients (Skyview Apartment, Bashundhara
      Training and Testing, Bay Footwear, Adib Builders, Sinha Knitwear, Atif Agro, Magura
      Group) — needed for PBB-03b.
- [ ] **Quotation sample documents** (Bashundhara Training and Testing Center quotation,
      Ricardo 40 kVA quotation) — needed for PBB-13/14 to match PBB's actual commercial
      layout and numbering (`PBB-1095` style).
- [ ] **Invoice field decision** — carried over from `memory.md`'s prior open item, still
      unresolved. Needed before PBB-15.

---

## Sprint 1 — Live-site corrections (PBB-01 to PBB-06)

- [x] **PBB-01-Product Filtering** — `khalid`. Expand generator power range to 1500 kVA.
      Backend: `data/generators.ts`'s `KvaBand` type and the `power_bands` PocketBase
      collection currently stop at "Industrial (300+)" — add "Heavy Industrial (750-1500)"
      and split "Industrial" to 300-749 per the feedback doc's table (section 3.1). Store
      kVA numerically (already true for `standbyKva`/`primeKva`); filters must derive from
      product data, not hard-coded cards (already true — confirm it stays true).
- [x] **PBB-02-Product Filtering** — `khalid`. Rework Power Band categories/filters for the
      expanded range. Same PR as PBB-01 in practice — `components/products-browser.tsx`'s
      `FilterGroup` for Power Band, plus any admin `power-bands-manager.tsx` UI, needs to
      reflect the new 5-band scheme.
- [ ] **PBB-03-Clients** — split:
  - [ ] **3a** `khalid` — new `clients` PocketBase collection (fields per feedback doc 3.2:
        Client Name, Logo, Display Order, Featured Yes/No, Active/Hidden), an admin CRUD
        manager mirroring `components/admin/brands-manager.tsx`, and rewire the Home "Our
        Clients" marquee (`app/(site)/page.tsx`) off the `BRAND_LOGOS` placeholder (see
        `memory.md`'s durable-decisions note on this) onto the real collection.
  - [ ] **3b** `ashikul` — *depends on 3a merged + real client logos supplied.* Add the 7
        approved clients through the new admin screen.
- [x] **PBB-04-Contact** — `ashikul`. Remove every phone number except the two approved:
      `+88 (0) 1989 474 447` (WhatsApp Business) and `+88 (0) 1625 181 403` (office). Known
      locations: `components/footer.tsx` (has all 3 in its `PHONE` array — drop
      `1515 675401`), `app/(site)/contact/page.tsx`, `components/nav.tsx` (`PRIMARY_PHONE`
      already correct, double check nothing else references the third number), plus any
      structured data/JSON-LD, metadata, and CTA `tel:`/`wa.me` links site-wide. Grep the
      whole repo for `1515` and `675401` before calling this done.
- [x] **PBB-05-WhatsApp** *(not on tracker — added per feedback doc; bundle with PBB-04)* —
      `ashikul`. Confirm the WhatsApp CTA(s) use `wa.me/8801989474447` specifically (already
      correct in `footer.tsx`) and that no other number is used for WhatsApp anywhere.
- [x] **PBB-06-Services** — `ashikul`. Replace "Buy" with "Exchange" (presented as "Generator
      Exchange": existing generator assessed and exchanged toward another unit, subject to
      inspection/valuation). Locations: `SERVICES` array in `app/(site)/page.tsx` (line ~65)
      and the matching services-in-depth copy in `app/(site)/about/page.tsx`. Content-only,
      no schema change (services aren't in PocketBase).

## Sprint 2 — Catalogue redesign, schema, brochure import, imagery, pricing (PBB-07 to PBB-12)

- [ ] **PBB-07-Catalogue** *(not on tracker — added per feedback doc)* — `ashikul`.
      *Depends on PBB-01/02 and PBB-09/12 merged first* — the new filters (Condition,
      Availability, Price State) and power bands need to exist before the redesigned filter
      UI can be built against them. Redesign `components/products-browser.tsx`'s layout
      using the supplied PS Engineering category page as a structural reference, keeping PBB
      branding/palette (`design.md`). Pure front-end, no schema changes of its own.
- [ ] **PBB-08-Catalogue** — split:
  - [ ] **8a** `khalid` — *blocked on the GRAND POWER brochure file.* Extend the `products`
        PocketBase collection (currently `pocketbase/pb_migrations/1789554839_create_products.js`)
        to cover every field in feedback doc section 4.2 not already present: Condition,
        Country of Origin, Controller, Voltage, Frequency, Fuel Consumption, Dimensions, an
        additional-images gallery (current `image` field is `maxSelect: 1`), and a
        brochure/datasheet file field. Extend `data/generators.ts`'s `Brand` type and the
        `brands` collection if the brochure includes brands beyond the current 6 (Doosan/
        Caterpillar are logo-only today per `CLAUDE.md` — confirm whether Grand Power
        changes that). Add the matching fields to the admin product form (this is also
        PBB-12, see below — one PR covers both).
  - [ ] **8b** `ashikul` — *depends on 8a merged.* The actual reconciliation import: for
        every model in the brochure, extract specs, create the product via the admin UI,
        assign brand/kVA/power band, add the genuine photo, fill technical specs, attach the
        brochure/datasheet, add price if supplied, publish. Track a running count against
        the brochure's model list as you go (feeds PBB-18).
- [ ] **PBB-09+10+11** — split:
  - [ ] **9+10** `khalid`. Add optional pricing: `price` (number, nullable), `currency`
        (default BDT), `showPrice` (bool) fields on `products`; admin form fields for them;
        and conditional rendering on `components/product-card.tsx` and the product detail
        view so the price block is fully hidden (not just blank/zero) when `showPrice` is
        off, with "Request Quotation" becoming the primary CTA in that case.
  - [ ] **11** `ashikul` — *depends on 9+10 merged if any pricing-adjacent layout changed;
        otherwise can run in parallel with 8b since it's the same admin image-upload flow.*
        Replace any remaining generic/placeholder product images with actual photos.
- [ ] **PBB-12-Product Admin** — `khalid`. Same PR as 8a/9+10 in practice: make sure every
      new field (specs, images/gallery, pricing) is editable from `/admin`'s existing
      Products CRUD (`components/admin/` product form), not just storable in PocketBase.

## Sprint 3 — Customers, quotations, invoices, PDFs (PBB-13 to PBB-16)

- [ ] **PBB-13-Quotation** *(not on tracker — added per feedback doc)* — `khalid`. *Blocked
      on the two sample quotation documents.* Build the quotation generator: new `customers`
      PocketBase collection, new `quotations` collection matching feedback doc section 6.2's
      data model (products/qty/unit price/line total, accessories, installation, transport,
      discount, VAT, terms, validity, status), sequential non-duplicating numbering matching
      PBB's historical `PBB-1095`-style format (section 6.3), and the create-quotation admin
      flow (section 6.1's 13-step workflow).
- [ ] **PBB-14-Quotation** *(not on tracker — added per feedback doc)* — `khalid`. Same
      workstream as PBB-13 — match the supplied quotation samples' exact structure,
      terminology, and output layout once they're available.
- [ ] **PBB-15+16-Invoice & Documents** — `khalid`. *Depends on PBB-13/14 merged* (invoices
      convert from accepted quotations per section 7.1, so the quotation model has to exist
      first). Resolve the still-open invoice-fields decision (`memory.md`), build
      quotation-to-invoice conversion (copies customer/product/terms, assigns next invoice
      number per section 7.2's data model and statuses), and generate printable/downloadable
      PDFs for both quotations and invoices (lightweight lib — `pdf-lib` or
      `@react-pdf/renderer`, not headless-Chrome, per `tasks.md` task 15's existing note on
      the VPS's resource budget). All commercial totals calculated server-side.
- [ ] **PBB-16-Documents** — `khalid`. Duplicate of the PDF-generation half of PBB-15+16 —
      same tracker card appears twice in the screenshots; treat as one deliverable, not two.

## Sprint 4 — QA (PBB-17 to PBB-19)

- [ ] **PBB-17+18+19-QA** — split:
  - [ ] **17** `ashikul`. Responsive testing across desktop/tablet/mobile after the PBB-07
        catalogue redesign ships.
  - [ ] **18** `ashikul` (first pass, since he did the 8b import) → `khalid` (sign-off).
        Full catalogue/data reconciliation: brochure model count = backend product count =
        published product count, per the feedback doc's "no silent omissions" rule
        (section 4.3). Every published product has accurate specs and a real photo.
  - [ ] **19** `khalid`. Quotation/invoice calculation and PDF validation — financial
        correctness stays with Khalid regardless of who built the surrounding UI. Numbering
        can't duplicate, totals/balances are correct, PDF output matches PBB's commercial
        document structure, print layout and page breaks are clean.

## Explicitly not re-litigated here

This file only breaks the feedback doc into assignable, sequenced work — it doesn't
reinterpret scope. If a task's exact requirements are unclear when you reach it, re-read the
matching section number in `pbb-feedback-and-development-breakdown.md` (referenced inline
above) rather than guessing.
