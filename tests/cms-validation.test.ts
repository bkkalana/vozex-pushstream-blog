import { describe, expect, it } from "vitest";
import { postInputSchema } from "@/lib/validation/cms";
const base={title:"Test",authorId:"user_1",content:{type:"doc",text:"Hello"},tagIds:[]};
describe("CMS validation",()=>{it("accepts draft",()=>expect(postInputSchema.safeParse(base).success).toBe(true));it("rejects scheduled post without future time",()=>expect(postInputSchema.safeParse({...base,status:"SCHEDULED"}).success).toBe(false));});
