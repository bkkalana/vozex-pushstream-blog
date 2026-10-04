import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ExternalLink, Mail, Star, X } from "lucide-react";
import { JsonLd } from "@/components/site/json-ld";
import { ArticleJsonRenderer } from "@/components/site/article-json-renderer";
import { PublicContainer } from "@/components/site/v2/primitives/container";
import { NewsletterBand } from "@/components/site/v2/sections/newsletter-band";
import { SidebarCard } from "@/components/site/v2/primitives/sidebar-card";
import { buildMetadata } from "@/lib/seo/metadata";
import { getEntitySeo } from "@/lib/seo/entity";
import { breadcrumbSchema, faqSchema, structuredReviewSchema } from "@/lib/seo/schema";
import { prisma } from "@/lib/db/prisma";
import { reviewService } from "@/services/reviews/review.service";

const ratingLabels: Record<string, string> = {
  OVERALL: "Overall",
  EASE_OF_USE: "Ease of use",
  FEATURES: "Features",
  PERFORMANCE: "Performance",
  SUPPORT: "Support",
  VALUE_FOR_MONEY: "Value for money",
};

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function disclosureText(review: Awaited<ReturnType<typeof reviewService.publicGet>>) {
  if (!review) return "";
  if (review.disclosureText) return review.disclosureText;
  return ({
    AFFILIATE: "This review may contain affiliate links. Editorial ratings remain manually controlled.",
    SPONSORED: "This review includes a disclosed sponsorship relationship.",
    FREE_REVIEW_COPY: "A review copy or access was provided for evaluation. Editorial conclusions remain independently controlled.",
    INDEPENDENT_EDITORIAL: "This review is independent editorial content.",
  } as const)[review.disclosureType];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const review = await reviewService.publicGet((await params).slug);
  if (!review) return {};
  const meta = await getEntitySeo("REVIEW", review.id);
  const image = review.screenshots[0]?.media.variants.find((variant) => variant.kind === "article")?.path || review.screenshots[0]?.media.path;
  return buildMetadata({
    title: meta?.title || review.title,
    description: meta?.description || review.bestFor || review.verdict,
    canonicalPath: `/reviews/${review.slug}`,
    canonicalUrl: meta?.canonicalUrl,
    index: meta?.robotsIndex ?? true,
    follow: meta?.robotsFollow ?? true,
    ogTitle: meta?.ogTitle,
    ogDescription: meta?.ogDescription,
    ogImage: meta?.ogImageUrl || image,
    twitterTitle: meta?.twitterTitle,
    twitterDescription: meta?.twitterDescription,
    twitterImage: meta?.twitterImageUrl || meta?.ogImageUrl || image,
    type: "article",
    publishedTime: review.publishedAt?.toISOString(),
    modifiedTime: review.updatedAt.toISOString(),
  });
}

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const review = await reviewService.publicGet((await params).slug);
  if (!review) notFound();

  const [relatedReviews, relatedComparisons, categories, featuredPost] = await Promise.all([
    prisma.review.findMany({
      where: { id: { not: review.id }, status: "PUBLISHED", deletedAt: null, publishedAt: { lte: new Date() } },
      include: { aiTool: true, ratings: true },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
    prisma.comparison.findMany({
      where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: new Date() } },
      include: { items: { orderBy: { sortOrder: "asc" } } },
      orderBy: { publishedAt: "desc" },
      take: 4,
    }),
    prisma.aiToolCategory.findMany({
      include: { _count: { select: { tools: { where: { status: "PUBLISHED", deletedAt: null } } } } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: 8,
    }),
    prisma.post.findFirst({
      where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: new Date() }, isFeatured: true },
      include: { featuredImage: true },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  const pros = stringList(review.pros);
  const cons = stringList(review.cons);
  const faq = (Array.isArray(review.faq)
    ? review.faq.filter((item: any) => item && typeof item.question === "string" && typeof item.answer === "string")
    : []) as { question: string; answer: string }[];
  const overall = review.ratings.find((rating) => rating.dimension === "OVERALL");
  const isRoundup = review.products.length > 0;
  const heroImage = review.screenshots[0]?.media;

  const schemas = [
    breadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Reviews", url: "/reviews" },
      { name: review.title, url: `/reviews/${review.slug}` },
    ]),
    ...(faq.length ? [faqSchema(faq)] : []),
    ...(review.aiTool && overall
      ? [structuredReviewSchema({
          name: review.title,
          itemName: review.aiTool.name,
          itemUrl: review.officialUrl || review.aiTool.websiteUrl,
          rating: Number(overall.score),
          body: review.verdict,
        })]
      : []),
  ];

  return (
    <>
      {schemas.map((schema, index) => <JsonLd key={index} value={schema} />)}

      <main className="ps-review-detail">
        <section className="ps-review-detail-hero">
          <PublicContainer size="wide">
            <nav className="ps-review-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/reviews">Reviews</Link><span>/</span><span>{review.title}</span></nav>
            <div className="ps-review-detail-hero-grid">
              <div>
                <span className="ps-eyebrow">{review.aiTool?.category?.name || (isRoundup ? "Best picks & roundup" : "In-depth review")}{review.aiTool ? ` · ${review.aiTool.name}` : ""}</span>
                <h1>{review.title}</h1>
                {review.bestFor ? <p className="ps-review-lede"><strong>Best for:</strong> {review.bestFor}</p> : null}
                <div className="ps-review-hero-meta">
                  {overall ? <span className="ps-review-rating-pill"><Star size={16} fill="currentColor" /> {overall.score.toString()}/5 editor rating</span> : null}
                  {review.author ? <span>By {review.author.name}</span> : null}
                  {review.publishedAt ? <span>Published {review.publishedAt.toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" })}</span> : null}
                  <span>Updated {review.updatedAt.toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" })}</span>
                </div>
              </div>
              <aside className="ps-review-hero-score-card">
                <span>Editorial score</span>
                <strong>{overall ? `${overall.score.toString()}/5` : "—"}</strong>
                <small>{isRoundup ? `${review.products.length} ranked products` : "Manual editorial rating"}</small>
                {(review.affiliateUrl || review.officialUrl) ? <a href={review.affiliateUrl || review.officialUrl || "#"} target="_blank" rel={review.affiliateUrl ? "nofollow sponsored noopener" : "nofollow noopener"} className="ps-button ps-button-primary">Visit Product <ExternalLink size={15} /></a> : null}
              </aside>
            </div>
          </PublicContainer>
        </section>

        <PublicContainer size="wide" className="ps-review-detail-shell">
          <div className="ps-review-detail-main">
            <section className="ps-review-disclosure"><strong>Review disclosure</strong><p>{disclosureText(review)}</p></section>

            {heroImage ? (
              <figure className="ps-review-hero-media">
                <div className="relative aspect-[16/8.5] overflow-hidden rounded-2xl">
                  <Image
                    src={heroImage.variants.find((variant) => variant.kind === "article")?.path || heroImage.path}
                    alt={heroImage.altText || review.title}
                    fill
                    priority
                    sizes="(max-width: 1100px) 100vw, 760px"
                    className="object-cover"
                  />
                </div>
                {heroImage.caption ? <figcaption>{heroImage.caption}</figcaption> : null}
              </figure>
            ) : null}

            {isRoundup ? (
              <section className="ps-review-quick-compare">
                <div className="ps-review-section-heading"><span className="ps-eyebrow">Quick comparison</span><h2>Top picks at a glance</h2></div>
                <div className="ps-review-quick-table-wrap" tabIndex={0} aria-label="Quick ranked product comparison">
                  <table>
                    <thead><tr><th>Rank</th><th>Product</th><th>Rating</th><th>Best for</th><th>Pricing</th><th /></tr></thead>
                    <tbody>{review.products.map((product, index) => <tr key={product.id}><td>#{index + 1}</td><td><strong>{product.name}</strong>{product.label ? <small>{product.label}</small> : null}</td><td>{product.rating ? <span className="ps-review-table-rating"><Star size={13} fill="currentColor" /> {product.rating.toString()}</span> : "—"}</td><td>{product.bestFor || "—"}</td><td>{product.pricing || "—"}</td><td>{(product.affiliateUrl || product.productUrl) ? <a href={product.affiliateUrl || product.productUrl || "#"} target="_blank" rel={product.affiliateUrl ? "nofollow sponsored noopener" : "nofollow noopener"}>View deal</a> : null}</td></tr>)}</tbody>
                  </table>
                </div>
              </section>
            ) : null}

            <section className="ps-review-editorial-body"><ArticleJsonRenderer doc={review.content} /></section>

            {isRoundup ? (
              <section className="ps-review-ranked-products">
                <div className="ps-review-section-heading"><span className="ps-eyebrow">Detailed picks</span><h2>Ranked products & providers</h2></div>
                <div className="ps-review-ranked-list">
                  {review.products.map((product, index) => {
                    const productPros = stringList(product.pros);
                    const productCons = stringList(product.cons);
                    return <article key={product.id} className="ps-review-ranked-card">
                      <div className="ps-review-ranked-head">
                        <span className="ps-review-rank-number">#{index + 1}</span>
                        <div><small>{product.label || "Recommended"}</small><h3>{product.name}</h3></div>
                        {product.rating ? <span className="ps-review-rating-pill"><Star size={15} fill="currentColor" /> {product.rating.toString()}/5</span> : null}
                      </div>
                      {product.media ? <div className="ps-review-ranked-media relative"><Image src={product.media.path} alt={product.media.altText || product.name} fill sizes="(max-width: 760px) 100vw, 760px" className="object-cover" /></div> : null}
                      {product.description ? <p className="ps-review-ranked-description">{product.description}</p> : null}
                      <div className="ps-review-ranked-facts">{product.bestFor ? <div><span>Best for</span><strong>{product.bestFor}</strong></div> : null}{product.pricing ? <div><span>Pricing</span><strong>{product.pricing}</strong></div> : null}</div>
                      {(productPros.length || productCons.length) ? <div className="ps-review-procon-grid"><ReviewPoints title="Pros" type="pros" items={productPros} /><ReviewPoints title="Cons" type="cons" items={productCons} /></div> : null}
                      {(product.affiliateUrl || product.productUrl) ? <a href={product.affiliateUrl || product.productUrl || "#"} target="_blank" rel={product.affiliateUrl ? "nofollow sponsored noopener" : "nofollow noopener"} className="ps-button ps-button-primary">View Deal <ExternalLink size={15} /></a> : null}
                    </article>;
                  })}
                </div>
              </section>
            ) : null}

            {!isRoundup && (pros.length || cons.length) ? <section className="ps-review-procon-grid ps-review-section"><ReviewPoints title="Pros" type="pros" items={pros} /><ReviewPoints title="Cons" type="cons" items={cons} /></section> : null}

            {review.pricing ? <section className="ps-review-section"><div className="ps-review-section-heading"><span className="ps-eyebrow">Cost</span><h2>Pricing</h2></div><p className="whitespace-pre-line">{review.pricing}</p></section> : null}

            {review.screenshots.length > 1 ? <section className="ps-review-section"><div className="ps-review-section-heading"><span className="ps-eyebrow">Product visuals</span><h2>Screenshots</h2></div><div className="ps-review-screenshot-grid">{review.screenshots.slice(1).map((screenshot) => { const src = screenshot.media.variants.find((variant) => variant.kind === "article")?.path || screenshot.media.path; return <figure key={screenshot.id}><div className="relative aspect-video overflow-hidden rounded-xl"><Image src={src} alt={screenshot.media.altText || review.title} fill sizes="(max-width: 760px) 100vw, 520px" className="object-cover" /></div>{screenshot.media.caption ? <figcaption>{screenshot.media.caption}</figcaption> : null}</figure>; })}</div></section> : null}

            {review.alternatives.length ? <section className="ps-review-section"><div className="ps-review-section-heading"><span className="ps-eyebrow">Other options</span><h2>Alternatives</h2></div><div className="ps-review-alternatives">{review.alternatives.map((alternative) => <article key={alternative.id}><strong>{alternative.aiTool?.name || alternative.name}</strong>{alternative.note ? <p>{alternative.note}</p> : null}{(alternative.affiliateUrl || alternative.url) ? <a href={alternative.affiliateUrl || alternative.url || "#"} target="_blank" rel={alternative.affiliateUrl ? "nofollow sponsored noopener" : "nofollow noopener"}>View alternative <ArrowRight size={14} /></a> : null}</article>)}</div></section> : null}

            {review.verdict ? <section className="ps-review-verdict"><span className="ps-eyebrow">Final take</span><h2>Verdict</h2><p>{review.verdict}</p>{overall ? <div className="ps-review-verdict-score"><Star size={18} fill="currentColor" /> {overall.score.toString()}/5</div> : null}</section> : null}

            {faq.length ? <section className="ps-review-section"><div className="ps-review-section-heading"><span className="ps-eyebrow">Questions</span><h2>Frequently Asked Questions</h2></div><div className="ps-review-faq">{faq.map((item, index) => <details key={index}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></section> : null}
          </div>

          <aside className="ps-review-detail-sidebar">
            <SidebarCard title="Rating Breakdown"><div className="ps-review-rating-breakdown">{review.ratings.map((rating) => <div key={rating.id}><span>{ratingLabels[rating.dimension] || rating.dimension}</span><strong>{rating.score.toString()}/5</strong></div>)}</div></SidebarCard>
            <SidebarCard title="Related Reviews"><div className="ps-review-comparison-links">{relatedReviews.map((item) => <Link key={item.id} href={`/reviews/${item.slug}`}><small>{item.aiTool?.name || "Review"}</small><strong>{item.title}</strong></Link>)}</div></SidebarCard>
            <SidebarCard title="Related Comparisons"><div className="ps-review-comparison-links">{relatedComparisons.map((item) => <Link key={item.id} href={`/comparisons/${item.slug}`}><small>{item.items.map((product) => product.productName).join(" vs ")}</small><strong>{item.title}</strong></Link>)}</div></SidebarCard>
            <SidebarCard title="Popular Categories"><div className="ps-sidebar-category-list">{categories.map((category) => <Link key={category.id} href={`/ai-tools?category=${encodeURIComponent(category.slug)}`}><span>{category.name}</span><strong>{category._count.tools}</strong></Link>)}</div></SidebarCard>
            <div className="ps-sidebar-card ps-sidebar-newsletter"><span className="ps-sidebar-newsletter-icon"><Mail size={18} /></span><h2>Get review updates</h2><p>New reviews and comparisons delivered free.</p><Link href="/#newsletter" className="ps-button ps-button-primary w-full justify-center">Subscribe Free</Link></div>
            {featuredPost ? <SidebarCard title="Featured Guide"><Link href={`/article/${featuredPost.slug}`} className="ps-topic-sidebar-featured">{featuredPost.featuredImage ? <span className="ps-topic-sidebar-featured-media"><Image src={featuredPost.featuredImage.path} alt={featuredPost.featuredImage.altText || featuredPost.title} fill sizes="280px" className="object-cover" /></span> : null}<strong>{featuredPost.title}</strong><span>Read guide <ArrowRight size={14} /></span></Link></SidebarCard> : null}
            <div className="ps-sidebar-card ps-review-method-card"><span className="ps-eyebrow">Disclosure</span><p>{disclosureText(review)}</p></div>
          </aside>
        </PublicContainer>
      </main>

      <NewsletterBand title="Get New Reviews & Comparisons" description="Fresh product reviews, comparisons and practical buying guidance from PushStream." />
    </>
  );
}

function ReviewPoints({ title, type, items }: { title: string; type: "pros" | "cons"; items: string[] }) {
  return <div className={`ps-review-points ps-review-points-${type}`}><h3>{title}</h3><ul>{items.map((item, index) => <li key={index}>{type === "pros" ? <Check size={16} /> : <X size={16} />}<span>{item}</span></li>)}</ul></div>;
}
