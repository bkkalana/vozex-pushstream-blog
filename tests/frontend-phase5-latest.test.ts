import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("frontend phase 5 latest page", () => {
  it("uses the V2 latest service and screenshot-oriented layout", () => {
    const page = read("app/(site)/latest/page.tsx");
    expect(page).toContain("getLatestPageV2Data");
    expect(page).toContain("ps-latest-featured");
    expect(page).toContain("Trending Articles");
    expect(page).toContain("Featured Tools");
  });
  it("keeps latest sections CMS-backed", () => {
    const registry = read("lib/site/page-section-registry.ts");
    expect(registry).toContain('sectionKey:"stats"');
    expect(registry).toContain('sectionKey:"featured"');
    expect(registry).toContain('sectionKey:"articles"');
  });
});
