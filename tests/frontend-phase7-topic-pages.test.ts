import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("frontend phase 7 topic landing pages", () => {
  it("registers all topic-managed pages", () => {
    const registry = read("lib/site/page-section-registry.ts");
    for (const key of ["wordpress", "development", "how-to", "online-business"]) {
      expect(registry).toContain(`key:"${key}"`);
    }
  });

  it("routes all topic pages through the shared V2 renderer", () => {
    for (const route of ["wordpress", "development", "how-to", "online-business"]) {
      const source = read(`app/(site)/${route}/page.tsx`);
      expect(source).toContain("TopicLandingPage");
    }
  });

  it("keeps topic content published-only", () => {
    const service = read("services/site/topic-landing-v2.service.ts");
    expect(service).toContain('status: "PUBLISHED"');
    expect(service).toContain("deletedAt: null");
    expect(service).toContain("publishedAt: { lte: now }");
  });

  it("supports search, topic filtering, pagination and featured-guide selection", () => {
    const page = read("components/site/v2/pages/topic-landing-page.tsx");
    const service = read("services/site/topic-landing-v2.service.ts");
    expect(page).toContain('name="q"');
    expect(page).toContain("FilterPills");
    expect(page).toContain("PaginationV2");
    expect(service).toContain("manualSelection");
  });
});
