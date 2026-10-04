#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

TARGET="${1:-}"
[[ -n "$TARGET" ]] || { echo "Usage: $0 <git-commit-or-tag>" >&2; exit 2; }
command -v git >/dev/null 2>&1 || { echo "ERROR: git is required for code rollback" >&2; exit 1; }

echo "This rolls back application code only. It does NOT reverse database migrations."
git fetch --all --tags --prune
git checkout "$TARGET"
npm ci
npm run db:validate
npm run db:generate
npm run typecheck
npm run lint
npm run test:security
npm test
npm run audit:seo
npm run audit:performance
npm run audit:accessibility
npm run audit:visual-parity
npm run build
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save
SMOKE_BASE_URL="${SMOKE_BASE_URL:-http://127.0.0.1:8021}" npm run smoke:production

echo "Application rollback complete. Database migrations were left unchanged."
