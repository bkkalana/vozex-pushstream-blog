# Security Baseline

- Secrets remain server-only and are sourced from environment variables.
- Production errors must not expose stack traces, SQL, server paths, tokens, or credentials.
- Admin mutations will require authenticated sessions and explicit RBAC permission checks.
- Inputs and API payloads use Zod validation.
- Password hashing, session security, CSRF controls, login throttling and password reset are implemented in Phase 1.
- Upload MIME validation and SVG sanitization are implemented with the media phase.
- CSP and remaining response headers are finalized before production deployment.
- Logs must never include passwords, tokens or secrets.

## Phase 13 hardening

### CSRF / cross-site mutation protection
Authenticated browser mutations under `/api/admin/*` and `/api/auth/*` are rejected unless the request has a verifiable same-origin `Origin` or `Referer`. Requests explicitly marked `Sec-Fetch-Site: cross-site` are denied. Internal cron endpoints remain bearer-token protected and are excluded from browser CSRF rules.

### Session cookies
Production admin sessions use the `__Host-` cookie prefix, `Secure`, `HttpOnly`, `SameSite=Strict`, path `/`, and no Domain attribute. Only a SHA-256 hash of the session token is stored in MySQL. Session activity is touched at a bounded interval instead of on every render.

### Security headers
Application responses set CSP, `X-Content-Type-Options: nosniff`, strict referrer policy, Permissions Policy, clickjacking protection and cross-origin isolation headers. HSTS must be enabled only after HTTPS is confirmed on the final domain and all subdomains intended for preload/coverage are HTTPS-ready.

Recommended Nginx production header after HTTPS verification:

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

Do not add `preload` until every required subdomain is permanently HTTPS-ready.

### Content and uploads
Rich editor output is rendered as React nodes rather than raw HTML. Links/images are scheme-filtered. SVG uploads remain disabled instead of accepting unsanitized SVG. Raster uploads are signature-checked, decoded with Sharp pixel limits, re-encoded before storage to strip metadata/embedded payloads, and saved under random server filenames.

Administrator ad snippets are sanitized before storage. Script tags, inline event handlers, dangerous URL schemes, `srcdoc`, and high-risk executable tags are removed. A future third-party ad provider that requires JavaScript should use a reviewed provider-specific component rather than arbitrary stored script execution.

### Logs and audits
Logger and audit metadata recursively redact password/token/secret/authorization/cookie/session/API-key fields. Login/session IP identifiers are stored as keyed privacy hashes rather than raw addresses.
