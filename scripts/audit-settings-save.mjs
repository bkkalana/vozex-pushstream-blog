import fs from "node:fs";
const action=fs.readFileSync("app/admin/(protected)/settings/actions.ts","utf8");
const page=fs.readFileSync("app/admin/(protected)/settings/page.tsx","utf8");
const service=fs.readFileSync("services/system/settings.service.ts","utf8");
const checks=[
  ["actions catch save failures",action.includes('Admin settings save failed')],
  ["actions redirect success",action.includes('resultUrl("saved"')],
  ["actions redirect failure",action.includes('resultUrl("error"')],
  ["cache refresh is guarded",action.includes('Settings cache revalidation failed')],
  ["page shows save success",page.includes('Settings saved successfully.')],
  ["page shows request id",page.includes('Request ID:')],
  ["relative asset urls supported",service.includes('isSafeInternalAssetUrl')],
  ["history writes are guarded",service.includes('Settings history write failed')],
];
let failed=0;
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
if(failed)process.exit(1);
