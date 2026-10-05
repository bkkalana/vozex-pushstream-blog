# PushStream Release Checklist

## Source hygiene
- [x] Real `.env` excluded from source archive
- [x] `generated/` excluded and Prisma Client generated during install/build
- [x] `.next`, `node_modules`, logs, backups and TypeScript build cache excluded
- [x] `.env.example` contains placeholders only

## Release structure
- [x] `PLAN.md` present
- [x] `CHECKLIST.md` present
- [x] Deployment, security, Nginx and PM2 files present
- [x] Prisma schema and migrations present

## Validation gates
- [ ] Run with Node.js 24+
- [ ] `npm ci`
- [ ] `npm run db:validate`
- [ ] `npm run audit:prisma-client`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test:security`
- [ ] `npm test`
- [ ] `npm run audit:seo`
- [ ] `npm run audit:performance`
- [ ] `npm run audit:accessibility`
- [ ] `npm run audit:visual-parity`
- [ ] `npm run build`

## Production-only gates
- [ ] Create server `.env` from `.env.example` with unique secrets
- [ ] Validate HTTPS `SITE_URL` and production environment
- [ ] Test clean DB bootstrap on disposable MySQL database
- [ ] Back up DB/release state
- [ ] Deploy migrations/seed according to deployment guide
- [ ] Reload PM2 and validate Nginx/TLS
- [ ] Run production smoke tests


## Google Search / technical SEO
- [x] Dynamic XML sitemap contains only indexable published URLs
- [x] Article and AI-tool images included in sitemap when available
- [x] Empty categories, tags and authors excluded from sitemap
- [x] robots.txt protects private/admin/API routes without blocking public noindex pages
- [x] Google-search-compatible square favicon assets (192/512 + multi-size ICO)
- [x] Default 1200x630 Open Graph image
- [x] WebSite + Organization + Article + Breadcrumb structured data
- [x] Google Search Console verification setting in Admin > SEO
- [x] RSS discovery and canonical metadata retained
- [x] Web manifest and stable branded icons added
- [ ] After production deploy: verify domain in Google Search Console
- [ ] Submit https://pushstream.online/sitemap.xml in Search Console
- [ ] Inspect home page + representative article in URL Inspection
- [ ] Validate article/review structured data with Google Rich Results Test


## Public Page Hero CMS update
- [x] Desktop hero image selector
- [x] Optional mobile hero image selector with desktop fallback
- [x] Hero alt text
- [x] Desktop/mobile focal position
- [x] Overlay strength control
- [x] Hero heading, accent, description and eyebrow remain editable
- [x] Primary and secondary CTA controls wired to major public hero renderers
- [x] Hero enable/disable respected
- [x] Home, Latest, WordPress, Development, How-To, Online Business, AI Tools, Reviews, Comparisons, About, Contact and Resources wired
- [x] Accessibility, integration, visual-parity and SEO source audits pass
