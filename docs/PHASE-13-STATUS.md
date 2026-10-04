# Phase 13 — Security Hardening & Reliability Status

## Implemented

- Same-origin CSRF enforcement for state-changing `/api/admin/*` and `/api/auth/*` requests.
- Fetch Metadata (`Sec-Fetch-Site`) cross-site rejection.
- Production `__Host-` admin session cookie with Secure + HttpOnly + SameSite=Strict.
- Session token hash-only database storage retained; session last-seen touch is bounded.
- Login IP/session audit identifiers changed to keyed privacy hashes.
- Password-reset request/confirm rate limiting.
- Recursive secret redaction in structured logs and audit metadata.
- Central security headers including CSP, nosniff, referrer policy, Permissions Policy and clickjacking protections.
- HSTS deployment guidance documented (not force-enabled before final HTTPS verification).
- JSON-LD script-context breakout prevention through escaped serializer.
- Rich article content remains React-node rendered with safe URL schemes instead of raw stored HTML.
- Ad snippets sanitized at save time and render time; arbitrary script/event execution removed.
- Raster upload signature validation, pixel limits, server-side re-encoding and metadata stripping.
- SVG remains rejected rather than accepting unsanitized SVG.
- Random server filenames and control-character cleanup for original display filenames.
- Static source audit confirms all current admin mutation API routes and protected server actions contain server-side auth/permission guards.
- Affiliate click abuse cap uses keyed IP hashes in the existing engagement throttle table; over-limit requests still redirect but no longer inflate click analytics.
- Security regression tests added for JSON-LD, ad sanitization, CSP directives and admin mutation guard policy.

## Verification completed in this workspace

- TypeScript parser audit: 272 `.ts/.tsx` files, 0 syntax diagnostics.
- Static admin API mutation guard violations: 0.
- Static protected server-action guard violations: 0.
- Remaining raw `dangerouslySetInnerHTML` use is limited to the centralized safe JSON-LD component and sanitized ad renderer.

## Runtime verification still required

This workspace does not contain the project's installed dependency tree or a configured MySQL instance. The following remain runtime gates and must not be treated as passed yet:

- `npm install`
- `npm run db:validate`
- `npm run db:generate`
- `npm run typecheck`
- `npm run lint`
- `npm run test:security`
- `npm test`
- `npm run build`
- Browser CSRF smoke test through the production Nginx proxy
- Login throttling/password reset throttling timing verification
- Logout/session expiry end-to-end verification
- Upload/decode tests with malformed and oversized files
- Final CSP compatibility test with any explicitly approved analytics/ad providers

## Deployment note

Enable HSTS only after HTTPS is confirmed for the final production domain and every subdomain covered by `includeSubDomains`.
