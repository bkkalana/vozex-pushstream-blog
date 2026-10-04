# PushStream Final Advanced Release Runbook

## Purpose

This is the Phase 31 release runbook for the Phase 17–30 advanced expansion.

## 1. Pre-flight

```bash
cd /www/wwwroot/pushstream.online
npm install
npm run release:check
npm run audit:integration
```

Use strong independent `SESSION_SECRET` and `CRON_SECRET` values and replace all example credentials before seeding.

## 2A. Brand-new installation on a confirmed empty database

The historical repository starts committed migrations at Phase 4 even though the current schema includes Phase 1–3 core tables. Therefore a clean database must not rely on historical `migrate deploy` alone.

Independently confirm `DATABASE_URL` points to an EMPTY database, then run:

```bash
PUSHSTREAM_CLEAN_BOOTSTRAP=YES \
PUSHSTREAM_DATABASE_CONFIRMED_EMPTY=YES \
npm run db:bootstrap-clean
```

This creates the complete current Prisma schema, registers the committed historical migration directories as applied, then seeds. Run this only once. Future deployments use `npm run db:deploy`.

## 2B. Upgrade an existing PushStream database

Take verified database + uploads backups first.

```bash
npm run db:validate
npm run db:generate
npm run db:deploy
npm run db:seed
```

Never use the clean bootstrap or `prisma db push` as a normal production upgrade command.

## 3. Final application gate

```bash
npm run release:final
```

This runs the integration audit, Prisma checks/deploy, seed twice, typecheck, lint, security tests, full tests, performance/accessibility source audits and production build.

## 4. Start processes

```bash
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save
pm2 status
```

The web app and background worker must both be healthy.

## 5. Nginx / TLS

Merge `deploy/nginx-pushstream.conf` into the aaPanel vhost, set real certificate paths, then:

```bash
nginx -t
systemctl reload nginx
```

Verify HTTP→HTTPS, TLS chain, upload/static delivery and only then enable/retain HSTS.

## 6. Production smoke

```bash
SMOKE_BASE_URL=https://pushstream.online npm run smoke:production
curl -fsS https://pushstream.online/api/health
```

## 7. Manual acceptance

Verify:
- login/logout/2FA/backup codes/session revocation;
- draft → review → approval → schedule → publish;
- autosave and editor locking in two sessions;
- calendar reschedule and secure draft preview;
- revision compare/restore;
- media upload/variants/usage/collections;
- import preview/transactional commit/export;
- menu/homepage ordering;
- AI assist only when configured, with explicit human acceptance;
- SEO analysis/internal links/orphan/broken links/404→redirect;
- search/autocomplete/click analytics;
- series/collections/resources;
- review disclosures/tool alternatives/comparison matrix;
- affiliate attribution/UTM/sponsored disclosure/ad targeting;
- job retries/scheduled publish/analytics aggregation;
- newsletter segments/templates/double opt-in;
- maintenance/announcement/feature flags/settings history;
- signed webhooks and retries;
- `/api/v1` published-only behavior.

## 8. Backup/restore drill

Create MySQL and uploads backups. Restore to a non-production environment and rerun health/smoke checks before final launch approval.

## 9. Release evidence

Record commit or ZIP SHA-256, Node/npm/MySQL versions, migration status, final gate output, PM2 status, `nginx -t`, HTTPS smoke output, backup/restore reference, and accepted warnings. Never store credentials, API keys, TOTP secrets, session tokens or webhook secrets.
