# Phase 24 Status — Affiliate, Sponsored Content, Ads & Campaign Utilities

## Implemented

- AffiliateClick now records sanitized source page and optional source Post ID, without storing new personal identifiers.
- Affiliate analytics dashboard: today, 7 days, 30 days, top links, top source pages and top source articles.
- UTM Builder with safe URL parsing/encoding and Copy action.
- Sponsored Post metadata: sponsor name, sponsor URL and public disclosure text.
- Public sponsored disclosure is displayed separately from editorial content.
- Review disclosure types: Affiliate, Sponsored, Free Review Copy and Independent Editorial, with optional disclosure text.
- Ad slots support start/end scheduling, desktop/tablet/mobile flags, optional category targeting and optional article-type targeting.
- Ad rendering remains sanitized and server code is never evaluated from ad content.
- Ad containers reserve vertical space and retain a visible Advertisement label.
- Phase 24 regression tests cover UTM encoding, affiliate source attribution, ad schedule windows and targeting matching.

## Database migration

`prisma/migrations/20260929210000_phase24_monetization/migration.sql`

## Security / privacy decisions

- Affiliate analytics use referral path and content linkage only; no fingerprinting was added.
- Referrer query strings are not used as `sourcePage` attribution.
- Sponsored and affiliate relationships are visibly disclosed.
- Ad HTML continues through the existing sanitizer and is not executed by server-side code.

## Pending runtime gates

The following require the real installed dependency tree and test MySQL environment and are not claimed as passed here:

- `npm run db:validate`
- `npm run db:generate`
- `npm run db:deploy`
- full `npm run typecheck`
- `npm run lint`
- full test suite
- production `npm run build`
- browser verification of responsive ad device rules and disclosure UI

## Known follow-up

Phase 25 will move scheduled ad activation/expiration observability into the common background-job/worker layer. Current request-time ad eligibility already respects date windows.
