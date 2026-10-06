import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("frontend phase 9 reviews and comparisons", () => {
  it("adds optional ranked review products without replacing existing review fields", () => {
    const schema = read("prisma/schema.prisma");
    expect(schema).toContain("model ReviewProduct");
    expect(schema).toContain("products     ReviewProduct[]");
    expect(schema).toContain('author      User?      @relation("ReviewAuthor"');
  });

  it("keeps review and comparison public queries published-only", () => {
    const reviews = read("services/site/reviews-comparisons-v2.service.ts");
    const reviewService = read("services/reviews/review.service.ts");
    for (const source of [reviews, reviewService]) {
      expect(source).toContain('status: "PUBLISHED"');
      expect(source).toContain("deletedAt: null");
      expect(source).toContain("publishedAt: { lte:");
    }
  });

  it("renders roundup review products, disclosures, verdict and FAQ", () => {
    const page = read("app/(site)/reviews/[slug]/page.tsx");
    expect(page).toContain("Top picks at a glance");
    expect(page).toContain("Ranked products & providers");
    expect(page).toContain("Review disclosure");
    expect(page).toContain("Verdict");
    expect(page).toContain("Frequently Asked Questions");
  });

  it("preserves the existing typed 2-3 product comparison matrix", () => {
    const page = read("app/(site)/comparisons/[slug]/page.tsx");
    expect(page).toContain("valueA");
    expect(page).toContain("valueB");
    expect(page).toContain("valueC");
    expect(page).toContain('type === "BOOLEAN"');
    expect(page).toContain('type === "RATING"');
    expect(page).toContain('type === "BADGE"');
    expect(page).toContain('type === "PRICING"');
  });

  it("keeps existing review screenshots when editing through the current admin form", () => {
    const form = read("components/admin/reviews/review-form.tsx");
    expect(form).toContain("initial.screenshots.map");
    expect(form).toContain("Ranked products / providers");
  });

  it("revalidates homepage review surfaces after admin review and comparison changes", () => {
    const cache = read("lib/cache/invalidation.ts");
    const routes = [
      read("app/api/admin/reviews/route.ts"),
      read("app/api/admin/reviews/[id]/route.ts"),
      read("app/api/admin/comparisons/route.ts"),
      read("app/api/admin/comparisons/[id]/route.ts"),
    ].join("\n");
    expect(cache).toContain("revalidateReviewSurfaces");
    expect(cache).toContain('["/", "/reviews", "/comparisons"]');
    expect(routes.match(/revalidateReviewSurfaces\(\)/g)?.length).toBe(6);
  });
});
