# Performance and Caching

## Cache policy

PushStream uses short public revalidation windows plus on-demand invalidation after editorial changes. Cached DB data is tagged through `lib/cache/` so the storage strategy can later be replaced or complemented by Redis without spreading Redis-specific calls throughout the application.

- Homepage configuration: 5 minutes
- Published article reads: 5 minutes
- Header/footer/navigation chrome: 10 minutes
- Main public routes: 5-minute ISR/revalidation windows where appropriate
- Admin/authenticated data: not placed in the public cache

Admin mutations invalidate relevant cache tags and public route patterns.

## Query policy

- Public lists must paginate and use bounded `take` values.
- Card queries select only fields required by the card.
- Expensive analytics should prefer daily aggregate tables over loading raw event rows.
- Raw-event diagnostic scans must have explicit upper bounds.
- New high-frequency query patterns require index review.

## Image policy

Use `next/image` for layout images with known dimensions/aspect ratio. Article editor images and administrator-supplied arbitrary logo URLs are exceptions where dimensions or remote host allowlists may not be known at render time. Media uploads are already normalized into optimized variants; Phase 15 visual QA should continue replacing safe raw-image cases where useful.

## Runtime review

After deployment, run Lighthouse or an equivalent lab audit on `/`, a representative `/article/...`, `/category/...`, and `/ai-tools`. Treat `performance-budget.json` as the release baseline and verify results using realistic production content and network conditions.
