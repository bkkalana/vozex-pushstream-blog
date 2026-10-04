import { describe, expect, it } from "vitest";
import { hasPermission } from "@/lib/auth/permissions";

describe("RBAC permission matching", () => {
  it("allows an exact permission", () => expect(hasPermission(["posts.edit"], "posts.edit")).toBe(true));
  it("rejects an unrelated permission", () => expect(hasPermission(["posts.view"], "posts.delete")).toBe(false));
  it("supports namespace wildcard grants", () => expect(hasPermission(["posts.*"], "posts.publish")).toBe(true));
  it("supports global Super Admin wildcard", () => expect(hasPermission(["*"], "roles.manage")).toBe(true));
});
