import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

describe("admin mutation authorization policy", () => {
  it("keeps every admin API mutation behind a server-side auth/permission guard", () => {
    const files = walk(path.join(process.cwd(), "app", "api", "admin")).filter((file) => file.endsWith("route.ts"));
    const violations = files.filter((file) => {
      const source = fs.readFileSync(file, "utf8");
      const mutates = /export async function (POST|PUT|PATCH|DELETE)/.test(source);
      return mutates && !/requirePermission|requireSession/.test(source);
    });
    expect(violations).toEqual([]);
  });

  it("keeps protected admin server actions behind a permission/session guard", () => {
    const root = path.join(process.cwd(), "app", "admin", "(protected)");
    const files = walk(root).filter((file) => file.endsWith("actions.ts"));
    const violations = files.filter((file) => !/requirePermission|requireSession/.test(fs.readFileSync(file, "utf8")));
    expect(violations).toEqual([]);
  });
});
