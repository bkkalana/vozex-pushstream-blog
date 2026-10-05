import fs from "node:fs";
import path from "node:path";

const roots = ["app", "components"];
const files = [];
for (const root of roots) {
  if (!fs.existsSync(root)) continue;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (/\.(tsx|jsx)$/.test(entry.name)) files.push(file);
    }
  };
  walk(root);
}

const warnings = [];
const stripJsx = (body) => body
  .replace(/<[^>]+>/g, " ")
  .replace(/\{\s*(?:[^{}]|\{[^{}]*\})+\s*\}/g, " DYNAMIC_CONTENT ")
  .replace(/\s+/g, " ")
  .trim();

for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const rawImgs = (source.match(/<img\b/g) || []).length;
  const altAttrs = (source.match(/\balt=/g) || []).length;
  if (rawImgs > altAttrs) warnings.push(`${file}: raw img may be missing alt text`);
  if (/group-hover:visible/.test(source) && !/group-focus-within:visible/.test(source)) {
    warnings.push(`${file}: hover-only disclosure may not be keyboard accessible`);
  }
  if (/outline-none/.test(source) && !/focus-visible:/.test(source)) {
    warnings.push(`${file}: outline-none without local focus-visible replacement`);
  }

  // Only warn when a complete button has neither ARIA naming nor visible/dynamic content.
  for (const match of source.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
    const attrs = match[1];
    const body = match[2];
    if (/aria-label\s*=|aria-labelledby\s*=|title\s*=/.test(attrs)) continue;
    if (stripJsx(body)) continue;
    warnings.push(`${file}: button without an accessible name`);
  }
}

console.log(`Accessibility source audit: ${files.length} TSX/JSX files scanned`);
if (warnings.length) {
  console.error(`Warnings: ${warnings.length}`);
  for (const warning of warnings.slice(0, 80)) console.error(`- ${warning}`);
  process.exit(1);
}
console.log("PASS: no heuristic accessibility warnings found.");
