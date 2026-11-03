// Runs `prisma migrate deploy` as part of `npm run build`, except on Vercel
// Preview/Development builds. Those often share the production env vars, so
// migrating there would apply an unmerged branch's schema to the real
// database. Give Preview its own database (e.g. a Neon branch) and set
// RUN_MIGRATIONS=true for the Preview environment to migrate it too.
import { spawnSync } from "node:child_process";

const vercelEnv = process.env.VERCEL_ENV; // production | preview | development
const forced = process.env.RUN_MIGRATIONS === "true";

if (vercelEnv && vercelEnv !== "production" && !forced) {
  console.log(
    `[migrate] Skipped on Vercel ${vercelEnv} build ` +
      "(set RUN_MIGRATIONS=true to migrate a separate preview database).",
  );
  process.exit(0);
}

console.log(
  `[migrate] prisma migrate deploy (${vercelEnv ?? "not on Vercel"})`,
);
const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  // npx is npx.cmd on Windows, which needs a shell to run
  shell: process.platform === "win32",
});
process.exit(result.status ?? 1);
