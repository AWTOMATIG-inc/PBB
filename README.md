# Power Bank Bangladesh — Website

Next.js (App Router) site + `/admin` CMS, backed by PocketBase. Self-hosted on a VPS
(PM2 + Nginx), auto-deployed from `main` via a GitHub webhook.

## Local development

```bash
npm install
./pocketbase/pocketbase.exe serve   # see pocketbase/README.md for setup + migrations
npm run dev                         # http://localhost:3000
```

## Production build

```bash
npm run build
npm start
```
