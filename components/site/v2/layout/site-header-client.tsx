"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Mail, Menu, Search, X } from "lucide-react";
import { PublicBrand } from "@/components/site/v2/layout/brand";

type Item={id:string;label:string;url:string;external?:boolean;openInNewTab?:boolean;nofollow?:boolean;sponsored?:boolean;cssIdentifier?:string|null;parentId?:string|null};

function relFor(item:Item){return [item.external||item.openInNewTab?"noopener noreferrer":"",item.nofollow?"nofollow":"",item.sponsored?"sponsored":""].filter(Boolean).join(" ")||undefined}
function active(pathname:string,url:string){
  if(!url.startsWith("/"))return false;
  const clean=url.split(/[?#]/)[0]||"/";
  if(clean==="/")return pathname==="/";
  return pathname===clean||pathname.startsWith(`${clean}/`);
}

export function V2SiteHeaderClient({siteName,logoUrl,items,megaItems}:{siteName:string;logoUrl?:string;items:Item[];megaItems:Item[]}){
  const pathname=usePathname();
  const [open,setOpen]=useState(false);
  const [mobileOpen,setMobileOpen]=useState<string|null>(null);
  const dialogRef=useRef<HTMLDivElement>(null);
  const menuButtonRef=useRef<HTMLButtonElement>(null);
  const roots=items.filter(x=>!x.parentId);

  useEffect(()=>{setOpen(false);setMobileOpen(null)},[pathname]);
  useEffect(()=>{
    if(!open)return;
    const dialog=dialogRef.current;
    const focusables=()=>Array.from(dialog?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')??[]);
    requestAnimationFrame(()=>focusables()[0]?.focus());
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){ event.preventDefault(); setOpen(false); return; }
      if(event.key!=="Tab")return;
      const items=focusables();
      if(!items.length)return;
      const first=items[0],last=items[items.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    };
    document.addEventListener("keydown",onKey);
    const previous=document.body.style.overflow; document.body.style.overflow="hidden";
    return()=>{document.removeEventListener("keydown",onKey);document.body.style.overflow=previous;menuButtonRef.current?.focus();};
  },[open]);

  return <header className="ps-header sticky top-0 z-50 border-b border-[var(--ps-border)] bg-white/95 backdrop-blur-xl">
    <div className="ps-container-wide flex h-[68px] items-center gap-5">
      <PublicBrand siteName={siteName} logoUrl={logoUrl}/>
      <nav aria-label="Primary navigation" className="ml-auto hidden h-full items-stretch xl:flex">
        {roots.map(item=>{
          const children=megaItems.filter(child=>child.parentId===item.id);
          const isActive=active(pathname,item.url)||children.some(x=>active(pathname,x.url));
          return <div className="group relative flex h-full items-center" key={item.id}>
            <Link href={item.url} target={item.openInNewTab||item.external?"_blank":undefined} rel={relFor(item)} id={item.cssIdentifier??undefined} aria-current={isActive?"page":undefined} className={`ps-nav-link ${isActive?"ps-nav-link-active":""}`}>
              {item.label}{children.length?<ChevronDown size={13} strokeWidth={2.5} aria-hidden="true"/>:null}
            </Link>
            {children.length?<div className="ps-nav-dropdown invisible absolute left-1/2 top-[calc(100%-6px)] w-64 -translate-x-1/2 translate-y-2 opacity-0 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              {children.map(child=><Link key={child.id} href={child.url} target={child.openInNewTab||child.external?"_blank":undefined} rel={relFor(child)} className={`ps-nav-dropdown-link ${active(pathname,child.url)?"ps-nav-dropdown-link-active":""}`}>{child.label}</Link>)}
            </div>:null}
          </div>
        })}
      </nav>
      <div className="ml-auto flex items-center gap-2 xl:ml-3">
        <Link href="/search" aria-label="Search PushStream" className="ps-header-icon"><Search size={19} strokeWidth={2.2} aria-hidden="true"/></Link>
        <Link href="/#newsletter" className="ps-header-subscribe hidden sm:inline-flex"><Mail size={16} aria-hidden="true"/>Subscribe</Link>
        <button ref={menuButtonRef} type="button" aria-label={open?"Close menu":"Open menu"} aria-expanded={open} aria-controls="mobile-site-menu" onClick={()=>setOpen(v=>!v)} className="ps-header-icon border border-[var(--ps-border)] xl:hidden">{open?<X size={21}/>:<Menu size={21}/>}</button>
      </div>
    </div>

    {open?<div className="fixed inset-x-0 bottom-0 top-[69px] z-50 bg-[rgba(7,27,74,.28)] backdrop-blur-[2px] xl:hidden" onMouseDown={event=>{if(event.target===event.currentTarget)setOpen(false)}}>
      <div ref={dialogRef} id="mobile-site-menu" className="ml-auto flex h-full w-full max-w-[430px] flex-col overflow-y-auto border-l border-[var(--ps-border)] bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label="Mobile navigation">
        <nav className="px-5 py-4" aria-label="Mobile primary navigation">
          {roots.map(item=>{const children=megaItems.filter(child=>child.parentId===item.id);const isActive=active(pathname,item.url)||children.some(x=>active(pathname,x.url));return <div key={item.id} className="border-b border-[var(--ps-border)] last:border-0">
            <div className="flex items-center gap-2">
              <Link href={item.url} aria-current={isActive?"page":undefined} className={`flex min-h-14 flex-1 items-center py-3 text-[1.02rem] font-extrabold ${isActive?"text-[var(--ps-blue)]":"text-[var(--ps-navy)]"}`}>{item.label}</Link>
              {children.length?<button className="grid size-11 place-items-center rounded-lg text-[var(--ps-muted)] hover:bg-[var(--ps-blue-soft)]" type="button" aria-expanded={mobileOpen===item.id} aria-label={`Toggle ${item.label} submenu`} onClick={()=>setMobileOpen(v=>v===item.id?null:item.id)}><ChevronDown size={18} className={`transition ${mobileOpen===item.id?"rotate-180":""}`}/></button>:null}
            </div>
            {children.length&&mobileOpen===item.id?<div className="mb-3 rounded-xl bg-[var(--ps-surface-soft)] p-2">{children.map(child=><Link key={child.id} href={child.url} className="block rounded-lg px-3 py-3 text-sm font-bold text-[var(--ps-text)] hover:bg-white hover:text-[var(--ps-blue)]">{child.label}</Link>)}</div>:null}
          </div>})}
        </nav>
        <div className="mt-auto border-t border-[var(--ps-border)] p-5">
          <Link href="/search" className="mb-3 flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--ps-border)] font-extrabold text-[var(--ps-navy)]"><Search size={18}/>Search</Link>
          <Link href="/#newsletter" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--ps-blue)] font-extrabold text-white"><Mail size={17}/>Subscribe</Link>
        </div>
      </div>
    </div>:null}
  </header>
}
