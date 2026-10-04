import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const warnings = [];

const mustExist = [
  "package.json", ".env.example", "prisma/schema.prisma", "prisma/seed.ts",
  "ecosystem.config.cjs", "deploy/nginx-pushstream.conf", "scripts/deploy-production.sh",
  "scripts/smoke-production.mjs", "docs/DEPLOYMENT.md", "docs/SECURITY.md",
  "docs/RELEASE.md", "PLAN.md", "CHECKLIST.md"
];
for (const file of mustExist) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing release file: ${file}`);
}
for (let p = 17; p <= 30; p++) {
  const f = path.join(root, "docs", `PHASE-${p}-STATUS.md`);
  if (!fs.existsSync(f)) failures.push(`Missing phase status: docs/PHASE-${p}-STATUS.md`);
}

const schema = fs.readFileSync(path.join(root, "prisma/schema.prisma"), "utf8");
for (const model of [
  "User","Role","Permission","Post","PostRevision","Category","Tag","Media",
  "AiTool","Review","Comparison","NewsletterSubscriber","ContactMessage",
  "AffiliateLink","AdSlot","AuditLog","BackgroundJob","JobAttempt",
  "TwoFactorCredential","SecurityEvent","WebhookEndpoint","WebhookDelivery",
  "FeatureFlag","SettingHistory","ContentSeries","FeaturedCollection","Resource"
]) {
  if (!new RegExp(`\\bmodel\\s+${model}\\b`).test(schema)) failures.push(`Missing schema model: ${model}`);
}

const migRoot = path.join(root, "prisma/migrations");
const migrations = fs.existsSync(migRoot)
  ? fs.readdirSync(migRoot, {withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name).sort()
  : [];
if (!migrations.length) failures.push("No Prisma migrations found.");
if (new Set(migrations).size !== migrations.length) failures.push("Duplicate migration directory names found.");

for (const file of [
  "app/api/v1/articles/route.ts",
  "app/api/v1/categories/route.ts",
  "app/api/v1/ai-tools/route.ts",
  "app/api/v1/reviews/route.ts",
  "app/api/v1/search/route.ts",
  "app/admin/(protected)/calendar/page.tsx",
  "app/admin/(protected)/content-blocks/page.tsx",
  "app/admin/(protected)/system/jobs/page.tsx",
  "app/admin/(protected)/profile/security/page.tsx",
  "app/admin/(protected)/security/events/page.tsx",
  "app/admin/(protected)/settings/features/page.tsx",
  "app/admin/(protected)/webhooks/page.tsx"
]) {
  if (!fs.existsSync(path.join(root,file))) failures.push(`Missing integration surface: ${file}`);
}

for (const base of ["app","components","lib","services","scripts","prisma"]) {
  const dir = path.join(root, base);
  if (!fs.existsSync(dir)) continue;
  const stack=[dir];
  while(stack.length){
    const d=stack.pop();
    for(const ent of fs.readdirSync(d,{withFileTypes:true})){
      if(["node_modules",".next"].includes(ent.name)) continue;
      const f=path.join(d,ent.name);
      if(ent.isDirectory()) stack.push(f);
      else if(/\.(ts|tsx|js|mjs|cjs|sql|prisma|md)$/.test(ent.name)){
        const text=fs.readFileSync(f,"utf8");
        if (/^(<{7}|={7}|>{7})/m.test(text)) failures.push(`Merge marker found: ${path.relative(root,f)}`);
      }
    }
  }
}

const pageRoutes = new Set();
const appDir = path.join(root,"app");
const collectPages = (dir) => {
  for (const ent of fs.readdirSync(dir,{withFileTypes:true})) {
    const f=path.join(dir,ent.name);
    if(ent.isDirectory()) collectPages(f);
    else if(ent.name==="page.tsx"){
      const rel=path.relative(appDir,path.dirname(f)).split(path.sep).filter(x=>!(x.startsWith("(")&&x.endsWith(")")));
      pageRoutes.add("/"+rel.join("/"));
    }
  }
};
collectPages(appDir);
pageRoutes.add("/");
const canMatch=(href)=>{
  if(href.startsWith("/api/")||href.startsWith("/uploads/")||href.startsWith("/_next/")) return true;
  const parts=href.replace(/\/+$/g,"").split("/").filter(Boolean);
  for(const route of pageRoutes){
    const rp=route.replace(/\/+$/g,"").split("/").filter(Boolean);
    if(parts.length!==rp.length) continue;
    let ok=true;
    for(let i=0;i<parts.length;i++){
      if(/^\[.+\]$/.test(rp[i])) continue;
      if(parts[i]!==rp[i]) {ok=false;break;}
    }
    if(ok) return true;
  }
  return false;
};
for(const base of ["app","components"]){
  const dir=path.join(root,base); if(!fs.existsSync(dir)) continue;
  const stack=[dir];
  while(stack.length){
    const d=stack.pop();
    for(const ent of fs.readdirSync(d,{withFileTypes:true})){
      const f=path.join(d,ent.name);
      if(ent.isDirectory()) stack.push(f);
      else if(/\.(tsx|jsx)$/.test(ent.name)){
        const text=fs.readFileSync(f,"utf8");
        for(const m of text.matchAll(/href\s*=\s*["'](\/[^"'?#{}]*)["']/g)){
          const href=m[1]||"/";
          if(!canMatch(href)) warnings.push(`Review static href ${href} in ${path.relative(root,f)}`);
        }
      }
    }
  }
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));
for (const script of ["db:validate","db:generate","db:deploy","db:seed","typecheck","lint","test","build","test:security","audit:performance","audit:accessibility"]) {
  if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
}

console.log(`Integration audit: ${failures.length} failure(s), ${warnings.length} warning(s)`);
console.log(`Pages discovered: ${pageRoutes.size}`);
console.log(`Migrations discovered: ${migrations.length}`);
warnings.slice(0,100).forEach(w=>console.log(`WARN ${w}`));
if (failures.length) {
  failures.forEach(f=>console.error(`FAIL ${f}`));
  process.exit(1);
}
console.log("PASS final source integration audit");
