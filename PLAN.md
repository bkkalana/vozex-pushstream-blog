# PushStream Production Stabilization Plan

## Phase 1 — Source & Secret Hygiene
- Keep runtime `.env` out of source/release archives.
- Generate Prisma Client during install/build; never ship `generated/prisma`.
- Keep build/cache outputs out of source packages.

## Phase 2 — Release Integrity
- Validate required release files and schema.
- Run Prisma validation/generation and migration checks.
- Run TypeScript, ESLint, security, unit/integration, SEO, accessibility, performance and visual audits.

## Phase 3 — Security & Accessibility
- Enforce production secret/URL validation before deployment.
- Preserve RBAC, CSRF/same-origin, upload validation, session hardening and 2FA protections.
- Require accessible names for icon-only interactive controls; accept visible text/dynamic text as valid button names.

## Phase 4 — Performance & Data Safety
- Keep public images optimized with `next/image` where appropriate.
- Use pagination/bounds for growing user-facing datasets; allow intentionally complete reads for exports, sitemap generation and bounded configuration/reference tables.

## Phase 5 — Production Verification
- Use Node.js 24+.
- Test against a disposable fresh MySQL database before first production bootstrap.
- Run the complete release gate, then PM2/Nginx/TLS smoke tests on port 8021.


## Phase 6 — Google Search Optimization
- Keep one canonical HTTPS URL per page and emit self-referencing canonicals.
- Publish a clean dynamic sitemap containing only indexable, public, published URLs.
- Keep public `noindex` pages crawlable so crawlers can see the directive; block only private/admin/API/preview/redirect endpoints in robots.txt.
- Provide Google-compatible square favicon assets and stable URLs.
- Provide WebSite site-name data, Organization identity, Article/BlogPosting, Breadcrumb and supported review metadata.
- Support Google Search Console verification from the admin SEO screen.
- Provide a default Open Graph image and RSS feed discovery.
- After deployment, submit the sitemap and validate representative URLs in Search Console.
