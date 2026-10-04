"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Mail, Menu, Search, Waves, X } from "lucide-react";

type Item = {
  id: string;
  label: string;
  url: string;
  external?: boolean;
  openInNewTab?: boolean;
  nofollow?: boolean;
  sponsored?: boolean;
  cssIdentifier?: string | null;
  parentId?: string | null;
};

function relFor(item: Item) {
  return [
    item.external || item.openInNewTab ? "noopener noreferrer" : "",
    item.nofollow ? "nofollow" : "",
    item.sponsored ? "sponsored" : "",
  ].filter(Boolean).join(" ") || undefined;
}

function Brand({ siteName, tagline, logoUrl }: { siteName: string; tagline: string; logoUrl?: string }) {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-2.5">
      {!logoUrl ? <span className="grid size-8 place-items-center rounded-md bg-[#eaf4ff] text-[var(--primary)]"><Waves size={22} aria-hidden="true" /></span> : null}
      {logoUrl ? <img src={logoUrl} alt="" aria-hidden="true" className="h-9 w-auto max-w-36 object-contain" /> : null}
      <span className="min-w-0">
        <span className="block text-[1.35rem] font-black leading-none tracking-tight">
          {siteName.startsWith("Push") ? <><span>Push</span><span className="text-[var(--primary)]">Stream</span></> : siteName}
        </span>
        <span className="mt-1 hidden text-[.68rem] font-semibold leading-none text-[var(--text-muted)] sm:block">{tagline}</span>
      </span>
    </Link>
  );
}

export function SiteHeaderClient({ siteName, tagline, logoUrl, items, megaItems }: { siteName: string; tagline: string; logoUrl?: string; items: Item[]; megaItems: Item[] }) {
  const [open, setOpen] = useState(false);
  const roots = items.filter((item) => !item.parentId);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-[#dcecff] bg-white/92 shadow-[0_1px_0_rgba(8,55,118,.04)] backdrop-blur-xl">
      <div className="site-container flex min-h-[72px] items-center justify-between gap-5">
        <Brand siteName={siteName} tagline={tagline} logoUrl={logoUrl} />

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 text-sm font-bold lg:flex">
          {roots.map((item) => {
            const children = megaItems.filter((child) => child.parentId === item.id);
            return (
              <div key={item.id} className="group relative">
                <Link
                  href={item.url}
                  target={item.openInNewTab || item.external ? "_blank" : undefined}
                  rel={relFor(item)}
                  id={item.cssIdentifier ?? undefined}
                  className="inline-flex min-h-11 items-center gap-1 rounded-md px-3 text-[var(--foreground)] transition hover:bg-[#eef6ff] hover:text-[var(--primary)]"
                >
                  {item.label}
                  {children.length ? <ChevronDown size={14} aria-hidden="true" /> : null}
                </Link>
                {children.length ? (
                  <div className="invisible absolute left-0 top-full w-64 translate-y-2 rounded-md border border-[var(--border)] bg-white p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    {children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.url}
                        target={child.openInNewTab || child.external ? "_blank" : undefined}
                        rel={relFor(child)}
                        id={child.cssIdentifier ?? undefined}
                        className="block rounded-md px-3 py-2.5 text-sm font-semibold hover:bg-[var(--background-soft)] hover:text-[var(--primary)]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/search" aria-label="Search PushStream" className="touch-target grid place-items-center rounded-md text-[var(--foreground)] transition hover:bg-[#eef6ff] hover:text-[var(--primary)]">
            <Search size={18} aria-hidden="true" />
          </Link>
          <Link href="/#newsletter" className="hidden min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(8,119,255,.22)] transition hover:bg-[var(--primary-hover)] sm:inline-flex">
            <Mail size={15} aria-hidden="true" />
            Subscribe
          </Link>
          <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-primary-navigation" onClick={() => setOpen((value) => !value)} className="touch-target grid place-items-center rounded-md border border-[var(--border)] bg-white lg:hidden">
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-primary-navigation" className="border-t border-[var(--border)] bg-white lg:hidden">
          <nav aria-label="Mobile primary navigation" className="site-container py-3">
            {roots.map((item) => (
              <Link onClick={() => setOpen(false)} href={item.url} key={item.id} className="block min-h-12 border-b border-[var(--border)] py-3.5 text-base font-extrabold last:border-0">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
