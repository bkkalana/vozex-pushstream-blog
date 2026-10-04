# Phase 1 Status — Database, Authentication & RBAC

## Implemented

- Full normalized Prisma schema for the planned publication platform foundation.
- MySQL datasource configuration through Prisma 7 `prisma.config.ts`.
- Prisma 7 MariaDB/MySQL driver adapter runtime singleton.
- Database Session and PasswordResetToken models.
- LoginAttempt persistence for throttling.
- Argon2 password hashing and verification.
- Random session tokens with SHA-256 hashes stored in the database.
- HTTP-only, SameSite=Lax session cookie; Secure enabled in production.
- Normal and remember-me session expiration policies.
- Login/logout API routes and polished `/admin/login` UI.
- Generic invalid-credential behavior and database login throttling.
- Login audit records.
- Password-reset request + confirmation routes and UI.
- Enumeration-safe reset-request response.
- One-time hashed reset tokens with expiry and invalidation.
- All existing sessions revoked after a successful password reset.
- SMTP reset-email delivery when configured; development-only server logging when SMTP is absent.
- Seed definitions for SUPER_ADMIN, ADMIN, EDITOR, AUTHOR, SEO_MANAGER and VIEWER.
- Granular permission catalog and role-permission mappings.
- `requireSession`, `requirePermission`, `requireAnyPermission` and ownership helper.
- Server-protected `/admin` route group.
- RBAC and auth-validation unit tests added.
- Phase 1 verification script.

## Verification not completed in this execution environment

`npm install` timed out before dependencies were downloaded, so the following commands could not be truthfully marked as passed here:

- `prisma validate`
- `prisma generate`
- generation/execution of the initial migration
- seed against a real empty MySQL database
- typecheck
- lint
- unit tests
- production build
- browser login/logout verification

The migration folder is intentionally left ready for Prisma to generate the canonical SQL after dependencies are available. Do not hand-maintain a guessed migration for this large relational schema.

## Phase 1 exit procedure

1. Configure a disposable empty MySQL 8+ database.
2. Configure `.env` from `.env.example` with strong credentials.
3. Run `npm install`.
4. Run `npm run db:validate`.
5. Run `npm run db:generate`.
6. Run `npx prisma migrate dev --name phase1_foundation`.
7. Run `npm run db:seed` twice to verify idempotent behavior.
8. Run `./scripts/verify-phase1.sh`.
9. Verify login, logout, remember-me, throttling and password-reset flows in a browser.
10. Commit the generated migration only after all checks pass.
