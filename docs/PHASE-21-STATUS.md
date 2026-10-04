# Phase 21 Status — Media Pipeline, Usage Tracking & Storage Abstraction

## Implemented
- Secure raster upload validation using byte signatures plus Sharp decode.
- JPG/PNG/WebP/AVIF only; SVG/executable formats remain disabled.
- Server-side re-encoding and randomized object names.
- WebP variants: thumb, card, medium, article, large, social.
- AVIF card variant.
- `withoutEnlargement` prevents small-image upscaling.
- Configurable sanitized original retention (`MEDIA_KEEP_ORIGINAL`).
- `StorageProvider` interface and `LocalStorageProvider` implementation.
- Media service no longer performs direct filesystem writes.
- Virtual `MediaCollection` / `MediaCollectionItem` folders.
- Collection filtering and assignment UI.
- Usage reporting for posts, categories, AI tools, reviews and homepage config references.
- In-use deletion protection enabled by default.
- Media UI displays variants, usage and collections.
- Default virtual collections seeded idempotently.
- Storage/CDN migration guidance in `docs/MEDIA-PIPELINE.md`.

## Deliberately deferred
- A persisted MediaUsage index. Live normalized relations are queried now so usage data cannot become stale; a denormalized index can be introduced later only if profiling justifies it.
- S3/R2/Cloudinary concrete adapters. The abstraction is implemented; credentials/provider-specific SDKs are not added until a provider is selected.

## Runtime verification still required
- Apply migration on a test MySQL database.
- `prisma validate` and `prisma generate`.
- Magic-byte spoof fixtures.
- Variant dimension/aspect-ratio tests with real images.
- In-use delete integration tests.
- Storage adapter contract tests.
- Full typecheck, lint, test and production build.
