# Phase 27 Status — Security Center

## Implemented
- TOTP authenticator setup with encrypted-at-rest secret material derived from the server secret.
- Two-step login challenge; no admin session is created until the second factor succeeds.
- One-time backup codes stored as SHA-256 hashes.
- Active-session viewer, single-session revoke, and revoke-all-other-sessions.
- Session device descriptions derived from user-agent without precise location tracking.
- SecurityEvent model and admin-only security-event viewer.
- Security events for repeated login failures, 2FA enable/disable/success/failure, and rejected media uploads.
- Dedicated search-autocomplete rate limiting added; existing login/password-reset/contact/newsletter/comments/affiliate limits retained.
- Existing global CSRF/origin protection and permission middleware retained.
- Existing structured article renderer and sanitized admin ad HTML path retained; SVG remains disabled by default.

## Intentionally pending runtime/integration verification
- Real authenticator-app enrollment and clock-skew verification against a deployed HTTPS environment.
- Full security-event hook audit for password changes, admin creation and role changes.
- Prisma validation/generation and migration against MySQL.
- Full typecheck, lint, security suite, tests and production build.
- Multi-browser session-revocation smoke test.

## Security boundary
2FA setup secrets are returned only to an authenticated administrator during setup. The database stores encrypted TOTP secret material and hashed backup codes. Provider/session secrets are never returned through settings APIs.
