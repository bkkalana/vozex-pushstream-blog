# Build / TypeScript fix — Phase 16.1

The Phase 16 release archive accidentally included a stale generated Prisma client from before the Phase 3 and Phase 9 schema additions. The source schema and migrations were correct, but TypeScript resolved the stale generated client, causing `publicPageSection`, `reviewProduct`, `Review.author`, and `Review.products` to appear missing and cascading `never` errors in review pages.

## Fix

- Removed committed `generated/prisma`.
- Added automatic `prisma generate` hooks to `postinstall`, `prebuild`, and `pretypecheck`.
- Added `npm run audit:prisma-client`.
- Fixed the unsupported admin button variant `outline` to `secondary`.

## Clean Windows rebuild

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force generated\prisma -ErrorAction SilentlyContinue
npm ci
npm run db:validate
npm run db:generate
npm run audit:prisma-client
npm run typecheck
npm run build
```

For an existing production database, run `npm run db:deploy` after `db:generate` and before starting the production process. Do not run `db:reset` or `db:bootstrap-clean` on an existing database.
