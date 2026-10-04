import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ExternalLink, Star, X } from "lucide-react";
import { JsonLd } from "@/components/site/json-ld";
import { PublicContainer } from "@/components/site/v2/primitives/container";
import { NewsletterBand } from "@/components/site/v2/sections/newsletter-band";
import { SidebarCard } from "@/components/site/v2/primitives/sidebar-card";
import { buildMetadata } from "@/lib/seo/metadata";
import { getEntitySeo } from "@/lib/seo/entity";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { prisma } from "@/lib/db/prisma";
import { comparisonService } from "@/services/comparisons/comparison.service";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const comparison = await prisma.comparison.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null, publishedAt: { lte: new Date() } },
  });
  if (!comparison) return {};
  const meta = await getEntitySeo("COMPARISON", comparison.id);
  return buildMetadata({
    title: meta?.title || comparison.title,
    description: meta?.description || comparison.introduction,
    canonicalPath: `/comparisons/${comparison.slug}`,
    canonicalUrl: meta?.canonicalUrl,
    index: meta?.robotsIndex ?? true,
    follow: meta?.robotsFollow ?? true,
    ogTitle: meta?.ogTitle,
    ogDescription: meta?.ogDescription,
    ogImage: meta?.ogImageUrl,
    twitterTitle: meta?.twitterTitle,
    twitterDescription: meta?.twitterDescription,
    twitterImage: meta?.twitterImageUrl,
  });
}

function renderValue(type: string, value: string | null) {
  if (!value) return <span className="ps-compare-muted">—</span>;
  if (type === "BOOLEAN") {
    const yes = /^(yes|true|1|✓|available)$/i.test(value);
    return <span className={`ps-compare-boolean ${yes ? "is-yes" : "is-no"}`}>{yes ? <Check size={15} /> : <X size={15} />}{yes ? "Yes" : "No"}</span>;
  }
  if (type === "RATING") return <span className="ps-compare-rating"><Star size={14} fill="currentColor" /> {value}</span>;
  if (type === "BADGE") return <span className="ps-compare-badge">{value}</span>;
  if (type === "PRICING") return <strong className="ps-compare-pricing">{value}</strong>;
  return <span>{value}</span>;
}

