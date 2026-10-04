import { describe, expect, it } from "vitest";
import { paginationSchema } from "@/lib/validation/pagination";
describe("paginationSchema",()=>{ it("applies safe defaults",()=>{ expect(paginationSchema.parse({})).toEqual({page:1,limit:20}); }); it("rejects oversized page size",()=>{ expect(()=>paginationSchema.parse({limit:101})).toThrow(); }); });
