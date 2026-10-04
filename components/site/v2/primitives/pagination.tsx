import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function withPage(baseHref: string, page: number) {
  const sep = baseHref.includes("?") ? "&" : "?";
  return `${baseHref}${sep}page=${page}`;
}

export function PaginationV2({ page, totalPages, baseHref }: { page: number; totalPages: number; baseHref: string }) {
  if (totalPages <= 1) return null;
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i).filter((p) => p <= totalPages);
  return <nav aria-label="Pagination" className="ps-pagination">
    {page > 1 ? <Link className="ps-page-btn" href={withPage(baseHref, page - 1)} aria-label="Previous page"><ChevronLeft size={17}/></Link> : <span className="ps-page-btn ps-page-disabled"><ChevronLeft size={17}/></span>}
    {pages.map((p) => <Link key={p} href={withPage(baseHref, p)} aria-current={p === page ? "page" : undefined} className={`ps-page-btn ${p === page ? "ps-page-active" : ""}`}>{p}</Link>)}
    {page < totalPages ? <Link className="ps-page-btn" href={withPage(baseHref, page + 1)} aria-label="Next page"><ChevronRight size={17}/></Link> : <span className="ps-page-btn ps-page-disabled"><ChevronRight size={17}/></span>}
  </nav>;
}
