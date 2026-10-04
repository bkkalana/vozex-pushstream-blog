# Phase 31 Status — Final Advanced Integration, Migration, QA & Production Release

## Completed in this source artifact

- Final source integration audit and static page-link audit.
- Required Phase 17–30 status/model/integration surface checks.
- Guarded one-time clean-database bootstrap for the historical missing Phase 1–3 baseline migration.
- Existing-database upgrade path remains `prisma migrate deploy`.
- Final release gate runs seed twice plus typecheck/lint/security/tests/audits/build.
- Production smoke suite expanded to published-safe `/api/v1` endpoints.
- Final advanced release/deployment runbook added.
- Static source audit found no missing static page links in the current source tree.

## Critical migration finding

Committed migrations begin at Phase 4 while the current Prisma schema includes core Phase 1–3 tables. A brand-new empty database therefore must not rely on historical `migrate deploy` alone.

Use `scripts/bootstrap-clean-database.sh` only after independently confirming the target DB is empty. It requires two explicit confirmation environment variables, creates the current schema, marks committed migration directories applied, and seeds. Existing databases must use normal migrations only.

## Runtime acceptance still required

This workspace does not provide the complete installed npm dependency tree, configured MySQL staging database, PM2/Nginx/TLS, or browser/device environment. The following are therefore not marked passed here:

- clean MySQL bootstrap execution;
- upgrade migration from a real prior database snapshot;
- seed idempotency on MySQL;
- full dependency-aware typecheck/lint/test/build;
- live 2FA/session tests;
- job concurrency/retry tests;
- webhook receiver/retry integration;
- backup restore drill;
- PM2/Nginx/TLS checks;
- browser accessibility/performance acceptance.

Follow `docs/FINAL-ADVANCED-RELEASE.md` and record release evidence before launch approval.
