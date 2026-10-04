#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ "${PUSHSTREAM_CLEAN_BOOTSTRAP:-}" != "YES" ]] || [[ "${PUSHSTREAM_DATABASE_CONFIRMED_EMPTY:-}" != "YES" ]]; then
  cat >&2 <<'EOF'
REFUSED.
This command is ONLY for a database you have independently confirmed is EMPTY.

Required:
  PUSHSTREAM_CLEAN_BOOTSTRAP=YES
  PUSHSTREAM_DATABASE_CONFIRMED_EMPTY=YES

Never run this against an existing database containing real data.
For upgrades use: npm run db:deploy
EOF
  exit 2
fi

[[ -f .env ]] || { echo "ERROR: .env is missing" >&2; exit 1; }

npm run db:validate
npm run db:generate

echo "Creating the complete current schema in the CONFIRMED EMPTY database..."
npx prisma db push --skip-generate

echo "Registering committed historical migrations as applied..."
while IFS= read -r migration; do
  [[ -z "$migration" ]] && continue
  npx prisma migrate resolve --applied "$migration"
done < <(find prisma/migrations -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort)

npm run db:seed

echo "Clean database bootstrap complete."
echo "Future releases must use: npm run db:deploy"
