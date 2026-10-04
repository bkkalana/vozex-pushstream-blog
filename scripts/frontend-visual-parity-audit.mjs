import fs from "node:fs";

const css = fs.readFileSync("app/globals.css", "utf8");
const header = fs.readFileSync("components/site/v2/layout/site-header-client.tsx", "utf8");
const checks = [
  ["Phase 15 parity layer", css.includes("Frontend rebuild Phase 15")],
  ["1240px editorial rail", css.includes("--ps-content: 1240px")],
  ["1320px wide rail", css.includes("--ps-content-wide: 1320px")],
  ["68px desktop header", header.includes('h-[68px]')],
  ["Home tuning", css.includes(".ps-home-v2 .ps-hero-grid")],
  ["Blog tuning", css.includes(".ps-latest-hero-grid")],
  ["Article tuning", css.includes(".ps-article-hero-inner")],
  ["Topic tuning", css.includes(".ps-topic-hero-grid")],
  ["AI tuning", css.includes(".ps-ai-directory-layout")],
  ["Review tuning", css.includes(".ps-review-layout")],
  ["About tuning", css.includes(".ps-about-mission-grid")],
  ["Contact tuning", css.includes(".ps-contact-main-grid")],
  ["Mobile authority", css.includes("Keep Phase 13 small-screen behavior authoritative")],
];
const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"}: ${name}`);
if (failed.length) process.exit(1);
console.log(`Visual parity source audit: ${checks.length}/${checks.length} passed`);
