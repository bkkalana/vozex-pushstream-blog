import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("analytics consent mode", () => {
  it("sets consent defaults before loading Google Analytics", () => {
    const layout = read("app/layout.tsx");
    expect(layout).toContain("google-consent-default");
    expect(layout).toContain("gtag('consent', 'default'");
    expect(layout.indexOf("google-consent-default")).toBeLessThan(layout.indexOf("googletagmanager.com/gtag/js"));
  });

  it("updates consent from the custom banner", () => {
    const banner = read("components/site/consent-banner.tsx");
    expect(banner).toContain("gtag(\"consent\", \"update\"");
    expect(banner).toContain("pushstream.analyticsConsent");
    expect(banner).toContain("analytics_storage");
  });
});
