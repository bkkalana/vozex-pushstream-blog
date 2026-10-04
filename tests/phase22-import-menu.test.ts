
import { describe,expect,it } from "vitest";
import { parseCsv,toCsv,csvObjects } from "@/services/import-export/csv";
import { validateMenuStructure } from "@/lib/navigation/menu-structure";

describe("Phase 22 CSV utilities",()=>{
  it("round-trips quoted commas and quotes",()=>{
    const csv=toCsv([{name:'A, B',note:'He said "yes"'}]);
    const rows=csvObjects(csv);
    expect(rows[0]?.name).toBe("A, B");
    expect(rows[0]?.note).toBe('He said "yes"');
  });
  it("parses newlines and empty trailing cells",()=>{
    expect(parseCsv("a,b,c\n1,2,\n").length).toBe(2);
  });
});
describe("Phase 22 menu structure validation",()=>{
  it("accepts nesting and rejects cycles",()=>{
    expect(validateMenuStructure([{id:"a",parentId:null,sortOrder:0},{id:"b",parentId:"a",sortOrder:0}])).toBe(true);
    expect(()=>validateMenuStructure([{id:"a",parentId:"b",sortOrder:0},{id:"b",parentId:"a",sortOrder:0}])).toThrow();
  });
});
