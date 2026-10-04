# Phase 21 Media Pipeline

## Security
Uploads accept JPG, PNG, WebP and AVIF only. File extensions are not trusted. The server checks magic bytes, decodes with Sharp, enforces pixel and byte limits, rotates to canonical orientation and re-encodes raster bytes before storage. SVG and executable formats remain disabled.

## Generated variants
Each upload produces purpose-oriented variants without upscaling:
- `thumb` up to 320×320 WebP
- `card` up to 800×600 WebP
- `medium` up to 1200×900 WebP
- `article` up to 1600×1200 WebP
- `large` up to 2200×1600 WebP
- `social` up to 1200×630 WebP crop
- `avif-card` up to 800×600 AVIF

The original sanitized raster can be retained with `MEDIA_KEEP_ORIGINAL=true`.

## Storage abstraction
Media services depend on `StorageProvider` only:
- `upload()`
- `delete()`
- `getPublicUrl()`

The current provider is `LocalStorageProvider`. Future S3-compatible, Cloudflare R2 or Cloudinary adapters should implement the same contract. UI components must never write to disk or object storage directly.

## Usage tracking
`mediaUsageService` reports structured references from posts, category images, AI tool logos/screenshots, review screenshots and homepage configuration. Deletion is blocked by default while known references exist (`MEDIA_PREVENT_DELETE_IN_USE=true`).

## Virtual collections
`MediaCollection` and `MediaCollectionItem` provide folders without moving physical objects. A media item may belong to multiple collections.

## CDN migration
A future object-storage adapter may return CDN URLs from `getPublicUrl`. Existing media records should be migrated by a dedicated migration utility; do not silently rewrite paths during normal requests.
