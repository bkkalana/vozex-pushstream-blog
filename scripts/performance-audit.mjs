import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const exts = new Set([".ts", ".tsx"]);
const scanRoots = ["app", "components", "services"];
let clientComponentFiles = 0;
const rawImgFiles = new Set();
const allowedRawImgFiles = new Set([
  "components/site/article-json-renderer.tsx",
  "components/site/navigation/site-header-client.tsx",
  "components/site/v2/primitives/responsive-hero-image.tsx",
]);
const fillImagesMissingSizes = new Set();
const priorityImageFiles = new Set();
const potentiallyUnboundedFindMany = new Set();

function inspect(file) {
  const text = fs.readFileSync(file, "utf8");
  const rel = path.relative(root, file);
  if (/^\s*["']use client["']/m.test(text)) clientComponentFiles++;
  if (/<img\b/.test(text)) rawImgFiles.add(rel);
  if (/<Image\b[\s\S]{0,500}?\bpriority\b/.test(text)) priorityImageFiles.add(rel);
  for (const match of text.matchAll(/<Image\b([\s\S]{0,900}?)\/>/g)) {
    const props = match[1];
    if (/\bfill\b/.test(props) && !/\bsizes\s*=/.test(props)) fillImagesMissingSizes.add(rel);
  }
  for (const match of text.matchAll(/findMany\(\{([\s\S]{0,1600}?)\}\)/g)) {
    if (!/\b(take|skip)\s*:/.test(match[1]) && !/where:\s*\{[^}]*id/.test(match[1])) {
      potentiallyUnboundedFindMany.add(rel);
    }
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next"].includes(ent.name)) continue;
    const file = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(file);
    else if (exts.has(path.extname(ent.name))) inspect(file);
  }
}
for (const dir of scanRoots) walk(path.join(root, dir));

const result = {
  clientComponentFiles,
  rawImgFiles: [...rawImgFiles].sort(),
  fillImagesMissingSizes: [...fillImagesMissingSizes].sort(),
  priorityImageFiles: [...priorityImageFiles].sort(),
  potentiallyUnboundedFindMany: [...potentiallyUnboundedFindMany].sort(),
};
console.log(JSON.stringify(result, null, 2));

const failures = [];
const unexpectedRawImgs = [...rawImgFiles].filter((file) => (file.startsWith("app/(site)/") || file.startsWith("components/site/")) && !allowedRawImgFiles.has(file));
if (unexpectedRawImgs.length) failures.push(`Unexpected public raw <img> found in ${unexpectedRawImgs.length} source file(s): ${unexpectedRawImgs.join(", ")}`);
if (fillImagesMissingSizes.size) failures.push(`next/image fill missing sizes in ${fillImagesMissingSizes.size} source file(s)`);
if (failures.length) {
  for (const item of failures) console.error(`FAIL: ${item}`);
  process.exit(1);
}
console.log("Performance source audit passed. Unbounded-query candidates remain review-only because some are bounded by data model scope or admin usage.");