export default async function ComparisonPage({ params }: { params: Promise<{ slug: string }> }) {
  const comparison = await comparisonService.publicGet((await params).slug);
  if (!comparison || comparison.items.length < 2) notFound();

  const [related, reviews] = await Promise.all([
    prisma.comparison.findMany({
      where: { id: { not: comparison.id }, status: "PUBLISHED", deletedAt: null, publishedAt: { lte: new Date() } },
      include: { items: { orderBy: { sortOrder: "asc" } } },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
    prisma.review.findMany({
      where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: new Date() } },
      include: { aiTool: true },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
  ]);

  const schema = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Comparisons", url: "/comparisons" },
    { name: comparison.title, url: `/comparisons/${comparison.slug}` },
  ]);
  const hasAffiliate = comparison.items.some((item) => Boolean(item.affiliateUrl));

  return (
    <>
      <JsonLd value={schema} />
      <main className="ps-comparison-detail">
        <section className="ps-comparison-detail-hero">
          <PublicContainer size="wide">
            <nav className="ps-review-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/comparisons">Comparisons</Link><span>/</span><span>{comparison.title}</span></nav>
            <span className="ps-eyebrow">Product comparison</span>
            <h1>{comparison.title}</h1>
            {comparison.introduction ? <p>{comparison.introduction}</p> : null}
            <div className="ps-comparison-hero-products">{comparison.items.map((item, index) => <div key={item.id}><span>{item.label || `Option ${index + 1}`}</span><strong>{item.productName}</strong>{(item.affiliateUrl || item.productUrl) ? <a href={item.affiliateUrl || item.productUrl || "#"} target="_blank" rel={item.affiliateUrl ? "nofollow sponsored noopener" : "nofollow noopener"}>Visit product <ExternalLink size={14} /></a> : null}</div>)}</div>
            {hasAffiliate ? <p className="ps-comparison-affiliate-note">Some product links are affiliate links. This is disclosed separately from the comparison data.</p> : null}
          </PublicContainer>
        </section>

        <PublicContainer size="wide" className="ps-comparison-detail-shell">
          <div className="ps-comparison-detail-main">
            <section className="ps-comparison-summary-cards">
              {comparison.items.map((item, index) => (
                <article key={item.id}>
                  <span>#{index + 1}</span>
                  <small>{item.label || "Compared option"}</small>
                  <h2>{item.productName}</h2>
                  {(item.affiliateUrl || item.productUrl) ? <a href={item.affiliateUrl || item.productUrl || "#"} target="_blank" rel={item.affiliateUrl ? "nofollow sponsored noopener" : "nofollow noopener"} className="ps-button ps-button-primary">Visit Product <ExternalLink size={14} /></a> : null}
                </article>
              ))}
            </section>

            <section className="ps-comparison-table-section">
              <div className="ps-review-section-heading"><span className="ps-eyebrow">Side by side</span><h2>Feature comparison</h2></div>
              <div className="ps-comparison-table-wrap" tabIndex={0} aria-label="Product comparison table">
                <table>
                  <thead><tr><th>Feature</th>{comparison.items.map((item) => <th key={item.id}>{item.productName}</th>)}</tr></thead>
                  <tbody>{comparison.features.map((feature) => {
                    const values = [feature.valueA, feature.valueB, feature.valueC];
                    return <tr key={feature.id}><th><strong>{feature.feature}</strong><small>{feature.valueType.toLowerCase()}</small></th>{comparison.items.map((item, index) => <td key={item.id}>{renderValue(feature.valueType, values[index] || null)}</td>)}</tr>;
                  })}</tbody>
                </table>
              </div>
            </section>

            <section className="ps-comparison-decision-guide">
              <span className="ps-eyebrow">Decision guide</span>
              <h2>How to use this comparison</h2>
              <p>Focus on the rows that match your actual requirements, then verify the latest pricing and terms on the product’s official page before purchasing.</p>
              <div className="ps-comparison-cta-grid">{comparison.items.map((item) => <article key={item.id}><h3>{item.productName}</h3><p>{item.label || "Compare the feature rows above before choosing."}</p>{(item.affiliateUrl || item.productUrl) ? <a href={item.affiliateUrl || item.productUrl || "#"} target="_blank" rel={item.affiliateUrl ? "nofollow sponsored noopener" : "nofollow noopener"}>View product <ArrowRight size={15} /></a> : null}</article>)}</div>
            </section>
          </div>

          <aside className="ps-review-detail-sidebar">
            <SidebarCard title="Compared Products"><div className="ps-comparison-sidebar-products">{comparison.items.map((item, index) => <div key={item.id}><span>#{index + 1}</span><strong>{item.productName}</strong></div>)}</div></SidebarCard>
            <SidebarCard title="Related Comparisons"><div className="ps-review-comparison-links">{related.map((item) => <Link key={item.id} href={`/comparisons/${item.slug}`}><small>{item.items.map((product) => product.productName).join(" vs ")}</small><strong>{item.title}</strong></Link>)}</div></SidebarCard>
            <SidebarCard title="Latest Reviews"><div className="ps-review-comparison-links">{reviews.map((review) => <Link key={review.id} href={`/reviews/${review.slug}`}><small>{review.aiTool?.name || "Review"}</small><strong>{review.title}</strong></Link>)}</div></SidebarCard>
          </aside>
        </PublicContainer>
      </main>

      <NewsletterBand title="Get New Reviews & Comparisons" description="Fresh product comparisons, reviews and practical buying guidance from PushStream." />
    </>
  );
}
