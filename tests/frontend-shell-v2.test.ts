import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read=(file:string)=>fs.readFileSync(path.join(process.cwd(),file),"utf8");

describe("frontend v2 global shell",()=>{
  it("keeps the public layout wired through the stable SiteHeader/SiteFooter import contract",()=>{
    const layout=read("app/(site)/layout.tsx");
    expect(layout).toContain("@/components/site/site-header");
    expect(layout).toContain("@/components/site/site-footer");
  });
  it("routes the stable shell exports to the V2 implementation",()=>{
    expect(read("components/site/site-header.tsx")).toContain("V2SiteHeader");
    expect(read("components/site/site-footer.tsx")).toContain("V2SiteFooter");
  });
  it("contains screenshot-oriented header controls and active navigation",()=>{
    const header=read("components/site/v2/layout/site-header-client.tsx");
    expect(header).toContain("usePathname");
    expect(header).toContain("Subscribe");
    expect(header).toContain("Mobile navigation");
    expect(header).toContain("ps-nav-link-active");
  });
  it("keeps footer navigation and social URLs database/settings driven",()=>{
    const footer=read("components/site/v2/layout/site-footer.tsx");
    const service=read("services/site/home.service.ts");
    expect(footer).toContain('chrome.menus.get("footer")');
    expect(service).toContain('setting.get("social.facebook")');
    expect(service).toContain("footerBrandCardTitle");
  });
});
