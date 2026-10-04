export const revalidate = 300;

import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Product Comparisons",
  description: "Side-by-side product comparisons covering pricing, capabilities, key differences and decision factors.",
  alternates: { canonical: "/comparisons" },
};

import Link from "next/link";
import { ArrowRight, GitCompareArrows, Search } from "lucide-react";
import { PublicContainer } from "@/components/site/v2/primitives/container";
import { NewsletterBand } from "@/components/site/v2/sections/newsletter-band";
import { PaginationV2 } from "@/components/site/v2/primitives/pagination";
import { SidebarCard } from "@/components/site/v2/primitives/sidebar-card";
import { getComparisonsLandingData } from "@/services/site/reviews-comparisons-v2.service";

function one(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }
function pageNumber(value: string | string[] | undefined) { const number = Number(one(value) ?? 1); return Number.isFinite(number) && number > 0 ? Math.floor(number) : 1; }
function sectionMap(sections: Awaited<ReturnType<typeof getComparisonsLandingData>>["sections"]) { return new Map<string, any>(sections.map((section: any) => [section.sectionKey, section])); }

export default async function ComparisonsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = one(sp.q)?.trim() || "";
  const page = pageNumber(sp.page);
  const data = await getComparisonsLandingData({ q, page });
  const sections = sectionMap(data.sections);
  const hero = sections.get("hero");
  const listSection = sections.get("comparisons");
  const newsletter = sections.get("newsletter");
  const baseHref = q ? `/comparisons?q=${encodeURIComponent(q)}` : "/comparisons";

  return (
    <main className="ps-comparison-hub">
      <section className="ps-comparison-hub-hero">
        <PublicContainer className="ps-comparison-hub-hero-grid">
          <div>
            <span className="ps-eyebrow">Side-by-side decisions</span>
            <h1>{hero?.heading || "Product Comparisons"}</h1>
            <p>{hero?.description || "Compare products, pricing, capabilities and key differences in one structured table before you choose."}</p>
            <div className="ps-hero-actions"><Link href="#comparisons" className="ps-button ps-button-primary">Browse Comparisons <ArrowRight size={16} /></Link><Link href="/reviews" className="ps-button ps-button-secondary">Read Reviews</Link></div>
          </div>
          <div className="ps-comparison-visual-card"><GitCompareArrows size={38} /><strong>Compare what matters.</strong><span>2–3 products • typed feature rows • direct product links</span></div>
        </PublicContainer>
      </section>

      <section id="comparisons" className="ps-section ps-comparison-hub-content">
        <PublicContainer>
          <div className="ps-review-hub-toolbar">
            <div><span className="ps-eyebrow">Comparisons</span><h2>{listSection?.heading || "Latest comparisons"}</h2></div>
            <form action="/comparisons" method="get" className="ps-latest-search"><Search size={18} /><input name="q" defaultValue={q} placeholder="Search comparisons..." aria-label="Search comparisons" /><button type="submit" aria-label="Search comparisons">Search</button></form>
          </div>

          <div className="ps-comparison-hub-layout">
            <div>
              {data.comparisons.length ? (
                <div className="ps-comparison-grid-v2">
                  {data.comparisons.map((comparison) => (
                    <article key={comparison.id} className="ps-comparison-list-card">
                      <div className="ps-comparison-product-row">
                        {comparison.items.map((item) => <span key={item.id}>{item.productName}</span>)}
                      </div>
                      <h3><Link href={`/comparisons/${comparison.slug}`}>{comparison.title}</Link></h3>
                      {comparison.introduction ? <p>{comparison.introduction}</p> : null}
                      {comparison.features.length ? <div className="ps-comparison-feature-preview">{comparison.features.slice(0, 3).map((feature) => <span key={feature.id}>{feature.feature}</span>)}</div> : null}
                      <Link href={`/comparisons/${comparison.slug}`} className="ps-inline-link">Compare products <ArrowRight size={15} /></Link>
                    </article>
                  ))}
                </div>
              ) : <div className="ps-empty-state">No published comparisons matched your search.</div>}
              <div className="mt-8"><PaginationV2 page={data.page} totalPages={data.pages} baseHref={baseHref} /></div>
            </div>
            <aside className="ps-review-hub-sidebar">
              <SidebarCard title="Latest Reviews">
                <div className="ps-review-comparison-links">{data.reviews.map((review) => <Link key={review.id} href={`/reviews/${review.slug}`}><small>{review.aiTool?.name || "Review"}</small><strong>{review.title}</strong></Link>)}</div>
              </SidebarCard>
              <div className="ps-sidebar-card ps-review-method-card"><span className="ps-eyebrow">Comparison format</span><h2>Consistent feature rows.</h2><p>Text, yes/no, rating, badge and pricing-style values remain typed in the comparison editor.</p></div>
            </aside>
          </div>
        </PublicContainer>
      </section>

      <NewsletterBand title={newsletter?.heading || "Get New Comparisons in Your Inbox"} description={newsletter?.description || "Fresh product comparisons and review updates from PushStream."} />
    </main>
  );
}
