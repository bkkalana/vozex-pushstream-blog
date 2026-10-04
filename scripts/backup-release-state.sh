#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

[[ -f .env ]] || { echo "ERROR: .env is missing" >&2; exit 1; }

DATABASE_URL="$(node - <<'NODE'
const fs=require('fs');
const lines=fs.readFileSync('.env','utf8').split(/\r?\n/);
for (const raw of lines) {
  const line=raw.trim();
  if (!line || line.startsWith('#')) continue;
  const i=line.indexOf('=');
  if(i<1) continue;
  if(line.slice(0,i).trim() !== 'DATABASE_URL') continue;
  let v=line.slice(i+1).trim();
  if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'"))) v=v.slice(1,-1);
  process.stdout.write(v);
  process.exit(0);
}
process.exit(2);
NODE
)" || { echo "ERROR: DATABASE_URL is missing from .env" >&2; exit 1; }
export DATABASE_URL

BACKUP_ROOT="${BACKUP_ROOT:-/www/backup/pushstream}"
STAMP="$(date +%Y%m%d-%H%M%S)"
DEST="$BACKUP_ROOT/$STAMP"
mkdir -p "$DEST"
chmod 700 "$DEST"

python3 - <<'PY' > "$DEST/mysql.env"
import os, shlex, urllib.parse
u=urllib.parse.urlparse(os.environ['DATABASE_URL'])
values={
'MYSQL_HOST': u.hostname or '127.0.0.1',
'MYSQL_PORT': str(u.port or 3306),
'MYSQL_USER': urllib.parse.unquote(u.username or ''),
'MYSQL_PASSWORD': urllib.parse.unquote(u.password or ''),
'MYSQL_DATABASE': (u.path or '').lstrip('/'),
}
for k,v in values.items():
    print(f"{k}={shlex.quote(v)}")
PY
chmod 600 "$DEST/mysql.env"
set -a
# shellcheck disable=SC1090
source "$DEST/mysql.env"
set +a
rm -f "$DEST/mysql.env"

: "${MYSQL_DATABASE:?database missing from DATABASE_URL}"
: "${MYSQL_USER:?user missing from DATABASE_URL}"

MYSQL_PWD="$MYSQL_PASSWORD" mysqldump \
  --single-transaction \
  --routines \
  --triggers \
  --set-gtid-purged=OFF \
  -h "$MYSQL_HOST" \
  -P "$MYSQL_PORT" \
  -u "$MYSQL_USER" \
  "$MYSQL_DATABASE" | gzip -9 > "$DEST/database.sql.gz"
chmod 600 "$DEST/database.sql.gz"

tar -czf "$DEST/uploads.tar.gz" public/uploads 2>/dev/null || true
chmod 600 "$DEST/uploads.tar.gz" 2>/dev/null || true
cp .env "$DEST/env.backup"
chmod 600 "$DEST/env.backup"

tar -czf "$DEST/source.tar.gz" \
  --exclude=.git \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=logs \
  --exclude=backups \
  --exclude=public/uploads \
  --exclude=.env \
  .
chmod 600 "$DEST/source.tar.gz"

git rev-parse HEAD > "$DEST/git-commit.txt" 2>/dev/null || echo "archive-release" > "$DEST/git-commit.txt"
sha256sum "$DEST"/* > "$DEST/SHA256SUMS.txt"
chmod 600 "$DEST/SHA256SUMS.txt"

echo "$DEST"
