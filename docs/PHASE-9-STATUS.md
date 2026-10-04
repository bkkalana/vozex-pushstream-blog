# Phase 9 Status — Newsletter, Contact, Comments & Engagement

## Implemented
- Newsletter subscribe with database dedupe and PENDING state
- One-time hashed confirmation/unsubscribe tokens with expiry
- SMTP confirmation delivery through server-only configuration
- Admin subscriber search/filter/status management and CSV export
- Public contact page with inquiry categories, validation, database persistence, admin inbox/status flow and optional SMTP alert
- Comment submission, per-post and global enable/disable, moderation queue, approved rendering and reply rendering
- Honeypot fields and database-backed hashed-IP rate limiting for newsletter/contact/comments
- Admin notifications for new contact messages and pending comments
- Audit logging for moderation/status changes
- Cron-protected cleanup endpoint for stale engagement attempts/tokens

## Runtime verification still required
- Apply Phase 9 migration to a real MySQL database
- Verify SMTP against the production provider
- Exercise abuse thresholds from the deployed reverse-proxy setup
- Run Prisma validate/generate, typecheck, lint, tests and production build after dependency installation
