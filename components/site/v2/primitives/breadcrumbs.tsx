import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumbs({ items, className = "" }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={`ps-breadcrumbs ${className}`.trim()}>
      <ol>{items.map((item, index) => <li key={`${item.label}-${index}`}>{index > 0 ? <ChevronRight size={13} aria-hidden="true" /> : null}{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>)}</ol>
    </nav>
  );
}
