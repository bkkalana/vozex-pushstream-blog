import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("frontend rebuild phase 6 article experience", () => {
  it("keeps core article SEO and tracking contracts", () => {
    const page = read("app/(site)/article/[slug]/page.tsx");
    expect(page).toContain("articleSchema");
    expect(page).toContain("breadcrumbSchema");
    expect(page).toContain("ViewTracker");
    expect(page).toContain("relatedPosts");
    expect(page).toContain("ContentSeriesPost".replace("ContentSeriesPost", "contentSeriesPost"));
  });

  it("renders the screenshot-style article experience", () => {
    const page = read("app/(site)/article/[slug]/page.tsx");
    for (const token of ["ps-article-hero", "ps-quick-answer", "ps-article-sidebar", "Recent Articles", "Categories", "NewsletterBand"]) {
      expect(page).toContain(token);
    }
  });

  it("retains monetization disclosures and placements", () => {
    const page = read("app/(site)/article/[slug]/page.tsx");
    for (const placement of ["ARTICLE_AFTER_INTRO", "ARTICLE_MIDDLE", "ARTICLE_BEFORE_RELATED_POSTS", "SIDEBAR"]) {
      expect(page).toContain(placement);
    }
    expect(page).toContain("Sponsored content");
    expect(page).toContain("Affiliate disclosure");
  });

  it("supports visual technical/tutorial blocks", () => {
    const renderer = read("components/site/article-json-renderer.tsx");
    for (const token of ["TechnicalCodeBlock", "ps-article-step", "ps-article-callout-warning", "ps-article-callout-tip", "ps-article-table-wrap"]) {
      expect(renderer).toContain(token);
    }
  });
});
