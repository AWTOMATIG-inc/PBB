# Design Motion & Polish — Tasks

Source concepts: [`cube-motion.md`](cube-motion.md) (zero-dep WAAPI animation: `rise`,
`leave`, `morph`, `reveal`) and the `/craft-design-engineering` skill (typography, color,
layout, motion polish). Not started — nothing below is implemented yet. Ordered by
impact-to-risk ratio: cheap, high-visibility, low-regression-risk items first.

Each item lists the file(s) it touches and which cube-motion function or craft concept
applies. Check items off as they're built; split further if a session runs out of room.

- [x] 1. Install `cube-motion` (`npm i cube-motion`, React adapter via `cube-motion/react`).
      Zero other deps pulled in, matches the project's minimal-deps convention.
- [x] 2. Nav mobile menu (`components/nav.tsx`): swap the instant `{open && (...)}`
      mount/unmount (lines 81-113) for `rise`/`leave` (or the `Rise` component with `show`).
      Hamburger↔X icon swap (line 77): `morph`. Highest visibility — every mobile page load.
- [x] 3. Products filter panel (`components/products-browser.tsx`): mobile filter toggle
      (lines 181-185) and each `FilterGroup` chevron collapse (lines 37-55) get `rise`/`leave`
      instead of instant `{open && (...)}`.
- [x] 4. Product grid re-render on filter change (`components/products-browser.tsx`, lines
      212-216): `rise` with `targets: "children"` and stagger. Core interaction of the
      Products page — the single highest-impact item on this list.
- [x] 5. Tabular numbers on spec figures (`components/product-card.tsx`, lines 58-64: kVA,
      weight, fuel tank). Craft concept, not cube-motion — cheap, pairs with #4 so numbers
      don't jitter in width as the grid re-flows.
- [x] 6. Home page scroll reveals (`app/(site)/page.tsx`): "Why Choose Us" cards (172-189),
      Featured Models grid (239-243), Services cards (259-276) — `reveal`, staggered.
- [x] 7. Home hero entrance (`app/(site)/page.tsx`, lines 100-130): `rise` with
      `targets: "children"` on the badge/heading/subtext/CTA sequence.
- [x] 8. Active filter count badge (`components/products-browser.tsx`, lines 169-172):
      `morph` when the number changes.
- [x] 9. `NewProductsCarousel` (`components/new-products-carousel.tsx`): review current slide
      transition, decide if `morph` (state swap) or scroll-based `rise` fits — needs a read of
      that file first, not yet inspected in this pass.
- [x] 10. Admin lists (`components/admin/home-placement-manager.tsx`,
       `brands-manager.tsx`, `power-bands-manager.tsx`): `leave` before row removal instead of
       instant delete; `rise`/`leave` on inline add/edit forms opening. Lower priority —
       internal tool, but keeps the whole app consistent.
- [x] 11. Delete-confirmation buttons (`components/admin/delete-product-button.tsx`,
       `delete-filter-button.tsx`): `morph` for a label-swap confirm state.
- [x] 12. Craft polish pass (independent of cube-motion, can land anytime): image outlines on
       generator photos (`product-card.tsx` line 40-48, Home hero image), nested-border-radius
       audit (card `rounded-2xl` vs. flush image corners), hover-restraint audit (confirm
       nothing frequent like filter checkboxes gets a slow transition once #2-4 land), and an
       `app/globals.css`/root-layout check that `<html>` (not just `<body>`) has an explicit
       background to avoid an overscroll color flash.

## Explicitly out of scope

Per `cube-motion.md`'s own rules: pagination page-number clicks, button press states
(already correct as plain CSS `hover:`/`transition-colors`), drag-reorder if ever added,
and any timeline/gesture/layout animation — cube-motion doesn't cover these, don't reach for
it there.
