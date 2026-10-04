# PushStream Phase 16 production commands

Target root: `/www/wwwroot/pushstream.online`
Internal application port: `127.0.0.1:8021`

## Safe update flow

```bash
cd /www/wwwroot/pushstream.online

node -v
# must be v24.x or newer

npm ci
npm run preflight:production
npm run deploy:production
```

After the deploy script passes:

```bash
nginx -t
systemctl reload nginx

curl -fsS https://pushstream.online/api/health
SMOKE_BASE_URL=https://pushstream.online npm run smoke:production

pm2 status
pm2 logs pushstream --lines 100 --nostream
pm2 logs pushstream-worker --lines 100 --nostream
```

## Database migration rule

Existing production database:

```bash
npm run db:validate
npm run db:generate
npm run db:deploy
npm run db:seed
```

Never run `prisma migrate dev`, `db:reset`, `prisma db push`, or clean bootstrap against an existing production database.

## Application-only rollback

Use only after deciding a code rollback is safe with the already-applied schema:

```bash
npm run rollback:application -- <previous-git-tag-or-commit>
```

Database rollback is a separate reviewed operation. Prefer a forward-fix migration. A database restore must use the verified backup created before the release and must account for writes made after that backup.
