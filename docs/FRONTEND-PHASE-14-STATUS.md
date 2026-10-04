# Frontend Phase 14 — SEO & Performance Regression Status

Date: 2026-09-30

## Completed

- Added `scripts/seo-regression-audit.mjs` and `npm run audit:seo`.
- Wired SEO regression audit into `scripts/final-release-gate.sh`.
- Expanded sitemap static coverage to About, Comparisons, Guides and Resources.
- Added public guide-detail and content-series URLs to sitemap.
- Preserved published/deleted/scheduled/robots-index filtering on indexable entities.
- Strengthened `robots.txt` exclusions for Search, Preview, newsletter token routes and Maintenance.
- Added explicit canonical metadata to Comparisons, Guides and Resources listing pages.
- Added model-backed metadata/canonical output for guide detail and content series detail pages.
- Preserved Article, Review and Breadcrumb JSON-LD paths.
- Added Atom self links to root and category RSS feeds.
- Fixed all audited public `next/image fill` calls missing a `sizes` hint.
- Kept intentionally raw images only where arbitrary CMS/configured URLs make Next host validation unsafe; performance audit explicitly allowlists those cases.
- Bounded public Guides (`take: 60`) and Resources (`take: 100`) listing queries.
- Removed duplicate appearance settings DB reads from the root layout.
- Enhanced performance audit to report client component footprint, priority-image footprint, raw images, missing sizes and unbounded-query candidates.

## Verification

- SEO regression checks: 30 passed, 0 failed.
- Performance source audit: passed.
- `next/image fill` missing `sizes`: 0.
- Integration audit: 0 failures, 0 warnings.
- Pages discovered: 104.
- Migrations discovered: 22.
- TypeScript parser diagnostics (`TS1xxx`): 0.
- Release-package source check: passed.

## Environment limitation

The current workspace reports Node `v22.16.0`; this project requires Node `>=24.0.0`. Project dependencies/generated Prisma client are not installed here. Therefore full `typecheck`, `lint`, Vitest/security tests, production `next build`, browser hydration verification, Lighthouse, LCP and CLS are not claimed as passed.

Run the remaining staging gate on Node 24+:

```bash
npm install
npm run db:validate
npm run db:generate
npm run audit:seo
npm run typecheck
npm run lint
npm run test:security
npm test
npm run audit:performance
npm run audit:accessibility
npm run build
```

Then run Lighthouse/browser checks for the target breakpoints before Phase 15 parity approval.
