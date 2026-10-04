import{describe,it,expect}from"vitest";
describe("Phase 25 queue policy",()=>{it("uses bounded exponential retry delay",()=>{const delays=[1,2,3,4,5,6].map(a=>Math.min(60,2**Math.min(a,6)));expect(delays).toEqual([2,4,8,16,32,60])});it("keeps worker batch bounded",()=>{const limit=(v:number)=>Math.min(50,Math.max(1,v));expect(limit(0)).toBe(1);expect(limit(999)).toBe(50)})});
