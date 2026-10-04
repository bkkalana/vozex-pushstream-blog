# Phase 22 Status — Import/Export, Navigation & Homepage Composition

## Implemented
- CSV/JSON exports for posts, AI tools, newsletter subscribers, redirects and affiliate links.
- CSV/JSON imports for redirects, subscribers, AI tools and posts.
- Preview-first import validation with valid/invalid/warning rows.
- 5 MB upload cap and 5,000 row batch cap.
- Transactional commit with rollback on fatal errors.
- Imported posts are forced to DRAFT for editorial safety.
- New `imports.view` / `imports.manage` permissions.
- Advanced menu item metadata: new tab, nofollow, sponsored, CSS identifier, item type/reference ID.
- Drag/reorder/nest menu builder with cycle/depth validation.
- Public header/footer honors menu target and rel metadata.
- Drag-and-drop homepage ordering with public sort-order rendering.
- Custom homepage collections with data source, manual post IDs, item count, layout, background and enabled state.
- Cache revalidation after navigation/homepage mutations.
- Phase 22 CSV/menu structure unit tests.

## Deliberate boundaries
- Optional ImportJob/ImportRow persistence is not added because the current preview is stateless and commit revalidates data in a transaction.
- Review-category menu references are not fabricated because no ReviewCategory domain model exists yet.
- Carousel layout is not enabled; card grid, horizontal list and featured+grid are available.

## Verification completed here
- Source-level TypeScript syntax scan found no Phase 22 TS1xxx syntax errors.
- Menu structure helper includes duplicate/cycle/depth validation.
- Schema and migration contain the same MenuItem enhancements.
- Package JSON parses.

## Runtime verification still required
- `npm install`
- `npm run db:validate`
- `npm run db:generate`
- `npm run db:deploy`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- Browser drag/drop and mobile/public homepage QA
- Import transaction tests against MySQL
