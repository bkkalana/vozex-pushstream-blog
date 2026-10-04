import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const schema = fs.readFileSync(path.join(root, "prisma/schema.prisma"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const requiredModels = ["PublicPageSection", "PublicPageSectionItem", "ReviewProduct"];
const requiredReviewFields = ["authorId", "products"];
const failures = [];

for (const model of requiredModels) {
  if (!schema.includes(`model ${model} {`)) failures.push(`Schema missing model ${model}`);
}

const reviewMatch = schema.match(/model Review \{([\s\S]*?)\n\}/);
const reviewBody = reviewMatch?.[1] ?? "";
for (const field of requiredReviewFields) {
  if (!reviewBody.includes(field)) failures.push(`Review schema missing field ${field}`);
}

for (const scriptName of ["postinstall", "prebuild", "pretypecheck"]) {
  if (!String(pkg.scripts?.[scriptName] ?? "").includes("prisma generate")) {
    failures.push(`${scriptName} must run prisma generate`);
  }
}

if (fs.existsSync(path.join(root, "generated/prisma"))) {
  failures.push("Release source must not ship a committed generated/prisma client; generate it from prisma/schema.prisma on install/build.");
}

if (failures.length) {
  console.error("Prisma client freshness audit: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Prisma client freshness audit: PASS");
console.log(`Schema models checked: ${requiredModels.length}`);
console.log("Automatic prisma generate hooks: postinstall, prebuild, pretypecheck");
