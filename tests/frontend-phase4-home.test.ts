import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (file: string) => readFileSync(join(root, file), "utf8");

describe("frontend phase 4 homepage", () => {
  it("uses the page-section CMS rather than the legacy homepage renderer", () => {
    const page = read("app/(site)/page.tsx");
    expect(page).toContain("getHomePageV2Data");
    expect(page).not.toContain("getHomepageData");
  });

  it("contains all screenshot-oriented homepage modules", () => {
    const page = read("app/(site)/page.tsx");
    for (const marker of ["Popular Categories", "Trending Articles", "Latest Articles", "Featured Tools", "Reviews & Comparisons", "NewsletterBand"]) {
      expect(page).toContain(marker);
    }
  });

  it("keeps section ordering controlled by CMS sortOrder", () => {
    const page = read("app/(site)/page.tsx");
    for (const key of ["hero.sortOrder", "stats.sortOrder", "categories.sortOrder", "trending.sortOrder", "latest.sortOrder", "tools.sortOrder", "reviews.sortOrder", "newsletter.sortOrder"]) {
      expect(page).toContain(key);
    }
  });

  it("uses only published public records in the homepage service", () => {
    const service = read("services/site/home-v2.service.ts");
    expect(service).toContain('status: "PUBLISHED"');
    expect(service).toContain("deletedAt: null");
    expect(service).toContain("publishedAt: { lte: now }");
  });

  it("does not render empty post-driven homepage cards after posts are removed", () => {
    const page = read("app/(site)/page.tsx");
    const service = read("services/site/home-v2.service.ts");
    expect(service).toContain("publishedPostCount");
    expect(service).toContain("category._count.posts > 0");
    expect(page).toContain("data.publishedPostCount");
  });

  it("hides the homepage reviews block when there are no review or comparison records", () => {
    const page = read("app/(site)/page.tsx");
    expect(page).toContain("reviews && (data.reviews.length || data.comparisons.length)");
    expect(page).not.toContain("No published reviews or comparisons yet.");
  });
});
