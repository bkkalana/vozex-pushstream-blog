# PushStream Google Search setup

The application now generates the technical SEO endpoints automatically from production data.

## Public endpoints
- `/sitemap.xml` — published/indexable canonical URLs only
- `/robots.txt` — crawler rules + sitemap discovery
- `/rss.xml` — latest published articles
- `/manifest.webmanifest` — branded web manifest
- `/branding/favicon-512.png` — Google-friendly square favicon
- `/branding/default-og.png` — default social preview image

## Google Search Console
1. Deploy with `NODE_ENV=production` and `SITE_URL=https://pushstream.online`.
2. Open **Admin > SEO & Redirects**.
3. Paste the `google-site-verification` content value into **Google Search Console verification code** and save.
4. In Search Console, verify the property.
5. Submit `https://pushstream.online/sitemap.xml`.
6. Use URL Inspection for the home page and at least one article.
7. Request indexing only after the production URL, canonical, robots and page content are correct.

## Content rules
- Publish only useful, original content intended for users.
- Give every important page a unique title and useful meta description.
- Use descriptive H1/H2 headings and meaningful internal links.
- Add descriptive image alt text.
- Keep author profiles and dates accurate.
- Do not index search results, confirmation pages, preview pages, admin pages or APIs.
- Use 301 redirects when URLs permanently move.
- Keep canonical URLs on the preferred HTTPS hostname.

## Structured data
The site emits WebSite, Organization, Breadcrumb, Article/BlogPosting, Person and supported Review/FAQ structured data where applicable. Validate representative pages after deployment using Google's testing tools.

## Favicon
Google requires a square favicon and recommends a source larger than 48x48. The project includes square 192px/512px PNGs plus a square multi-resolution ICO generated from the supplied PushStream icon.
