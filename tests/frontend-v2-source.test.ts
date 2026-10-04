import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const required = [
  "components/site/v2/primitives/container.tsx",
  "components/site/v2/primitives/buttons.tsx",
  "components/site/v2/primitives/section-heading.tsx",
  "components/site/v2/primitives/breadcrumbs.tsx",
  "components/site/v2/primitives/rating-stars.tsx",
  "components/site/v2/primitives/pagination.tsx",
  "components/site/v2/primitives/search-box.tsx",
  "components/site/v2/primitives/filter-pills.tsx",
  "components/site/v2/primitives/sidebar-card.tsx",
  "components/site/v2/cards/article-card.tsx",
  "components/site/v2/cards/compact-article-card.tsx",
  "components/site/v2/cards/category-card.tsx",
  "components/site/v2/cards/tool-card.tsx",
  "components/site/v2/cards/review-card.tsx",
  "components/site/v2/cards/author-card.tsx",
  "components/site/v2/cards/feature-card.tsx",
  "components/site/v2/sections/split-hero.tsx",
  "components/site/v2/sections/stats-row.tsx",
  "components/site/v2/sections/newsletter-band.tsx",
];

describe("public frontend v2 source foundation", () => {
  it("contains every phase-1 component", () => {
    for (const file of required) expect(fs.existsSync(path.join(root, file)), file).toBe(true);
  });

  it("keeps design tokens namespaced from the legacy public theme", () => {
    const css = fs.readFileSync(path.join(root, "app/globals.css"), "utf8");
    for (const token of ["--ps-navy", "--ps-blue", "--ps-border", "--ps-content", "--ps-section-space"]) {
      expect(css).toContain(token);
    }
  });
});
