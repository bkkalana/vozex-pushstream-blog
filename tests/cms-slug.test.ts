import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "@/lib/cms/slug";
describe("CMS slugs",()=>{it("normalizes titles",()=>expect(slugify("  Hello, Next.js World!  ")).toBe("hello-next-js-world"));it("resolves collisions",async()=>{const used=new Set(["hello-world","hello-world-2"]);expect(await uniqueSlug("Hello World",async s=>used.has(s))).toBe("hello-world-3")})});
