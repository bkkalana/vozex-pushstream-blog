# PushStream

PushStream is a custom production-oriented technology publication and CMS for `pushstream.online`, built with Next.js App Router, React, TypeScript, Prisma and MySQL. It does not depend on WordPress, Elementor or another prebuilt CMS.

## Requirements

- Node.js 24+
- npm 11+
- MySQL 8+
- Nginx + HTTPS for production
- PM2 for the reference VPS deployment

## Local setup

```bash
cp .env.example .env
npm install
npm run db:validate
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Never use production credentials in a local `.env`.

## Production quality gate

```bash
npm install
npm run release:check
npm run db:validate
npm run db:generate
npm run db:deploy
npm run typecheck
npm run lint
npm run test:security
npm test
npm run audit:performance
npm run audit:accessibility
npm run build
```

After starting the production process:

```bash
npm run smoke:production
```

## Production deployment

See `docs/DEPLOYMENT.md`. Reference files:

- `ecosystem.config.cjs` — PM2
- `deploy/nginx-pushstream.conf` — aaPanel/Nginx reference
- `scripts/deploy-production.sh` — gated production deployment
- `scripts/backup-mysql.sh` — host-level MySQL backup helper
- `.env.example` — environment contract

## Database and seed

`prisma/seed.ts` is idempotent and requires strong bootstrap Super Admin credentials from the environment. It seeds roles/permissions, site defaults, menus/homepage configuration, six primary categories, 12 original starter articles, static/legal starter pages and representative AI-tool entries. Starter policy/legal content is not legal advice and must be reviewed before launch.

## Scheduler

Use a protected bearer `CRON_SECRET` for internal maintenance endpoints. See `docs/DEPLOYMENT.md` for cron examples covering scheduled publishing, engagement cleanup and analytics retention/rollup.

## Architecture and operations

- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
- `docs/PERFORMANCE.md`
- `docs/ACCESSIBILITY.md`
- `docs/DEPLOYMENT.md`
- `docs/RELEASE.md`
- `PLAN.md`
- `CHECKLIST.md`

## Important release rule

Source-level implementation is not the same as production verification. A release is complete only after the dependency-aware typecheck/lint/tests/build, target-MySQL migration/seed, PM2/Nginx/TLS checks and browser/device QA pass for the exact deployed commit.


## Phase 17 — Editorial Workflow

The advanced roadmap implementation now includes editorial calendar/workflow, private notes, editor locking, secure draft previews, author expertise, review reminders and hardened scheduled publishing. See `docs/PHASE-17-STATUS.md` and the Phase 17 section of `CHECKLIST.md` for the exact verification boundary.

For periodic cleanup of expired editor locks and preview tokens, call `POST /api/internal/editorial-cleanup` with `Authorization: Bearer $CRON_SECRET`.

## Phase 18 — optional AI editorial assistance

PushStream includes an optional provider-neutral AI-assisted editorial workspace. It is disabled by default. Configure one server-side provider credential (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, or a local endpoint), then enable the feature from **Admin → AI Workspace**. Generated text is always treated as a draft and is never automatically published.

## Phase 21 — Advanced Media Pipeline
Phase 21 adds purpose-oriented responsive image variants, virtual media collections, structured usage tracking, in-use deletion protection and a `StorageProvider` abstraction. See `docs/MEDIA-PIPELINE.md` and `docs/PHASE-21-STATUS.md`.


## Phase 25 worker
Production PM2 config starts both the Next.js web process and `pushstream-worker`. The worker polls the database-backed queue and is responsible for scheduled publishing, analytics aggregation and maintenance. For cron-only environments, POST `/api/internal/jobs/process` with `Authorization: Bearer $CRON_SECRET`.

## Physical SEO files

This release ships `public/sitemap.xml` and `public/robots.txt` as physical static files so `/sitemap.xml` and `/robots.txt` do not depend on database/runtime availability. Validate them with:

```bash
npm run audit:static-seo
```

After deployment, verify:

```bash
curl -I https://pushstream.online/sitemap.xml
curl https://pushstream.online/robots.txt
```


## Google Analytics

GA4 is integrated through the Site Settings value `analytics.googleAnalyticsId`. The default measurement ID is `G-CT25S0HK0Y`; it can be changed from Admin → Site Settings without editing source code. The tag loads with Next.js `afterInteractive` to reduce render-blocking impact.
