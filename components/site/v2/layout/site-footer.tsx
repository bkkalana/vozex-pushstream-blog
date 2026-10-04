import Link from "next/link";
import { Facebook, Instagram, Linkedin, Rss, Twitter, Youtube } from "lucide-react";
import { getSiteChrome } from "@/services/site/home.service";
import { PublicBrand } from "@/components/site/v2/layout/brand";

type FooterLink={id:string;label:string;url:string;external?:boolean;openInNewTab?:boolean;nofollow?:boolean;sponsored?:boolean};
function relFor(link:FooterLink){return [link.external||link.openInNewTab?"noopener noreferrer":"",link.nofollow?"nofollow":"",link.sponsored?"sponsored":""].filter(Boolean).join(" ")||undefined}
function FooterLinks({title,links}:{title:string;links:FooterLink[]}){return <nav aria-label={title}><h2 className="ps-footer-heading">{title}</h2><div className="mt-3 flex flex-col gap-2">{links.map(link=><Link key={link.id} href={link.url} target={link.external||link.openInNewTab?"_blank":undefined} rel={relFor(link)} className="ps-footer-link">{link.label}</Link>)}</div></nav>}

const fallback:FooterLink[]=[
  {id:"home",label:"Home",url:"/"},{id:"tools",label:"AI Tools",url:"/ai-tools"},{id:"wp",label:"WordPress",url:"/wordpress"},{id:"dev",label:"Development",url:"/development"},
  {id:"reviews",label:"Reviews",url:"/reviews"},{id:"how",label:"How-To",url:"/how-to"},{id:"products",label:"Products",url:"/resources"},{id:"contact",label:"Contact",url:"/contact"},
  {id:"latest",label:"Latest Articles",url:"/latest"},{id:"guides",label:"Guides",url:"/guides"},{id:"comparisons",label:"Tool Comparisons",url:"/comparisons"},{id:"resources",label:"Free Online Tools",url:"/resources"},
  {id:"about",label:"About Us",url:"/about"},{id:"privacy",label:"Privacy Policy",url:"/privacy-policy"},{id:"terms",label:"Terms of Service",url:"/terms"},{id:"affiliate",label:"Affiliate Disclosure",url:"/affiliate-disclosure"},
];

export async function V2SiteFooter(){
  const chrome=await getSiteChrome();
  const configured=(chrome.menus.get("footer")??[]) as FooterLink[];
  const links=configured.length?configured:fallback;
  const thirds=Math.max(1,Math.ceil(links.length/3));
  const columns=[links.slice(0,thirds),links.slice(thirds,thirds*2),links.slice(thirds*2)];
  const socials=[
    {key:"twitter",url:chrome.socials.twitter,label:"X / Twitter",Icon:Twitter},
    {key:"youtube",url:chrome.socials.youtube,label:"YouTube",Icon:Youtube},
    {key:"facebook",url:chrome.socials.facebook,label:"Facebook",Icon:Facebook},
    {key:"linkedin",url:chrome.socials.linkedin,label:"LinkedIn",Icon:Linkedin},
    {key:"instagram",url:chrome.socials.instagram,label:"Instagram",Icon:Instagram},
  ].filter(x=>x.url);

  return <footer className="border-t border-[var(--ps-border)] bg-white text-[var(--ps-text)]">
    <div className="ps-container-wide py-9 lg:py-10">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.15fr_.75fr_.9fr_.7fr_1fr]">
        <div>
          <PublicBrand siteName={chrome.siteName} logoUrl={chrome.logoUrl}/>
          <p className="mt-3 max-w-[270px] text-sm leading-6 text-[var(--ps-muted)]">{chrome.tagline} Practical guides, honest reviews and useful resources for a smarter web.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {socials.map(({key,url,label,Icon})=><a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className="ps-social-icon"><Icon size={16} aria-hidden="true"/></a>)}
            <Link href="/rss.xml" aria-label="RSS feed" className="ps-social-icon"><Rss size={16}/></Link>
          </div>
        </div>
        <FooterLinks title="Quick Links" links={columns[0]}/>
        <FooterLinks title="Popular Resources" links={columns[1]}/>
        <FooterLinks title="Legal" links={columns[2]}/>
        <div className="rounded-2xl bg-[linear-gradient(135deg,#f5faff,#edf6ff)] p-5 ring-1 ring-[var(--ps-border)]">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[var(--ps-blue)] shadow-sm"><span className="text-lg font-black">↗</span></span>
            <div><h2 className="text-sm font-black leading-5 text-[var(--ps-navy)]">{chrome.footer.brandCardTitle}</h2><p className="mt-2 text-xs leading-5 text-[var(--ps-muted)]">{chrome.footer.brandCardBody}</p></div>
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-3 border-t border-[var(--ps-border)] pt-5 text-xs text-[var(--ps-muted)] sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} {chrome.siteName}. All rights reserved.</span>
        <span>{chrome.footer.communityMessage}</span>
      </div>
    </div>
  </footer>
}
