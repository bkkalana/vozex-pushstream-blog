import fs from "node:fs";
import path from "node:path";
const roots=["app","components"];
const files=[];
for(const root of roots){if(!fs.existsSync(root))continue;const walk=(d)=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(/\.(tsx|jsx)$/.test(e.name))files.push(p)}};walk(root)}
let warnings=[];
for(const file of files){const s=fs.readFileSync(file,"utf8");
  const rawImgs=(s.match(/<img\b/g)||[]).length; const altAttrs=(s.match(/\balt=/g)||[]).length; if(rawImgs>altAttrs)warnings.push(`${file}: raw img may be missing alt text`);
  if(/group-hover:visible/.test(s)&&!/group-focus-within:visible/.test(s))warnings.push(`${file}: hover-only disclosure may not be keyboard accessible`);
  if(/outline-none/.test(s)&&!/focus-visible:/.test(s))warnings.push(`${file}: outline-none without local focus-visible replacement`);
  const iconButtons=[...s.matchAll(/<button\b[^>]*>/g)].filter(m=>!/aria-label=|aria-labelledby=/.test(m[0])); if(iconButtons.length) warnings.push(`${file}: review ${iconButtons.length} button(s) for accessible names`);
}
console.log(`Accessibility source audit: ${files.length} TSX/JSX files scanned`);
if(warnings.length){console.log(`Warnings: ${warnings.length}`);for(const w of warnings.slice(0,80))console.log(`- ${w}`);process.exitCode=0}else console.log("No heuristic warnings found.");
