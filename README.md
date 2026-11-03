# Sketchbook

Personal Excalidraw notes saved to my own Postgres database (Neon), hosted
free on Vercel. Nested folders, tags, search, autosave, password login.
Pasted screenshots are compressed to WebP before they are stored.

**Stack:** Next.js 16 · `@excalidraw/excalidraw` 0.18 · Prisma 7 (Neon
adapter) · Tailwind 4 · zod · jose.

## How it works

| Piece       | Where                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| Login       | `src/proxy.ts` guards every page and API; `/api/login` checks `APP_PASSWORD` and sets a signed 30-day cookie |
| Library     | `/` loads folders + drawings in one call (`/api/library`) and filters in the browser                         |
| Editor      | `/d/[id]` loads the scene, then each image separately; autosaves ~1.5 s after you stop drawing               |
| Images      | one row per image in `drawing_files`; removed images are pruned on save                                      |
| Size limits | Vercel caps a request/response at 4.5 MB, so images go one per request                                       |

## Run locally

```bash
npm install
# fill in .env (see .env.example). Any Postgres works locally: Neon URLs use
# Neon's serverless driver, everything else uses the standard `pg` driver
# (src/lib/db.ts). Then create the tables:
npx prisma migrate deploy
npm run dev
```

## Deploy (Vercel)

1. Import the GitHub repo in Vercel.
2. Add the four variables from `.env.example` under **Settings → Environment
   Variables** (`DATABASE_URL`, `DIRECT_URL`, `APP_PASSWORD`,
   `SESSION_SECRET`).
3. Deploy. The build runs `prisma migrate deploy`, so schema changes apply
   automatically.

## Changing the schema

Edit `prisma/schema.prisma`, then `npm run db:migrate -- --name what_changed`.
Commit the new folder under `prisma/migrations/`.

## Free-tier limits

- Neon free: 0.5 GB storage (meter in the sidebar), 100 compute-hours/month,
  sleeps after 5 min idle (first request after that is a little slower).
- Vercel Hobby: personal, non-commercial use only.
