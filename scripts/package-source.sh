#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="${1:-pushstream-source.zip}"
rm -f "$OUT"
zip -qr "$OUT" . \
  -x '.git/*' '.env' '.env.local' '.env.production' '.env.development' '.env.test' 'node_modules/*' '.next/*' 'generated/*' \
     'coverage/*' 'backups/*' 'logs/*' 'public/uploads/*' '*.log' '*.tsbuildinfo' '*.zip'
echo "Created sanitized source archive: $OUT"
