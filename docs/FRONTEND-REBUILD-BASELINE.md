# PushStream Frontend Rebuild — Baseline Audit

## Source baseline

- Application: PushStream
- Package version at intake: `1.4.0`
- Framework: Next.js `16.3.6`
- React: `19.3.0`
- Prisma: `7.x`
- TypeScript declared: `5.9.2`
- Required Node engine: `>=24.0.0`
- Working artifact supplied by the user: `pushstream_blogs.zip`

## Runtime boundary in this workspace

The source archive does not contain `node_modules`, and the available container Node runtime is `v22.16.0`, below the project's declared Node 24 minimum. Therefore dependency-aware build/typecheck/lint/test gates are not marked passed here. Source integration audit can still run because it uses Node core APIs only.

## Source integration audit

`node scripts/final-integration-audit.mjs`

Result at Phase 0/1 implementation time:

```text
Integration audit: 0 failure(s), 0 warning(s)
Pages discovered: 101
Migrations discovered: 20
PASS final source integration audit
```

## Public route inventory relevant to the redesign

- `/`
- `/[slug]`
- `/ai-tools`
- `/ai-tools/[slug]`
- `/article/[slug]`
- `/author/[slug]`
- `/category/[slug]`
- `/comparisons`
- `/comparisons/[slug]`
- `/contact`
- `/development`
- `/guides`
- `/guides/[slug]`
- `/how-to`
- `/latest`
- `/newsletter/confirm`
- `/newsletter/unsubscribe`
- `/online-business`
- `/resources`
- `/reviews`
- `/reviews/[slug]`
- `/search`
- `/series/[slug]`
- `/tag/[slug]`
- `/wordpress`

## Reference screenshot mapping

| Reference | Target route |
|---|---|
| PushStream homepage | `/` |
| Latest Articles | `/latest` (optional `/blog` alias later) |
| WordPress Fixes | `/wordpress` |
| AI Tools Directory | `/ai-tools` |
| WordPress step-by-step article | `/article/[slug]` |
| Hosting comparison/review | `/reviews/[slug]` / `/comparisons/[slug]` depending content type |
| About PushStream | `/about` via generic Page slug or dedicated system-page renderer |
| Contact | `/contact` |

## Existing backend/admin assets intentionally preserved

- Posts, pages, categories, tags and authors
- Media pipeline/library
- `HomepageSection`
- `Menu` / `MenuItem`
- `SiteSetting`
- AI tools/categories
- Reviews and comparisons
- Series, collections and resources
- Newsletter/contact APIs
- Search and analytics
- Affiliate/ad tracking
- Editorial workflow/calendar/revisions/autosave/locking
- RBAC, sessions and 2FA
- SEO, sitemap, robots, RSS and JSON-LD
- Jobs/webhooks/feature flags/maintenance controls

## Frontend replacement strategy

The V2 public design system is being introduced under `components/site/v2/**` in parallel with the current public frontend. Existing pages are not switched during Phase 1. This keeps the supplied working frontend available until the shared design primitives are stable and the global shell is migrated in Phase 2.
