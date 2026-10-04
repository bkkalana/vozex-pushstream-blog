# Phase 23 Status

## Implemented
- Weighted relevance search across published Articles, Pages, AI Tools, Reviews and Categories.
- Search ranking boosts exact/prefix/title matches above excerpt/supporting-field matches, with category/tag relevance signals for posts.
- Multi-entity autocomplete for Articles, AI Tools and Categories with existing debounce/keyboard UX.
- Search result click tracking and expanded popular/zero-result/trending analytics.
- Related-content ranking by category/tag overlap with current-post exclusion and deduplication.
- ContentSeries and ordered ContentSeriesPost membership.
- Public series route and article Part X of Y / previous-next series navigation.
- FeaturedCollection and ordered polymorphic collection items.
- Public /guides and /guides/[slug] routes.
- ResourceCategory / Resource directory with admin create/publish/delete flow and public /resources route.
- New series/collections/resources RBAC permissions and admin navigation.
- Phase 23 migration.
- Fixed inherited SearchLog field mismatch in AI-tool view tracking.

## Intentional boundaries
- Current implementation remains Prisma/MySQL. A separate search service/repository boundary is retained so Meilisearch/Typesense/Elasticsearch can be introduced later without rewriting public UI.
- MySQL FULLTEXT is not forced onto structured JSON article documents before production dataset profiling. Current ranking searches indexed relational/editorial fields and bounded candidate sets.
- Normalized collection/series membership is complete. A richer visual member picker and drag-and-drop item editor is a polish item, not represented as complete.

## Runtime verification pending
The artifact workspace does not contain the project's installed dependency tree or configured MySQL test database, so Prisma validation/generation/migration, full TypeScript typecheck, lint, tests and production build are not marked as passed here.
