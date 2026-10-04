import {describe,expect,it} from "vitest";
import {getPageDefinition,isPublicPageKey,isPublicSectionType,PUBLIC_PAGE_DEFINITIONS} from "@/lib/site/page-section-registry";
import {publicPageSectionInput} from "@/lib/validation/public-page-sections";
describe("frontend phase 3 page sections",()=>{
  it("registers the screenshot target pages",()=>{for(const key of ["home","latest","wordpress","ai-tools","about","contact"])expect(isPublicPageKey(key)).toBe(true);expect(PUBLIC_PAGE_DEFINITIONS.length).toBeGreaterThanOrEqual(10)});
  it("provides unique default section keys",()=>{for(const page of PUBLIC_PAGE_DEFINITIONS){const keys=page.defaults.map(x=>x.sectionKey);expect(new Set(keys).size).toBe(keys.length)}});
  it("validates safe CTA URLs",()=>{const base={pageKey:"home",sectionKey:"hero",sectionType:"hero_split",enabled:true,heading:"Hero",description:null,sortOrder:10,dataSource:"manual",itemCount:1,imageId:null};expect(publicPageSectionInput.parse({...base,config:{primaryCtaUrl:"/latest"}}).config.primaryCtaUrl).toBe("/latest");expect(()=>publicPageSectionInput.parse({...base,config:{primaryCtaUrl:"javascript:alert(1)"}})).toThrow()});
  it("knows supported section types",()=>{expect(isPublicSectionType("hero_split")).toBe(true);expect(isPublicSectionType("raw_html")).toBe(false);expect(getPageDefinition("contact")?.href).toBe("/contact")});
});
