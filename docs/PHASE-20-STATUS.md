# Phase 20 Status — Reusable Content, Revisions, Duplication & Bulk Operations

## Implemented
- Normalized ContentBlock + ContentBlockUsage models.
- Shared dynamic block renderer and static-copy insertion path.
- Content block admin CRUD foundation with archive-on-in-use deletion safety.
- Post editor reusable-block picker.
- Post duplication now copies taxonomy/media/SEO/editorial flags while excluding views, comments, analytics and publication history.
- Page, Review, AI Tool and Comparison duplication service/API creating DRAFT copies with unique slugs.
- Bulk post operations: publish/unpublish/archive/trash/restore/permanent delete, author/category/tag and featured changes, transaction wrapped.
- Trash listing corrected and permanent deletion restricted to trashed records.
- Advanced revision comparison endpoint and UI showing metadata plus added/removed text summaries.
- Restore still snapshots current state first, preserving revision history.

## Runtime gates still required
- Prisma validate/generate/migrate on MySQL.
- Typecheck/lint/tests/build with installed dependencies.
- Browser tests for shared block rendering, bulk selection UI integration and revision compare.
