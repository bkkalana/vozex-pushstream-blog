# PushStream v1.0 Release Gate

A release is approved only after every runtime gate is executed against the same commit and production-like MySQL schema that will be deployed.

## Automated gate

```bash
npm ci
npm run release:check
npm run db:validate
npm run db:generate
npm run db:deploy
npm run typecheck
npm run lint
npm run test:security
npm test
npm run audit:performance
npm run audit:accessibility
npm run build
```

After PM2 starts:

```bash
npm run smoke:production
```

## Manual gate

Verify desktop/tablet/mobile public navigation, admin navigation, authentication, editor save/autosave, media upload, publishing, scheduled publishing, archives/search, AI tools, reviews/comparisons, newsletter/contact/comments, redirects, affiliate tracking, ad placements, settings/RBAC, health/system screens and SEO endpoints.

Run keyboard-only and 200% zoom checks described in `docs/ACCESSIBILITY.md`. Measure representative production URLs against `performance-budget.json`.

## Release evidence

Record the Git commit, migration list, build timestamp, Node version, MySQL version, smoke-test output, backup path/reference and the person who performed the release. Do not store credentials or tokens in release evidence.


## Final advanced Phase 31 gate

For the Phase 17–31 advanced release use `docs/FINAL-ADVANCED-RELEASE.md`.

```bash
npm run audit:integration
npm run release:final
```

For a brand-new database, do not assume the historical migration chain contains the original Phase 1–3 baseline. Use the guarded clean bootstrap described in the final runbook. Existing databases continue to use `npm run db:deploy`.
