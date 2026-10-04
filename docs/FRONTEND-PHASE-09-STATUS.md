# Frontend Phase 9 Status — Reviews & Comparisons

## Completed

- V2 `/reviews` listing with CMS-managed hero/newsletter headings, search, featured review, review grid, latest comparisons and tool-category sidebar.
- V2 `/comparisons` listing with search, product labels, feature previews, related reviews and newsletter.
- V2 `/reviews/[slug]` with breadcrumbs, real category/tool context, optional persisted author, dates, rating summary, disclosure, hero screenshot, rich editorial body, pricing, screenshots, alternatives, verdict and FAQ.
- Optional roundup mode using new `ReviewProduct` rows for ranked providers/products, per-item rating, best-for, pricing, description, media, pros, cons and official/affiliate CTA.
- V2 `/comparisons/[slug]` with 2–3 product hero cards, typed BOOLEAN/RATING/BADGE/PRICING/text rows, responsive table, affiliate disclosure and related-content sidebar.
- Admin review form can add/remove structured ranked products and select product media.
- Existing review screenshot IDs are preserved on edits instead of being cleared by the form.
- New/updated reviews persist the authenticated editor as optional `authorId` when no author is already assigned.
- New migration: `20260930133500_phase9_review_products`.
- Added source regression test `tests/frontend-phase9-reviews-comparisons.test.ts`.

## Backward compatibility

- Existing reviews do not require ranked products. When `ReviewProduct[]` is empty the public page renders as a standard single-product/editorial review.
- Existing reviews with `authorId = null` remain valid; author text is omitted until the review is updated.
- Existing review ratings, screenshots, alternatives, FAQ, verdict, disclosure, AI-tool link and affiliate/official URLs remain in use.
- Existing comparisons retain their 2–3 item and typed feature model.

## Runtime gates not claimed in this artifact

This workspace has Node 22 and no installed project `node_modules`; the project targets Node >=24. The committed generated Prisma client also predates the new Phase 9 models until `npm run db:generate` is run. Therefore the following must be executed on the Node 24 deployment/staging environment before release approval:

```bash
npm install
npm run db:validate
npm run db:generate
npm run db:deploy
npm run typecheck
npm run lint
npm test
npm run build
```

Source-level audit in this workspace: integration audit 0 failures / 0 warnings, merge markers 0, TypeScript parser (`TS1xxx`) diagnostics 0.
