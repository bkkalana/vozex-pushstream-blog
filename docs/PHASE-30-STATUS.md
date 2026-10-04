# Phase 30 Status — Public API, Webhooks & Platform Controls

Source-level implementation is complete for the planned Phase 30 scope:

- Versioned published-safe public APIs under `/api/v1` for articles, categories, AI tools, reviews and search, including detail routes.
- Outgoing webhook endpoints with encrypted signing secrets, HMAC-SHA256 signatures, delivery history and retryable background `WEBHOOK_DELIVERY` jobs.
- Event producers for `post.published`, `post.updated`, and `subscriber.created`.
- Targeted post cache invalidation for article/home/latest/search/category/tag/author surfaces.
- Maintenance mode with `/maintenance`; admin cookies, `/admin`, internal APIs and `/api/health` bypass maintenance mode.
- Admin-managed announcement bar with enable, schedule, link and dismiss controls.
- Feature flags for comments, AI assistant, newsletter, internal analytics, ads, affiliate tracking and announcement bar.
- Feature flags are wired into comments, newsletter signup, AI generation, internal view tracking, ad rendering, affiliate redirects and announcement rendering.
- Settings input validation and immutable settings-change history.
- Important appearance/general/integration settings write actor-aware history; navigation actions retain audit/history coverage.
- Phase 30 migration and seed defaults.

## Security notes

- Public APIs use explicit `select` projections and published/deleted/noindex filters where applicable; they do not return admin-only fields or drafts.
- Webhook secrets are AES-256-GCM encrypted at rest with a server-only key derived from `SESSION_SECRET`.
- Production webhook destinations must use HTTPS.
- Webhook payloads are signed as HMAC-SHA256 over `timestamp.body` and sent with timestamp/event/delivery headers.
- Maintenance mode does not disable the health endpoint or admin recovery path.

## Pending deployment-environment verification

- `prisma validate` / `prisma generate` with project dependencies installed.
- Apply Phase 30 migration on a MySQL test database and test upgrade from Phase 29.
- Public API leakage/contract integration tests.
- Webhook signature verification and retry behavior against a controlled receiver.
- Browser QA for maintenance mode, announcement dismissal and every feature flag.
- Full typecheck, lint, tests and production build.
