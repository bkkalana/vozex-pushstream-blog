"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/services/site/toc";

export function ArticleToc({
  items,
  mobile = false,
  embedded = false,
}: {
  items: TocItem[];
  mobile?: boolean;
  embedded?: boolean;
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const els = items.map((item) => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: "-15% 0px -70% 0px" });
    els.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [items]);

  const body = <nav aria-label="Table of contents" className="space-y-1">
    {items.map((item) => <a
      key={item.id}
      href={`#${item.id}`}
      className={`block rounded-lg px-3 py-2 text-sm ${item.level === 3 ? "pl-6" : "font-medium"} ${active === item.id ? "bg-[var(--ps-blue-soft)] text-[var(--ps-blue)]" : "text-[var(--ps-muted)] hover:bg-[var(--ps-surface-soft)] hover:text-[var(--ps-navy)]"}`}
    >{item.title}</a>)}
  </nav>;

  if (mobile) {
    return <details className="ps-article-mobile-toc lg:hidden">
      <summary>On this page</summary>
      <div className="mt-3">{body}</div>
    </details>;
  }

  if (embedded) {
    return <div className="ps-article-toc-embedded">
      <p className="ps-sidebar-title">On this page</p>
      <div className="mt-3">{body}</div>
    </div>;
  }

  return <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-auto lg:block">
    <p className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-[var(--ps-muted)]">On this page</p>
    {body}
  </aside>;
}
