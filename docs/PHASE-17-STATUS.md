# Phase 17 Status — Editorial Workflow, Calendar & Collaboration

## Implemented

- Extended Post workflow states with IN_REVIEW, CHANGES_REQUESTED and APPROVED while retaining legacy REVIEW compatibility.
- Added EditorialReview, EditorialNote, PostEditorLock, PreviewToken and AuthorExpertise normalized models.
- Added reviewDueAt and lastMeaningfulUpdateAt fields to Post.
- Added editorial notification types and RBAC permissions.
- Added Month / Week / List editorial calendar with author/category/status filters.
- Scheduled posts can be drag-dropped to another future date with confirmation and server-side permission checks.
- Calendar day cells can create a new post prefilled for that date.
- Added submit-for-review, request-changes, approve, schedule and publish workflow actions.
- Added private editorial notes with resolve/reopen/delete actions.
- Changed article editor autosave from periodic interval behavior to 10-second debounce after edits with Saving/Saved/Save failed states.
- Added temporary 3-minute editor locks, heartbeat refresh, admin override and cleanup endpoint.
- Added 24-hour hashed secure draft preview tokens and noindex draft preview route.
- Added author dashboard showing own workflow counts and aggregate views without employee-scoring language.
- Added GitHub and normalized expertise topics to author profiles and Person structured data on public author pages.
- Added 6/12/24-month content review reminder page and optional reviewDueAt field.
- Scheduled publishing now uses an atomic updateMany claim so concurrent workers do not publish the same post twice.
- Added editorial cleanup endpoint for expired locks and preview tokens.
- Added Phase 17 migration SQL and validation tests.

## Source verification completed

- TypeScript parser scan: 292 TS/TSX files, 0 syntax diagnostics.
- New editorial workflow/calendar components showed no non-dependency TypeScript diagnostics in the available no-node_modules check after targeted fixes.
- Shell deployment/backup scripts still parse successfully.

## Runtime verification pending

The current workspace does not contain the project dependency tree or configured MySQL database, so the following are intentionally not marked passed:

- prisma validate / generate
- Phase 17 migration apply on test MySQL
- seed permission upgrade verification
- workflow permission integration tests
- concurrent editor lock tests
- autosave browser/failure tests
- calendar reschedule transaction/browser tests
- preview token expiry/revocation tests
- scheduled publish concurrency tests against MySQL
- full typecheck / lint / test / production build

## New internal maintenance endpoint

POST /api/internal/editorial-cleanup
Authorization: Bearer CRON_SECRET

Use periodically to remove expired editor locks and expired/revoked preview tokens.
