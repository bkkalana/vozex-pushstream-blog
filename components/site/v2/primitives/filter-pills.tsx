import type { ReactNode } from "react";
import Link from "next/link";

export type FilterPill = { label: string; href: string; active?: boolean; icon?: ReactNode };
export function FilterPills({ items, ariaLabel = "Filters" }: { items: FilterPill[]; ariaLabel?: string }) {
  return <nav className="ps-filter-pills" aria-label={ariaLabel}>{items.map((item) => <Link key={`${item.label}-${item.href}`} href={item.href} aria-current={item.active ? "page" : undefined} className={item.active ? "ps-filter-pill ps-filter-pill-active" : "ps-filter-pill"}>{item.icon}{item.label}</Link>)}</nav>;
}
