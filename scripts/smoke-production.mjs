const base = (process.env.SMOKE_BASE_URL || "http://127.0.0.1:8021").replace(/\/$/, "");
const checks = [
  ["health", "/api/health", [200]],
  ["home", "/", [200]],
  ["search", "/search?q=wordpress", [200]],
  ["latest", "/latest", [200]],
  ["wordpress", "/wordpress", [200]],
  ["ai-tools", "/ai-tools", [200]],
  ["reviews", "/reviews", [200]],
  ["comparisons", "/comparisons", [200]],
  ["about", "/about", [200]],
  ["contact", "/contact", [200]],
  ["guides", "/guides", [200]],
  ["resources", "/resources", [200]],
  ["sitemap", "/sitemap.xml", [200]],
  ["robots", "/robots.txt", [200]],
  ["rss", "/rss.xml", [200]],
  ["admin-login", "/admin/login", [200]],
  ["api-v1-articles", "/api/v1/articles?limit=1", [200]],
  ["api-v1-categories", "/api/v1/categories", [200]],
  ["api-v1-ai-tools", "/api/v1/ai-tools?limit=1", [200]],
  ["api-v1-reviews", "/api/v1/reviews?limit=1", [200]],
  ["api-v1-search", "/api/v1/search?q=wordpress&limit=1", [200]],
];
let failed = 0;
for (const [name, route, allowed] of checks) {
  try {
    const response = await fetch(`${base}${route}`, { redirect: "manual", headers: { "user-agent": "PushStreamReleaseSmoke/1.0" } });
    const ok = allowed.includes(response.status);
    console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${response.status} ${route}`);
    if (!ok) failed++;
  } catch (error) {
    failed++;
    console.log(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
if (failed) process.exit(1);

if (process.env.SMOKE_ARTICLE_SLUG) {
  const route = `/article/${encodeURIComponent(process.env.SMOKE_ARTICLE_SLUG)}`;
  try {
    const response = await fetch(`${base}${route}`, { redirect: "manual", headers: { "user-agent": "PushStreamReleaseSmoke/1.0" } });
    const ok = response.status === 200;
    console.log(`${ok ? "PASS" : "FAIL"} article-detail: ${response.status} ${route}`);
    if (!ok) process.exitCode = 1;
  } catch (error) {
    console.log(`FAIL article-detail: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
