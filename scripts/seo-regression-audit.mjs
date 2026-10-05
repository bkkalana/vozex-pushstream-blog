import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const failures = [];
const passes = [];

function check(name, ok, detail = "") {
  if (ok) passes.push(name);
  else failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
}

const sitemap = read("public/sitemap.xml");
const robots = read("public/robots.txt");
const search = read("app/(site)/search/page.tsx");
const rootLayout = read("app/layout.tsx");
const rss = read("app/rss.xml/route.ts");
const categoryRss = read("app/(site)/category/[slug]/rss.xml/route.ts");
const manifest = read("app/manifest.ts");
const seoSite = read("lib/seo/site.ts");
const indexNow = read("lib/seo/indexnow.ts");
const indexNowKeyRoute = read("app/indexnow-key.txt/route.ts");
const seoAdminPage = read("app/admin/(protected)/seo/page.tsx");
check("manifest exists with 192/512 icons", manifest.includes("favicon-192.png") && manifest.includes("favicon-512.png"));
check("Google verification metadata support", rootLayout.includes("googleSiteVerification") && seoSite.includes("seo.googleSiteVerification"));
check("Bing verification metadata support", rootLayout.includes("msvalidate.01") && seoSite.includes("seo.bingSiteVerification"));
check("IndexNow API support", indexNow.includes("api.indexnow.org/indexnow") && indexNow.includes("keyLocation") && indexNow.includes("urlList"));
check("IndexNow key route", indexNowKeyRoute.includes("getIndexNowKey") && indexNowKeyRoute.includes("text/plain"));
check("Bing admin settings", seoAdminPage.includes("Bing Webmaster Tools verification code") && seoAdminPage.includes("IndexNow key"));
check("square Google favicon metadata", rootLayout.includes("favicon-512.png"));
check("default OG image fallback", seoSite.includes("/branding/default-og.png"));
check("WebSite schema supports alternateName", read("lib/seo/schema.ts").includes("alternateName"));
check("physical sitemap XML", sitemap.startsWith("<?xml") && sitemap.includes("<urlset"));
check("sitemap production origin", sitemap.includes("https://pushstream.online/"));

for (const route of ["/", "/latest", "/ai-tools", "/reviews", "/comparisons", "/about", "/contact", "/guides", "/resources"]) {
  const absolute = `https://pushstream.online${route === "/" ? "/" : route}`;
  check(`sitemap static route ${route}`, sitemap.includes(`<loc>${absolute}</loc>`));
}
check("robots advertises sitemap", robots.includes("Sitemap: https://pushstream.online/sitemap.xml"));
check("robots blocks admin", robots.includes("Disallow: /admin/"));
check("robots blocks api", robots.includes("Disallow: /api/"));
check("robots allows search page to expose noindex", !robots.includes("Disallow: /search"));
check("robots blocks preview", robots.includes("Disallow: /preview/"));
check("search page noindex", /robots:\s*\{index:false/.test(search));
check("root RSS alternate", rootLayout.includes('application/rss+xml'));
check("root RSS has self link", rss.includes('rel="self"') && rss.includes('xmlns:atom'));
check("category RSS has self link", categoryRss.includes('rel="self"') && categoryRss.includes('xmlns:atom'));

const metadataTargets = [
  "app/(site)/comparisons/page.tsx",
  "app/(site)/guides/page.tsx",
  "app/(site)/resources/page.tsx",
  "app/(site)/guides/[slug]/page.tsx",
  "app/(site)/series/[slug]/page.tsx",
];
for (const file of metadataTargets) {
  const text = read(file);
  check(`${file} metadata`, /metadata|generateMetadata/.test(text));
  check(`${file} canonical`, /canonical|canonicalPath/.test(text));
}

console.log(`SEO regression checks passed: ${passes.length}`);
if (failures.length) {
  console.error(`SEO regression failures: ${failures.length}`);
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}
console.log("SEO source regression audit passed.");
