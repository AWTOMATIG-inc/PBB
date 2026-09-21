# PBB Website — Tasks

- [x] 1a. Project setup: organize source files, init Next.js (TS + Tailwind + App Router),
      convert the xlsx catalog into `data/generators.(json|ts)`, add logo to `public/`,
      extract brand palette into `design.md`
- [x] 1b. Base layout: shared nav + footer components (`components/nav.tsx`,
      `components/footer.tsx`) wired into `app/layout.tsx`, using the brand palette and
      lucide-react icons
- [x] 2. Home page
- [x] 3. Products page: listing + brand/kVA-band filtering
- [x] 4. About page
- [x] 5. Contact page
- [x] 6. Responsive/cross-browser polish, basic SEO metadata (titles, descriptions, favicon
      generated from the logo)
- [ ] 7. Deployment prep (build check, env/config for chosen host — see `/deploy` skill)

## CMS / Admin Panel (added 2026-09-16)

Backend: PocketBase (confirmed running locally at `http://127.0.0.1:8090`), custom thin
admin UI inside this Next.js app (`/admin`), no Docker. See `memory.md` for the reasoning.

- [x] 8. Architecture decision + PocketBase schema. Decided: public pages will fetch from
      PocketBase at build time with ISR revalidation (replaces the static
      `data/generators.ts` import; site stays statically served, VPS only gets hit on
      revalidation, not per visitor — see task 14). Schema defined as migration files
      checked into `pocketbase/pb_migrations/` (applied and verified locally): `brands`,
      `power_bands`, `products` (relations to both), `home_placements` (curates New
      Products / Featured Models section membership + order), `invoices` (admin-only, no
      public read). Details and the local run command are in `pocketbase/README.md`.
- [x] 9. One-time data migration: import the existing 98 generators from
      `data/generators.json` into PocketBase's `products` collection (brand/power-band as
      relations, not free text), with a script kept in the repo (not a throwaway) in case it
      needs to be re-run.
- [x] 10. Admin foundation: protected `/admin` route group, PocketBase auth (login screen +
      session handling), base admin layout/nav (reuse `design.md` tokens, not a new theme).
- [x] 11. Admin: Products CRUD (list, create, edit, delete, image upload to PocketBase file
      storage).
- [x] 12. Admin: Filters CRUD (Brand + Power Band management).
- [x] 13. Admin: Home page curation CRUD (choose/order which products show in the "New
      Products" carousel and "Featured Models" section).
- [x] 14. Wire the public site to PocketBase per task 8's decision (replace the static
      `data/generators.ts` read in Products/Home with live data), keeping pages statically
      generated where possible so the VPS stays lightly loaded.
- [ ] 15. Invoices: nail down the required fields with the user (currently undecided — see
      `memory.md`), then build the invoice form + PDF generation (a lightweight lib like
      `pdf-lib` or `@react-pdf/renderer`, not headless-Chrome/Puppeteer, to stay within the
      VPS's 4-core/6GB budget) + PocketBase storage for the generated PDFs.
- [ ] 16. Backend deployment: run PocketBase as a systemd service on the VPS (alongside the
      PM2-managed Next.js app from task 7), set up regular backups of `pb_data/`, and lock
      down `/admin` and the PocketBase admin UI (HTTPS via the existing Nginx reverse proxy,
      strong auth, no public superuser signup).

Check items off as they're completed. Split a task further if a session runs out of room
before finishing it — don't leave "half of task 3" unmarked with no note (use `memory.md`
for that).
