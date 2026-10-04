#!/usr/bin/env bash
set -euo pipefail
npm run db:validate
npm run db:generate
npm run typecheck
npm run lint
npm test
npm run build
