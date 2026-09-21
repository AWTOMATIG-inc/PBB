# PocketBase schema (migrations)

The PocketBase binary and its `pb_data/` (SQLite database + uploaded files) now live
alongside this folder, in `pocketbase/` at the repo root — but they're **gitignored**, not
tracked. Only the collection definitions in `pb_migrations/` are committed, so schema
changes travel with the app's git history instead of being clicked together by hand in the
Admin UI on each machine. (On the VPS, task 16, this will live in its own directory the same
way.)

## Running locally

Run the binary from this folder — it already sees `pb_migrations/` as a sibling, so no
`--migrationsDir` flag is needed:

```
cd pocketbase
.\pocketbase.exe serve
```

Dashboard: http://127.0.0.1:8090/_/
API: http://127.0.0.1:8090/api/

## Collections

| Collection        | Purpose                                                        | Public read |
|--------------------|-----------------------------------------------------------------|:-----------:|
| `brands`           | Brand names/logos (the 6 full-catalog brands + logo-only ones)  | yes |
| `power_bands`      | Small/Medium/Large/Industrial kVA bands                         | yes |
| `products`         | Generator models (replaces `data/generators.json` — task 14)    | yes |
| `home_placements`  | Which products appear in Home's "New Products" / "Featured Models" sections, and in what order | yes |
| `invoices`         | Generated invoices + their stored PDFs                          | **no** (admin/superuser only — customer data) |

All five collections have `createRule`/`updateRule`/`deleteRule` left unset (`null`), which
in PocketBase means **superuser-only** — i.e. only the admin panel (task 10+) or a
superuser-authenticated API call can write to them. There's no separate "editor" account
type yet; the admin panel will authenticate as a PocketBase superuser.

## Data migration script

`scripts/migrate-products.mjs` (repo root) is a re-runnable, idempotent script that
imports `data/generators.json` into the `products` collection, creating `brands` and
`power_bands` records as needed and wiring products to them via relations (matched by
brand+model, so re-running updates existing records instead of duplicating them). Uses
Node's built-in `fetch`, no extra dependency. Run it with:

```
$env:POCKETBASE_ADMIN_EMAIL="<superuser email>"; $env:POCKETBASE_ADMIN_PASSWORD="<superuser password>"; npm run migrate:products
```

(`POCKETBASE_URL` env var overrides the default `http://127.0.0.1:8090` if needed, e.g.
when re-running against the VPS after task 16.)

## Production (VPS)

Each project gets its own PocketBase binary + `pb_data/`, living inside that project's own
repo folder on the VPS (same shape as local — see task 16 in `tasks.md`), run as its own
systemd service, **not** shared across projects.

Since every project's code defaults to `127.0.0.1:8090` (this file's local convention),
running two projects on the same VPS both on 8090 would collide. Instead, give each
project's VPS instance its own port and point Next.js at it via a `.env` file created
**directly on the VPS** after cloning (never committed — `.env*` is gitignored, and the
port differs per environment, so it should never be copied over from a local machine):

```
POCKETBASE_URL=http://127.0.0.1:8091
```

Port convention — increment per project, track it here as projects are added:

| Project | VPS PocketBase port |
|---------|:--:|
| PPB (this project) | 8091 |

## Adding a new migration

Create a new timestamped file in `pb_migrations/` (`<unix-seconds>_<description>.js`, higher
number = applied later) following the existing files' `migrate((app) => {...}, (app) => {...})`
pattern, rather than editing collections by hand in the Dashboard — hand-edits in the
Dashboard aren't tracked here and won't apply on another machine or on the VPS.
