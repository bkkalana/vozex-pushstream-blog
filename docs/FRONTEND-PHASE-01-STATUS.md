# Frontend Rebuild Phase 0–1 Status

## Phase 0 — Baseline Freeze & Audit

Completed at source level:
- extracted the supplied working project as the implementation base;
- mapped public routes and screenshot targets;
- mapped reusable backend/admin/data assets;
- ran the source integration audit: 0 failures / 0 warnings;
- documented the runtime limitation of this workspace;
- preserved all existing public routes, APIs, Prisma models and admin modules;
- did not replace the current public pages during the design-system phase.

Not claimed as passed in this workspace:
- Node 24 dependency install;
- full Next.js production build;
- dependency-aware typecheck/lint/tests/security tests;
- browser screenshot capture of the current running application.

Reason: the supplied source archive does not include `node_modules`, while this container exposes Node 22.16.0 and the project requires Node >=24.

## Phase 1 — New Public Design System

Implemented under `components/site/v2/**`:

### Primitives
- PublicContainer
- Eyebrow
- PrimaryButton / SecondaryButton
- SectionHeading
- IconTile
- StatItem
- Breadcrumbs
- RatingStars
- PaginationV2
- SearchBox
- FilterPills
- SidebarCard

### Cards
- ArticleCardV2
- CompactArticleCard
- CategoryCard
- ToolCardV2
- ReviewCardV2
- AuthorCardV2
- FeatureCard

### Sections
- SplitHero
- StatsRow
- NewsletterBand

### CSS / visual foundation
- isolated `--ps-*` token namespace;
- screenshot-oriented navy/blue palette;
- pale-blue backgrounds;
- card borders/radius/shadows;
- hero geometry and floating chips;
- responsive 4→2 stat layout;
- responsive hero stack;
- mobile full-width CTAs;
- accessible focus behavior preserved globally;
- reduced-motion behavior inherited from the existing stylesheet.

## Deliberate boundary

The new V2 primitives are not yet wired into the global header/footer or public pages. That migration starts in Phase 2 so the known-working frontend remains intact while the design foundation is established.
