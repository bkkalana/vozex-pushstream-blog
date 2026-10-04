import Link from "next/link";
import { ArrowRight, Scale } from "lucide-react";

export function ComparisonCardV2({ comparison }: { comparison: { slug: string; title: string; introduction?: string | null; items?: Array<{ productName: string }> } }) {
  const names = comparison.items?.map((item) => item.productName).filter(Boolean).slice(0, 3) ?? [];
  return (
    <article className="ps-card ps-card-hover ps-comparison-card">
      <div className="ps-comparison-visual">
        <Scale size={30} aria-hidden="true" />
        {names.length ? <div>{names.join(" vs ")}</div> : <div>Side-by-side comparison</div>}
      </div>
      <div className="ps-comparison-body">
        <span className="ps-content-label">Comparison</span>
        <h3><Link href={`/comparisons/${comparison.slug}`}>{comparison.title}</Link></h3>
        {comparison.introduction ? <p>{comparison.introduction}</p> : null}
        <Link href={`/comparisons/${comparison.slug}`} className="ps-inline-link">View comparison <ArrowRight size={15} aria-hidden="true" /></Link>
      </div>
    </article>
  );
}
