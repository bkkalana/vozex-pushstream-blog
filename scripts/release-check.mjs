import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "package.json", ".env.example", "next.config.ts", "prisma/schema.prisma", "prisma/seed.ts",
  "ecosystem.config.cjs", "deploy/nginx-pushstream.conf", "docs/DEPLOYMENT.md", "docs/SECURITY.md",
  "performance-budget.json", "PLAN.md", "CHECKLIST.md",
  "scripts/production-preflight.sh", "scripts/backup-release-state.sh", "scripts/rollback-application.sh",
  "deploy/DEPLOY-COMMANDS-PHASE16.md",
];
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
const migrations = fs.readdirSync(path.join(root, "prisma/migrations"), { withFileTypes: true }).filter((e) => e.isDirectory()).length;
const placeholders = [];
for (const file of [".env.example", "ecosystem.config.cjs", "deploy/nginx-pushstream.conf"]) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  if (/replace-with|change-me|example\.com/i.test(text)) placeholders.push(file);
}
console.log(`Release files: ${required.length - missing.length}/${required.length}`);
console.log(`Migration directories: ${migrations}`);
console.log(`Expected configuration placeholders: ${placeholders.join(", ") || "none"}`);
if (missing.length) {
  console.error("Missing release files:", missing.join(", "));
  process.exit(1);
}
console.log("Source release-package check passed. Runtime build/database checks are separate gates.");
