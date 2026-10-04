#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

./scripts/production-preflight.sh

BACKUP_PATH="$(./scripts/backup-release-state.sh)"
echo "Production backup created: $BACKUP_PATH"

npm ci
npm run db:validate
npm run db:generate
npm run db:deploy
npm run db:seed
npm run typecheck
npm run lint
npm run test:security
npm test
npm run audit:seo
npm run audit:performance
npm run audit:accessibility
npm run audit:visual-parity
npm run build

mkdir -p logs public/uploads
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save
sleep 3
SMOKE_BASE_URL="${SMOKE_BASE_URL:-http://127.0.0.1:8021}" npm run smoke:production

echo "PASS: application deploy + local smoke test complete."
echo "NEXT: nginx -t && systemctl reload nginx, then run public HTTPS smoke checks."
