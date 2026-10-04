# Phase 14 Status — Performance, Caching & Core Web Vitals

## Implemented

- Public ISR/revalidation windows added to homepage, article, category, tag, author, latest, review hub and content-hub routes.
- Persistent Next.js data caching added for homepage configuration, public site chrome and published article reads.
- Cache tags added for homepage, posts, categories, AI tools, chrome and site settings.
- Admin post/tool/category/homepage/navigation/settings mutations now invalidate relevant public surfaces.
- Dynamic article/category/tag/author/tool routes are revalidated after editorial mutations.
- Public site loading skeleton added to improve perceived navigation performance.
- `next/image` optimization tuned for AVIF/WebP, responsive device widths and a one-day optimizer cache TTL.
- Public article listing queries now select only card fields instead of author profiles/tags that cards do not render.
- Trending calculation no longer loads 30 days of raw PostView rows. It now uses aggregated DailyContentStat buckets and a bounded published-post lookup.
- Analytics referrer scan is bounded to the latest 50,000 rows instead of an unbounded read.
- Compound MySQL indexes added for common published-post and AI-tool query patterns.
- Explicit performance budgets added in `performance-budget.json`.
- `npm run audit:performance` source audit added for client boundaries, raw images and potentially unbounded queries.
- Redis-ready invalidation boundary is isolated under `lib/cache/`; Redis is not required for Phase 14.

## Source verification

- TypeScript/TSX syntax audit: 260 files parsed, 0 syntax diagnostics.
- Performance source audit executed successfully.

## Intentionally pending runtime gates

These require installed project dependencies, generated Prisma Client, a migrated MySQL database and a running production build:

- `npm install`
- `npm run db:validate`
- `npm run db:generate`
- `npm run db:deploy`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- Inspect Next.js production route/client bundle output.
- Lighthouse/WebPageTest checks for LCP, INP and CLS on real production assets.
- Verify cache invalidation after editing/publishing content through the live admin UI.
- Validate p95 server response and query budgets using production-like data volume.

## Performance budgets

See `performance-budget.json`. Initial targets include LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 and a bounded primary-page query budget. These are project targets, not claimed measured production results.
