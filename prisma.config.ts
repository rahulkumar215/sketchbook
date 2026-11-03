import "dotenv/config";
import { defineConfig } from "prisma/config";

// The CLI (migrate) uses the DIRECT (non-pooled) Neon URL; the app itself
// uses the pooled DATABASE_URL via the Neon adapter (src/lib/db.ts).
// Falls back to "" so `prisma generate` (which needs no DB) works on a fresh
// clone / Vercel install before any env vars exist.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
