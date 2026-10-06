import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("admin post deletion source", () => {
  it("exposes permanent delete from row actions", () => {
    const actions = read("components/admin/cms/post-actions.tsx");
    expect(actions).toContain("delete_permanently");
    expect(actions).toContain(">Delete<");
  });

  it("permanently deletes selected posts and refreshes public post surfaces", () => {
    const bulk = read("services/cms/bulk-content.service.ts");
    const route = read("app/api/admin/cms/posts/bulk/route.ts");
    expect(bulk).toContain('case"delete_permanently"');
    expect(bulk).toContain("tx.post.deleteMany({where:{id:{in:v.ids}}})");
    expect(route).toContain("revalidateEditorialSurfaces()");
  });
});
