# Frontend Rebuild Phase 16 Status — Production Release

## Scope completed in source package

Phase 16 converts the Phase 15 project into a guarded production-release package. It does **not** claim that the live server has been deployed from this chat.

### Release-critical fix

The intended production application port is now consistently `127.0.0.1:8021` in:

- `ecosystem.config.cjs`
- `deploy/nginx-pushstream.conf`
- `.env.example` smoke URL
- `scripts/smoke-production.mjs`
- `scripts/deploy-production.sh`
- `docs/DEPLOYMENT.md`

The previous 3000/8021 mismatch is removed from production release files.

### New/updated release tooling

- `scripts/production-env-check.mjs`
  - validates production NODE_ENV, HTTPS SITE_URL, DATABASE_URL presence, secret lengths and known placeholder values;
  - reads `.env` safely as text instead of shell-sourcing arbitrary values.
- `scripts/production-preflight.sh`
  - requires Node >=24, npm, PM2, mysql/mysqldump and python3;
  - verifies runtime directories and port 8021;
  - runs source release/integration/SEO/visual-parity gates.
- `scripts/backup-release-state.sh`
  - derives MySQL credentials from `DATABASE_URL`;
  - writes timestamped MySQL dump;
  - archives `public/uploads`;
  - archives the application source excluding runtime/generated data;
  - copies `.env` with restrictive permissions;
  - stores Git commit where available;
  - creates SHA-256 checksums.
- `scripts/deploy-production.sh`
  - preflight → backup → npm ci → Prisma validate/generate/deploy → seed → quality gates → build → PM2 reload → local smoke.
- `scripts/rollback-application.sh`
  - rebuilds a requested Git tag/commit and reloads PM2;
  - explicitly does not reverse database migrations.
- `scripts/phase16-release-audit.mjs`
  - 18 source-level release safety/configuration checks.
- `deploy/DEPLOY-COMMANDS-PHASE16.md`
  - copy/paste aaPanel/VPS deployment and rollback flow.

### Expanded smoke coverage

Stable public smoke routes now include:

- health
- home
- latest
- search
- WordPress
- AI Tools
- reviews
- comparisons
- About
- Contact
- Guides
- Resources
- sitemap
- robots
- RSS
- admin login
- public v1 content endpoints

Optional article-detail smoke is supported by setting `SMOKE_ARTICLE_SLUG`.

## Source verification results

- Release package check: PASS (`16/16` required files)
- Phase 16 release-readiness audit: PASS (`18/18`)
- Integration audit: `0` failures, `0` warnings
- SEO regression audit: `30/30` passed
- Performance source audit: PASS
- Visual parity source audit: `13/13` passed
- Migration directories: `22`
- New Phase 16 migration: none
- Shell syntax checks for Phase 16 release scripts: PASS
- Node syntax checks for new Phase 16 `.mjs` scripts: PASS

Accessibility source audit continues to report known admin/shared heuristic review hints; Phase 13 established zero public-front-end heuristic warnings. These hints are not hidden or represented as runtime accessibility certification.

## Runtime gates intentionally not marked complete here

This workspace cannot execute the real production release because it does not have the user's VPS, production `.env`, production MySQL, PM2/Nginx control, Node 24 runtime or a staging browser session.

The following remain server/staging acceptance items:

1. Verify Node >=24 and real `.env`.
2. Create and inspect the actual timestamped backup.
3. Run `npm ci` and `npm run deploy:production`.
4. Confirm `db:deploy`, seed, typecheck, lint, tests and production build on the server.
5. Validate `nginx -t` and reload Nginx.
6. Run local and public HTTPS smoke tests.
7. Verify admin login, Site Pages editing, section reorder and cache invalidation.
8. Verify contact/newsletter/affiliate behavior.
9. Approve 1440px desktop and 390px mobile screenshots with production CMS images.
10. Monitor PM2/Nginx logs after release.

## Existing production database rule

Do not run `prisma migrate reset`, `prisma db push`, `db:reset` or `db:bootstrap-clean` against the existing PushStream production database. Use committed migrations with `npm run db:deploy` and prefer forward-fix migrations over manual migration reversal.
