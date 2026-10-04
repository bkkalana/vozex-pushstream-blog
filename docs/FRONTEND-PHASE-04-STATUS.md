# Frontend Rebuild Phase 4 Status — Homepage

## Implemented

The public homepage `/` has been rebuilt on the Phase 1 v2 design system and Phase 3 Site Pages CMS.

Implemented sections:
- screenshot-style split hero with navy/blue headline treatment;
- admin-selectable hero media;
- up to six floating topic chips from repeatable hero items;
- separate CMS-controlled stats strip;
- popular category cards with real published-post counts;
- trending article row with fallback to most-viewed published posts when no post is explicitly trending;
- latest articles;
- featured AI tools with top-rated fallback;
- mixed Reviews & Comparisons section;
- blue newsletter band;
- existing ad slots retained between appropriate homepage regions.

## Admin behavior

`/admin/site-pages/home` controls:
- enabled/disabled state;
- drag order / `sortOrder`;
- eyebrow, heading, description;
- hero accent text;
- primary/secondary CTAs;
- hero media;
- data source and item count;
- manual selection;
- repeatable hero chips;
- repeatable editorial stats;
- newsletter heading/description.

Stats are explicitly identified in Admin as editorial display values unless they are deliberately connected to measured analytics.

## Data safety

- Public post queries require `PUBLISHED`, `deletedAt: null`, and `publishedAt <= now`.
- Tools require `PUBLISHED` and `deletedAt: null`.
- Reviews/comparisons require public published state.
- No fake post/tool/review database records were introduced for visual parity.
- Legacy `HomepageSection` data was not deleted or migrated destructively.

## Source QA performed in this artifact workspace

- `node scripts/final-integration-audit.mjs`: 0 failures, 0 warnings.
- 103 public/admin page routes discovered.
- 21 committed migration directories discovered.
- TypeScript TS1xxx parser/syntax diagnostics: 0.
- No merge markers found in changed source areas.
- Phase 4 source-regression tests added.

## Runtime/browser gates still pending

This workspace does not contain the installed project `node_modules`, a generated Prisma client updated for the newest schema, a configured MySQL database, or the required Node 24 runtime. Therefore these are not claimed as passed here:
- Prisma generate/validate against deployment DB;
- full dependency-aware typecheck/lint/Vitest/build;
- visual browser comparison at 360/390/430/768/1024/1440/1920;
- real Media hero-image crop verification;
- Lighthouse/CLS/LCP final acceptance.

Final pixel tuning against the supplied homepage screenshot remains part of Phase 15 after all public routes share the same design system.
