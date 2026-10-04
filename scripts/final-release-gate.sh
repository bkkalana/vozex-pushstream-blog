#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

npm run release:check
npm run audit:integration
npm run db:validate
npm run db:generate
npm run db:deploy

echo "Running seed twice to verify practical idempotency..."
npm run db:seed
npm run db:seed

npm run typecheck
npm run lint
npm run test:security
npm test
npm run audit:seo
npm run audit:performance
npm run audit:accessibility
npm run build

echo "PASS: final pre-deploy release gate."
echo "Next: PM2 reload, Nginx/TLS validation, then npm run smoke:production."
