import fs from "node:fs";
const source=fs.readFileSync("services/system/settings.service.ts","utf8");
const checks=[
  ["relative asset URL support",source.includes('key==="general.logoUrl"||key==="general.faviconUrl"')&&source.includes("isSafeInternalAssetUrl")],
  ["settings history is non-blocking",source.includes('logger.error("Settings history write failed"')],
  ["settings write happens before history",source.indexOf("prisma.siteSetting.upsert")<source.indexOf("prisma.settingHistory.create")],
  ["GA4 validation retained",source.includes("analytics.googleAnalyticsId")&&source.includes("G-[A-Z0-9]+")],
];
let failed=0;
for(const [name,ok] of checks){console.log(`${ok?"PASS":"FAIL"} ${name}`);if(!ok)failed++;}
if(failed)process.exit(1);
