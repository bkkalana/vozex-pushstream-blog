# PushStream Production Deployment

Target: Ubuntu VPS + aaPanel + Nginx + PM2 + Node.js 24+ + MySQL 8+ + HTTPS.

## 1. Server prerequisites

Install/enable Node.js 24+, npm, MySQL 8+, PM2 and Nginx. In aaPanel create the site root:

```bash
/www/wwwroot/pushstream.online
```

Create a dedicated MySQL database/user and grant that user access only to the PushStream database.

## 2. Application files

Deploy the repository into `/www/wwwroot/pushstream.online`. Do not place `.env`, SQL backups, logs or source-control credentials inside `public/`.

```bash
cd /www/wwwroot/pushstream.online
cp .env.example .env
chmod 600 .env
mkdir -p public/uploads logs backups
chmod 750 public/uploads logs backups
```

Set the real database credentials, secrets, admin bootstrap values and SMTP settings in `.env`. Generate independent secrets, for example:

```bash
openssl rand -base64 48
openssl rand -base64 48
```

Use one value for `SESSION_SECRET` and a different value for `CRON_SECRET`.

## 3. First production install

```bash
npm install
npm run release:check
npm run db:validate
npm run db:generate
npm run db:deploy
npm run db:seed
npm run typecheck
npm run lint
npm run test:security
npm test
npm run audit:performance
npm run audit:accessibility
npm run build
```

`prisma migrate dev` must not be used in production. Production uses committed migrations via `npm run db:deploy`.

The seed is idempotent but requires a strong `SUPER_ADMIN_PASSWORD`. It creates the bootstrap Super Admin, roles/permissions, settings, navigation, six main categories, 12 original starter articles, legal/static starter pages and representative AI-tool directory entries. Review seeded policy/legal text before public launch.

## 4. PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Follow the command printed by `pm2 startup` as root if required. The application binds to `127.0.0.1:8021`; Nginx is the public entry point.

Useful commands:

```bash
pm2 status
pm2 logs pushstream --lines 200
pm2 reload ecosystem.config.cjs --update-env
```

## 5. Nginx / aaPanel

Use `deploy/nginx-pushstream.conf` as the reference. Replace certificate paths with the actual aaPanel-generated certificate paths. Validate before reload:

```bash
nginx -t
systemctl reload nginx
```

Only enable HSTS after HTTPS and all covered subdomains have been verified:

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

Do not add `preload` until every covered subdomain is permanently HTTPS-only.

## 6. Post-deploy smoke test

```bash
npm run smoke:production
curl -fsS https://pushstream.online/api/health
```

The health endpoint must report the application and database as healthy. Also manually verify admin login, upload/write access, a published article, search, sitemap, robots and RSS.

## 7. Scheduler

Call scheduled publishing and maintenance endpoints with the bearer `CRON_SECRET`. Recommended cron examples:

```cron
* * * * * curl -fsS -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" https://pushstream.online/api/internal/publish-scheduled >/dev/null
17 * * * * curl -fsS -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" https://pushstream.online/api/internal/engagement-cleanup >/dev/null
37 2 * * * curl -fsS -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" https://pushstream.online/api/internal/analytics-rollup >/dev/null
```

Keep the real secret out of shell history where possible; a protected root-owned script/environment file is safer than embedding a secret in world-readable cron configuration.

## 8. Backups

The application does not execute database backups from the browser. Use host-level backup automation. A reference helper is included at `scripts/backup-mysql.sh`.

Example:

```bash
MYSQL_DATABASE=pushstream \
MYSQL_USER=pushstream \
MYSQL_PASSWORD='...' \
BACKUP_DIR=/www/backup/pushstream \
./scripts/backup-mysql.sh
```

Back up both MySQL and the durable upload directory. Store at least one copy outside the application server and test restoration periodically.

## 9. Routine deployment

Before deploying, take a database/upload backup. Then:

```bash
cd /www/wwwroot/pushstream.online
git pull --ff-only
./scripts/deploy-production.sh
```

The script uses `npm install` (or `npm ci` when a committed lockfile is available), validates/generates Prisma, applies committed migrations, runs quality/security audits and builds before `pm2 startOrReload`. If a pre-reload gate fails, deployment stops.

## 10. Rollback

Application rollback and database rollback are separate concerns. Prefer forward-fix migrations. If application code must be rolled back:

1. restore the previous Git release/commit;
2. reinstall with `npm install` (or `npm ci` when a committed lockfile is available) if lockfile changed;
3. rebuild;
4. reload PM2;
5. run the smoke test.

Do not manually reverse a production migration unless a reviewed rollback SQL plan exists and a current backup has been verified.

## 11. Production acceptance

Before launch verify:

- HTTPS certificate and redirect;
- `/api/health` returns healthy;
- Super Admin login and logout;
- media upload and persistent storage;
- publish/edit/search flows;
- scheduled publishing;
- newsletter/contact/comment workflows if enabled;
- sitemap, robots and RSS;
- redirects and affiliate links;
- ad slots only where intentionally enabled;
- keyboard/mobile/accessibility QA;
- Lighthouse/Core Web Vitals measurements;
- backup and restore procedure;
- no default/example admin password remains.


## Phase 17 editorial maintenance

Recommended cron (every 10 minutes) for stale editor-lock and preview-token cleanup:

```cron
*/10 * * * * curl -fsS -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" https://pushstream.online/api/internal/editorial-cleanup >/dev/null 2>&1
```

Scheduled publishing should continue using the existing protected scheduled-publish endpoint/worker. Both endpoints require `CRON_SECRET`.

## Phase 16 hardened release workflow

The production application now binds to `127.0.0.1:8021`. The PM2 ecosystem, Nginx reference, smoke-test default and `.env.example` are aligned to the same port.

For an existing production database, use the guarded deployment flow:

```bash
cd /www/wwwroot/pushstream.online
npm ci
npm run preflight:production
npm run deploy:production
```

`deploy:production` creates a timestamped pre-release backup under `/www/backup/pushstream` by default. The backup includes the MySQL dump, durable uploads, current `.env`, Git commit reference when available, and SHA-256 checksums. Override the location with `BACKUP_ROOT=/secure/path` when required.

After the application-local smoke test passes, validate and reload Nginx, then smoke test through public HTTPS:

```bash
nginx -t
systemctl reload nginx
curl -fsS https://pushstream.online/api/health
SMOKE_BASE_URL=https://pushstream.online npm run smoke:production
```

Application rollback is available with:

```bash
npm run rollback:application -- <previous-tag-or-commit>
```

This does not reverse database migrations. Prefer forward-fix migrations. Database restoration must be an explicit reviewed operation using the verified pre-release backup and must account for any production writes made after the backup timestamp.
