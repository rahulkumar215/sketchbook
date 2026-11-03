# Contributing

Thanks for wanting to help. Bug fixes, small improvements and docs fixes are
welcome as pull requests straight away. For anything bigger, such as a new
page, a schema change or a new dependency, please open an issue first so we
can agree on the approach before you spend time on it.

Sketchbook is a **single-user** app on purpose (see [SECURITY.md](SECURITY.md)).
Accounts, sharing or real-time collaboration would change its whole design,
so please discuss those in an issue before writing code.

Found a security problem? Don't open an issue or pull request; report it
privately as described in [SECURITY.md](SECURITY.md).

## Setting up

Follow [Run locally](README.md#run-locally) in the README. In short: Node.js
22 or newer, any PostgreSQL database, a filled-in `.env`, then

```bash
npm install
npx prisma migrate deploy
npm run dev
```

A local Postgres is the easiest for development (for example
`postgresql://postgres:postgres@localhost:5432/sketchbook` in both
`DATABASE_URL` and `DIRECT_URL`). A free [Neon](https://neon.tech) branch
works too.

## Checks

CI runs these on every pull request. Run them before you push:

```bash
npx prettier --check .   # or --write on the files you changed
npm run typecheck
npm run lint
npx next build
```

CI also applies every migration to an empty database and fails if
`prisma/schema.prisma` has changes that no migration covers.

On Windows, `prettier --check .` may report every file if Git checked them
out with CRLF line endings. CI runs on Linux and isn't affected; to check
locally, add `--end-of-line auto`.

## Changing the database schema

1. Edit `prisma/schema.prisma`.
2. Create a migration: `npm run db:migrate -- --name what_changed`.
3. Commit the new folder under `prisma/migrations/` together with the
   schema change.

Never edit a migration that is already on `main`; add a new one instead.
Production deploys apply new migrations automatically (see
[Deploy to Vercel + Neon](README.md#deploy-to-vercel--neon)), so a migration
must work on a database that already has data in it.

## Code style

Prettier handles formatting (`.prettierrc.json`). Beyond that:

- **TypeScript everywhere**, no `any`. Validate request bodies with zod; the
  schemas live in `src/lib/validators.ts`.
- **API routes** go through `withAuth` from `src/lib/api.ts`, which checks the
  session and turns thrown errors into JSON responses. `src/proxy.ts` guards
  routes too, but every route still checks on its own.
- **Data loading** uses TanStack Query. Add new reads to `src/lib/queries.ts`
  so their query keys live in one place.
- **UI** uses the shadcn/ui components in `src/components/ui` and
  [lucide](https://lucide.dev) icons. Please don't hand-write inline `<svg>`
  icons. Loading states use the `Skeleton` or `Spinner` components rather than
  plain "Loading..." text.
- Check new UI in **light and dark mode** and at **phone width** (about
  375 px).
- This is Next.js 16, which differs from older versions in several places.
  When in doubt, the docs that ship in `node_modules/next/dist/docs/` match
  the installed version.

## Pull requests

- Keep each pull request to one change; small ones get reviewed faster.
- Explain **what** changed and **why**. For UI changes, add a screenshot.
- Commit messages follow a loose
  [Conventional Commits](https://www.conventionalcommits.org) style, for
  example `fix(sidebar): ...` or `feat: ...`; see `git log` for examples.
- By contributing, you agree that your contribution is licensed under the
  project's [MIT license](LICENSE).
