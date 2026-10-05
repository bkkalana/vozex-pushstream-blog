import { describe, expect, it } from "vitest";
import { sanitizeTrustedAdHtml } from "@/lib/security/safe-html";
import { serializeJsonLd } from "@/components/site/json-ld";
import { contentSecurityPolicy } from "@/lib/security/headers";

describe("security regressions", () => {
  it("neutralizes script-context breakouts in JSON-LD", () => {
    const html = serializeJsonLd({ title: "</script><img src=x onerror=alert(1)>" });
    expect(html).not.toContain("</script>");
    expect(html).toContain("\\u003c/script\\u003e");
  });

  it("removes executable ad HTML", () => {
    const dirty = '<div onclick="alert(1)">Ad</div><script>alert(1)</script><a href="javascript:alert(1)">x</a><iframe srcdoc="<script>x</script>"></iframe>';
    const clean = sanitizeTrustedAdHtml(dirty);
    expect(clean).not.toMatch(/<script/i);
    expect(clean).not.toMatch(/onclick=/i);
    expect(clean).not.toMatch(/javascript:/i);
    expect(clean).not.toMatch(/srcdoc=/i);
  });

  it("ships baseline CSP anti-injection directives", () => {
    const csp = contentSecurityPolicy();
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("https://www.googletagmanager.com");
    expect(csp).toContain("https://www.google-analytics.com");
  });
});
