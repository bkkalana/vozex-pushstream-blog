import { getSiteChrome } from "@/services/site/home.service";
import { V2SiteHeaderClient } from "@/components/site/v2/layout/site-header-client";

const fallback=[
  ["Home","/"],["AI Tools","/ai-tools"],["WordPress","/wordpress"],["Development","/development"],
  ["Reviews","/reviews"],["How-To","/how-to"],["Products","/resources"],["Contact","/contact"],
].map(([label,url],index)=>({id:`fallback-v2-${index}`,label,url,external:false,parentId:null}));

export async function V2SiteHeader(){
  const chrome=await getSiteChrome();
  const configured=chrome.menus.get("header")??[];
  const items=configured.length?configured:fallback;
  const mega=chrome.menus.get("mega")??[];
  return <V2SiteHeaderClient siteName={chrome.siteName} logoUrl={chrome.logoUrl} items={items} megaItems={mega}/>;
}
