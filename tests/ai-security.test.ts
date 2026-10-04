import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("AI client secret boundary",()=>{
 it("does not reference provider secret environment names in AI client components",()=>{
  const dir=path.join(process.cwd(),"components/admin/ai");
  const content=fs.readdirSync(dir).filter(x=>x.endsWith(".tsx")).map(x=>fs.readFileSync(path.join(dir,x),"utf8")).join("\n");
  expect(content).not.toMatch(/OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY|LOCAL_AI_API_KEY/);
 });
});
