import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("frontend phase 8 AI tools directory", () => {
  it("uses the V2 CMS-managed AI tools page", () => {
    const page = read("app/(site)/ai-tools/page.tsx");
    const registry = read("lib/site/page-section-registry.ts");
    expect(registry).toContain('key:"ai-tools"');
    expect(page).toContain("getAiToolsV2Page");
    expect(page).toContain("Editor’s Choice");
  });

  it("supports search, category, pricing, free-trial and sort filters", () => {
    const page = read("app/(site)/ai-tools/page.tsx");
    for (const token of ['name="q"', 'name="category"', 'name="pricing"', 'name="freeTrial"', 'name="sort"']) {
      expect(page).toContain(token);
    }
    expect(page).toContain("PaginationV2");
  });

  it("renders desktop table and mobile tool-card fallback", () => {
    const page = read("app/(site)/ai-tools/page.tsx");
    expect(page).toContain("ps-ai-table");
    expect(page).toContain("ps-ai-mobile-list");
    expect(page).toContain("ToolCardV2");
  });

  it("keeps tools and reviews published-only", () => {
    const service = read("services/site/ai-tools-v2.service.ts");
    expect(service).toContain('status: "PUBLISHED"');
    expect(service).toContain("deletedAt: null");
    expect(service).toContain("publishedAt: { lte: now }");
  });

  it("supports CMS manual editor-choice selection", () => {
    const service = read("services/site/ai-tools-v2.service.ts");
    expect(service).toContain("manualSelection");
    expect(service).toContain("selectedFeaturedIds");
  });
});
