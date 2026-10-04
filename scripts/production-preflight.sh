#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

fail() { echo "ERROR: $*" >&2; exit 1; }
pass() { echo "PASS: $*"; }

[[ -f .env ]] || fail ".env is missing"
[[ -f package-lock.json ]] || fail "package-lock.json is required for deterministic production install"
[[ -f ecosystem.config.cjs ]] || fail "ecosystem.config.cjs is missing"
[[ -d prisma/migrations ]] || fail "prisma/migrations is missing"

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
(( NODE_MAJOR >= 24 )) || fail "Node >=24 required; found $(node -v)"
pass "Node $(node -v)"

command -v npm >/dev/null 2>&1 || fail "npm is not installed"
command -v pm2 >/dev/null 2>&1 || fail "pm2 is not installed"
command -v mysql >/dev/null 2>&1 || fail "mysql client is not installed"
command -v mysqldump >/dev/null 2>&1 || fail "mysqldump is not installed"
command -v python3 >/dev/null 2>&1 || fail "python3 is not installed"
pass "required CLI tools available"

node scripts/production-env-check.mjs

mkdir -p logs public/uploads backups
[[ -w public/uploads ]] || fail "public/uploads is not writable"
[[ -w logs ]] || fail "logs is not writable"
[[ -w backups ]] || fail "backups is not writable"
pass "runtime directories writable"

PORT_IN_PM2="$(grep -oE -- '-p [0-9]+' ecosystem.config.cjs | head -1 | awk '{print $2}')"
[[ "$PORT_IN_PM2" == "8021" ]] || fail "PM2 app port must be 8021; found ${PORT_IN_PM2:-unknown}"
pass "PM2 app port 8021"

npm run release:check
npm run audit:integration
npm run audit:seo
npm run audit:visual-parity

echo "PASS: production preflight complete."
