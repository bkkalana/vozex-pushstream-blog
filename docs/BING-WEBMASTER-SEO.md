# Bing Webmaster Tools + IndexNow Setup

PushStream includes Bing ownership verification, sitemap discovery and IndexNow support.

## 1. Add PushStream to Bing Webmaster Tools

You can either import the verified property from Google Search Console or add `https://pushstream.online` directly in Bing Webmaster Tools.

For meta-tag verification:
1. In Bing Webmaster Tools choose the HTML meta tag verification method.
2. Copy only the `content` value from `<meta name="msvalidate.01" content="...">`.
3. Open **Admin > SEO & Redirects** in PushStream.
4. Paste it into **Bing Webmaster Tools verification code** and save.
5. Verify the site in Bing Webmaster Tools.

## 2. Submit the sitemap

Submit:

`https://pushstream.online/sitemap.xml`

The same sitemap is advertised in `robots.txt` and is suitable for both Google and Bing.

## 3. Configure IndexNow

1. Generate an IndexNow key (8–128 hexadecimal-style characters is recommended).
2. Open **Admin > SEO & Redirects**.
3. Paste the key into **IndexNow key** and save.
4. Confirm `https://pushstream.online/indexnow-key.txt` returns the key.
5. Use **Bing / IndexNow submission** in the admin page for a manual URL submission when needed.

Published post create/update/publish flows also notify IndexNow automatically for the post and related discovery URLs when production mode and a key are configured.

## 4. Bing crawl/index checklist

- Keep production `robotsIndex` enabled.
- Do not block public pages in `robots.txt`.
- Keep canonical URLs on indexable pages.
- Use unique titles and meta descriptions.
- Keep the sitemap limited to canonical, public, indexable URLs.
- Review Bing Webmaster Tools > URL Inspection / Site Scan for crawl, canonical, noindex and content-quality problems.
- IndexNow tells participating engines about URL changes but does not guarantee indexing or ranking.

## 5. Recommended launch verification

Check these public URLs after deployment:

- `/robots.txt`
- `/sitemap.xml`
- `/indexnow-key.txt`
- `/manifest.webmanifest`
- `/rss.xml`

Then verify the homepage and a representative article in Bing URL Inspection.
