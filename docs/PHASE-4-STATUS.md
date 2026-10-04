# Phase 4 Status — Media Library + Advanced Article Editor

## Implemented
- Database-backed Media Library route at `/admin/media`.
- Strict upload allowlist for decoded JPG, PNG, WebP and AVIF files.
- File signature detection, Sharp decode validation, pixel-count and upload-size guards.
- Local production storage path configuration and date-partitioned filenames.
- Automatic WebP `thumb`, `card`, and `article` variants.
- Media metadata editing, copy URL, list/grid presentation and referenced-media delete protection.
- Normalized `MediaVariant` model and migration SQL.
- TipTap JSON article editor with headings, marks, lists, quotes, code, links, images, YouTube and tables.
- Structured custom blocks for Quick Answer, Important, Info, Tip, Warning, Pros/Cons, Affiliate Disclosure, Comparison Table, Steps, CTA, Newsletter, Ad Placeholder and Related Post.
- Fullscreen editing and 30-second dirty-only autosave for existing posts.
- Media picker for post featured images and alt text.
- Revision list and safe restore endpoints. Restore snapshots the current state first.
- Authenticated article preview using the same structured JSON content.

## Security decisions
SVG upload is intentionally disabled in this phase. The specification only permits SVG when sanitized; unsafe SVG acceptance is preferable to reject rather than implement incompletely. Raster uploads are validated by file signature and decoded by Sharp instead of trusting extension or browser MIME alone.

## Remaining verification gates
Run with installed dependencies and a real MySQL database:
1. `npm run db:validate`
2. `npm run db:generate`
3. `npm run db:deploy`
4. `npm run typecheck`
5. `npm run lint`
6. `npm test`
7. `npm run build`
8. Browser test uploads, editor autosave, media delete protection, preview and revision restore.
