
export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  for (let i=0;i<input.length;i++) {
    const ch=input[i], next=input[i+1];
    if (quoted) {
      if (ch === '"' && next === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else {
      if (ch === '"') quoted = true;
      else if (ch === ",") { row.push(cell); cell=""; }
      else if (ch === "\n") { row.push(cell.replace(/\r$/,"")); rows.push(row); row=[]; cell=""; }
      else cell += ch;
    }
  }
  if (cell.length || row.length) { row.push(cell.replace(/\r$/,"")); rows.push(row); }
  return rows.filter(r=>r.some(c=>c.trim()!==""));
}
export function csvObjects(input:string):Record<string,string>[] {
  const rows=parseCsv(input); if(!rows.length)return [];
  const headers=(rows[0]??[]).map(h=>h.trim());
  return rows.slice(1).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??""])));
}
function esc(v:unknown){const s=String(v??"");return /[",\n\r]/.test(s)?`"${s.replaceAll('"','""')}"`:s}
export function toCsv(rows:Record<string,unknown>[]):string{
  if(!rows.length)return "";
  const headers=Array.from(new Set(rows.flatMap(r=>Object.keys(r))));
  return [headers.join(","),...rows.map(r=>headers.map(h=>esc(r[h])).join(","))].join("\n");
}
