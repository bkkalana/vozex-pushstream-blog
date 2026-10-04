# Phase 25 Status — Background Jobs & Aggregated Analytics

Phase 25 adds the production-oriented background processing and analytics aggregation layer.

## Implemented

- Database-backed `BackgroundJob` queue.
- Immutable `JobAttempt` history.
- Atomic conditional job claiming.
- Worker leases and stale-running-job recovery.
- Exponential retries with terminal failed state.
- Manual retry/cancel through permission-protected admin API.
- `jobs.view` / `jobs.manage` permissions.
- PM2 `pushstream-worker` process.
- Protected `/api/internal/jobs/process` trigger for cron-only deployments.
- Scheduled publishing producer/processor independent of public requests.
- Daily/current analytics aggregation jobs.
- Maintenance job for expired editor locks, preview tokens, ads and old completed job rows.
- `PostView.deviceGroup` collection without invasive fingerprinting.
- `DailyContentStat.affiliateClicks` and `searchClicks` aggregates.
- Traffic analytics with today/7/30/90/custom ranges, approximate sessions, referrers and device groups.
- Content performance views for top viewed, recently growing, low-traffic review queue, affiliate content and categories.
- Traffic data is descriptive and is not presented as an employee/editorial quality score.
- Database queue is behind a small queue contract so Redis/BullMQ can be introduced later.

## Source-level verification performed

- `package.json` JSON parse: PASS.
- PM2 ecosystem syntax: PASS.
- release shell syntax: PASS.
- required Phase 25 files/models: PASS.
- merge-marker scan: PASS.
- TypeScript TS1xxx diagnostic scan after source fixes: 0.

## Runtime verification still required

The current artifact environment does not provide the final installed dependency tree, configured MySQL test database or target PM2/Nginx host. Therefore these are not marked as passed:

- Prisma validate/generate.
- clean MySQL migration apply.
- multi-worker claim race on MySQL.
- retry/dead-letter integration behavior.
- scheduled-publish idempotency integration test.
- analytics aggregation idempotency integration test.
- full typecheck/lint/test/build.
- PM2 worker lifecycle and restart behavior on the VPS.
- browser QA for the expanded analytics screens.
