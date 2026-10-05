import { readFile } from "node:fs/promises";

const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
const robots = await readFile(new URL("../public/robots.txt", import.meta.url), "utf8");

const checks = [
  [sitemap.startsWith("<?xml"), "sitemap.xml must start with an XML declaration"],
  [sitemap.includes("<urlset"), "sitemap.xml must contain <urlset>"],
  [sitemap.includes("https://pushstream.online/"), "sitemap.xml must contain the production site URL"],
  [robots.includes("Sitemap: https://pushstream.online/sitemap.xml"), "robots.txt must advertise sitemap.xml"],
  [robots.includes("Disallow: /admin/"), "robots.txt must block /admin/"],
  [robots.includes("Disallow: /api/"), "robots.txt must block /api/"],
];

let failed = 0;
for (const [ok, message] of checks) {
  if (ok) console.log(`PASS: ${message}`);
  else { console.error(`FAIL: ${message}`); failed += 1; }
}
if (failed) process.exit(1);
