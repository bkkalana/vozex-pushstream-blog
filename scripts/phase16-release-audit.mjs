import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const checks = [];
const check = (name, ok) => checks.push([name, Boolean(ok)]);

const ecosystem = read("ecosystem.config.cjs");
const nginx = read("deploy/nginx-pushstream.conf");
const smoke = read("scripts/smoke-production.mjs");
const deploy = read("scripts/deploy-production.sh");
const backup = read("scripts/backup-release-state.sh");
const rollback = read("scripts/rollback-application.sh");
const preflight = read("scripts/production-preflight.sh");
const env = read(".env.example");
const pkg = JSON.parse(read("package.json"));

check("Node >=24 engine", /^>=24/.test(pkg.engines?.node || ""));
check("PM2 port 8021", ecosystem.includes("-p 8021"));
check("Nginx port 8021", nginx.includes("127.0.0.1:8021"));
check("Smoke default port 8021", smoke.includes("127.0.0.1:8021"));
check("Env smoke port 8021", env.includes("SMOKE_BASE_URL=http://127.0.0.1:8021"));
check("Deploy runs preflight", deploy.includes("./scripts/production-preflight.sh"));
check("Deploy creates backup before migration", deploy.indexOf("backup-release-state.sh") < deploy.indexOf("db:deploy"));
check("Deploy uses migrate deploy", deploy.includes("npm run db:deploy"));
check("Deploy does not reset DB", !/(db:reset|migrate reset|db push|bootstrap-clean)/i.test(deploy));
check("Backup includes database", backup.includes("mysqldump"));
check("Backup includes uploads", backup.includes("uploads.tar.gz"));
check("Backup includes source snapshot", backup.includes("source.tar.gz"));
check("Backup includes env", backup.includes("env.backup"));
check("Backup includes checksums", backup.includes("SHA256SUMS.txt"));
check("Rollback explicitly avoids DB rollback", /does NOT reverse database migrations/i.test(rollback));
check("Preflight validates production env", preflight.includes("production-env-check.mjs"));
check("Release deploy command registered", pkg.scripts?.["deploy:production"] === "bash scripts/deploy-production.sh");
check("Production preflight command registered", pkg.scripts?.["preflight:production"] === "bash scripts/production-preflight.sh");

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}: ${name}`);
  if (!ok) failed++;
}
console.log(`Phase 16 release-readiness audit: ${checks.length - failed}/${checks.length} passed`);
if (failed) process.exit(1);
