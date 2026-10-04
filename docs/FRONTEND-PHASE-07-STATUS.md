# Frontend Rebuild Phase 7 Status — Topic Landing Pages

## Completed

Phase 7 replaces the legacy shared `ContentHub` route usage for the four major topic hubs with a reusable V2 topic landing experience.

Implemented:
- shared `TopicLandingPage` renderer;
- shared `topic-landing-v2.service.ts` data layer;
- `/wordpress` V2 landing page;
- `/development` V2 landing page;
- `/how-to` V2 landing page;
- `/online-business` V2 landing page;
- screenshot-style split hero with optional Admin-selected media;
- CMS hero eyebrow/accent/description support;
- floating topic chips;
- search scoped to the current topic hub;
- real published stats with optional CMS display-stat overrides;
- child-category topic cards and filter pills;
- fallback reference-style topic labels when child categories do not yet exist;
- real published article grid;
- shareable `q`, `topic`, and `page` query state;
- pagination;
- popular-guides sidebar;
- topic-count sidebar;
- newsletter sidebar;
- featured-guide sidebar and wide featured-guide block;
- Admin manual featured-guide selection through existing Phase 3 section configuration;
- bottom newsletter band;
- responsive desktop/tablet/mobile layout;
- top-level section `sortOrder` respected;
- disabled article/newsletter/topic sections respected;
- `online-business` added to the Site Pages registry and validation enum.

## Data safety

All article queries are restricted to:
- `status = PUBLISHED`;
- `deletedAt = null`;
- `publishedAt <= now`;
- the configured root topic category and its direct children.

No fake posts or fake analytics records are created.

## Database

No new Prisma schema migration is required for Phase 7. It reuses `PublicPageSection` and `PublicPageSectionItem` introduced in Frontend Phase 3.

## Source QA

- final integration audit: 0 failures / 0 warnings;
- pages discovered: 103;
- migrations discovered: 21;
- TypeScript TS1xxx parser diagnostics: 0;
- merge markers: 0;
- Phase 7 source files present: PASS.

The workspace does not contain installed Next/React dependencies or a freshly generated Prisma client, so full dependency-aware typecheck/build is not marked passed. JSX `key` prop diagnostics visible in the raw `tsc` output are the same consequence of missing React JSX typings already visible across existing pages.

## Still pending

- real-browser side-by-side pixel parity against the supplied WordPress reference screenshot;
- final image/crop tuning using production Media records;
- Phase 12 individual sidebar-module enable/disable controls;
- Phase 13 responsive/accessibility acceptance;
- Phase 14 full Node 24 build/performance/SEO regression;
- Phase 15 final visual parity sign-off.
