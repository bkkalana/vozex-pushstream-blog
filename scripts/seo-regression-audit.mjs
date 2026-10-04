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

const sitemap = read("app/sitemap.ts");
const robots = read("app/robots.ts");
const search = read("app/(site)/search/page.tsx");
const rootLayout = read("app/layout.tsx");
const rss = read("app/rss.xml/route.ts");
const categoryRss = read("app/(site)/category/[slug]/rss.xml/route.ts");

for (const route of ["/", "/latest", "/ai-tools", "/reviews", "/comparisons", "/about", "/contact", "/guides", "/resources"]) {
  check(`sitemap static route ${route}`, sitemap.includes(`\"${route}\"`) || sitemap.includes(`'${route}'`));
}
check("sitemap published posts filter", /status:\s*"PUBLISHED"/.test(sitemap) && /publishedAt:\s*\{lte:now\}/.test(sitemap));
check("sitemap guide detail coverage", sitemap.includes("featuredCollection.findMany") && sitemap.includes("/guides/${x.slug}"));
check("sitemap series coverage", sitemap.includes("contentSeries.findMany") && sitemap.includes("/series/${x.slug}"));
check("robots blocks admin", robots.includes('"/admin/"'));
check("robots blocks api", robots.includes('"/api/"'));
check("robots blocks search", robots.includes('"/search"'));
check("robots blocks preview", robots.includes('"/preview/"'));
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
