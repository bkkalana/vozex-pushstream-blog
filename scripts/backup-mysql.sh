#!/usr/bin/env bash
set -euo pipefail
: "${MYSQL_DATABASE:?Set MYSQL_DATABASE}"
: "${MYSQL_USER:?Set MYSQL_USER}"
: "${MYSQL_PASSWORD:?Set MYSQL_PASSWORD}"
MYSQL_HOST="${MYSQL_HOST:-127.0.0.1}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/pushstream-$STAMP.sql.gz"
MYSQL_PWD="$MYSQL_PASSWORD" mysqldump --single-transaction --routines --triggers --set-gtid-purged=OFF -h "$MYSQL_HOST" -u "$MYSQL_USER" "$MYSQL_DATABASE" | gzip -9 > "$OUT"
chmod 600 "$OUT"
echo "$OUT"
