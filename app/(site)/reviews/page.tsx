export const revalidate = 300;

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search, Star } from "lucide-react";
import { PublicContainer } from "@/components/site/v2/primitives/container";
import { NewsletterBand } from "@/components/site/v2/sections/newsletter-band";
import { PaginationV2 } from "@/components/site/v2/primitives/pagination";
import { SidebarCard } from "@/components/site/v2/primitives/sidebar-card";
import { getReviewsLandingData } from "@/services/site/reviews-comparisons-v2.service";
import { ResponsiveHeroImage } from "@/components/site/v2/primitives/responsive-hero-image";
import { resolveHeroMedia } from "@/services/site/hero-media.service";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
function pageNumber(value: string | string[] | undefined) {
  const number = Number(one(value) ?? 1);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 1;
}
function overall(review: { ratings: Array<{ dimension: string; score: unknown }> }) {
  return review.ratings.find((item) => item.dimension === "OVERALL")?.score?.toString?.() ?? null;
}
function sectionMap(sections: Awaited<ReturnType<typeof getReviewsLandingData>>["sections"]) {
  return new Map<string, any>(sections.map((section: any) => [section.sectionKey, section]));
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = one(sp.q)?.trim() || "";
  const page = pageNumber(sp.page);
  const data = await getReviewsLandingData({ q, page });
  const sections = sectionMap(data.sections);
  const hero = sections.get("hero");
  const heroMedia = await resolveHeroMedia(hero);
  const showHero = Boolean(hero) || data.sections.length === 0;
  const reviewsSection = sections.get("reviews");
  const newsletter = sections.get("newsletter");
  const baseHref = q ? `/reviews?q=${encodeURIComponent(q)}` : "/reviews";
  const featured = page === 1 && !q ? data.reviews[0] : null;
  const grid = featured ? data.reviews.slice(1) : data.reviews;

  return (
    <main className="ps-review-hub">
      {showHero ? <section className="ps-review-hub-hero">
        <PublicContainer className="ps-review-hub-hero-grid">
          <div>
            <span className="ps-eyebrow">{typeof hero?.config?.eyebrow === "string" && hero.config.eyebrow.trim() ? hero.config.eyebrow : "Independent editorial reviews"}</span>
            <h1>{hero?.heading || "Reviews & Comparisons"}</h1>
            <p>{hero?.description || "Detailed technology reviews, practical ratings, product screenshots, pros and cons, alternatives and clear editorial verdicts."}</p>
            <div className="ps-hero-actions">
              <Link href={typeof hero?.config?.primaryCtaUrl === "string" && hero.config.primaryCtaUrl ? hero.config.primaryCtaUrl : "#reviews"} className="ps-button ps-button-primary">{typeof hero?.config?.primaryCtaLabel === "string" && hero.config.primaryCtaLabel ? hero.config.primaryCtaLabel : "Browse Reviews"} <ArrowRight size={16} /></Link>
              <Link href={typeof hero?.config?.secondaryCtaUrl === "string" && hero.config.secondaryCtaUrl ? hero.config.secondaryCtaUrl : "/comparisons"} className="ps-button ps-button-secondary">{typeof hero?.config?.secondaryCtaLabel === "string" && hero.config.secondaryCtaLabel ? hero.config.secondaryCtaLabel : "View Comparisons"}</Link>
            </div>
          </div>
          {heroMedia.desktop || heroMedia.mobile ? <div className="ps-review-hub-hero-media"><ResponsiveHeroImage desktop={heroMedia.desktop} mobile={heroMedia.mobile} alt={heroMedia.alt || "PushStream reviews"} desktopPosition={heroMedia.desktopPosition} mobilePosition={heroMedia.mobilePosition} overlay={heroMedia.overlay} sizes="(max-width: 860px) 100vw, 40vw" /></div> : <div className="ps-review-hub-hero-panel">
            <span className="ps-review-hub-kicker">How we review</span>
            <strong>Structured ratings. Clear disclosures. Practical verdicts.</strong>
            <ul><li>Manual editorial ratings</li><li>Pros, cons and pricing context</li><li>Affiliate/sponsorship disclosure</li><li>Product alternatives and comparisons</li></ul>
          </div>}
        </PublicContainer>
      </section> : null}

      <section id="reviews" className="ps-section ps-review-hub-content">
        <PublicContainer>
          <div className="ps-review-hub-toolbar">
            <div>
              <span className="ps-eyebrow">Reviews</span>
              <h2>{reviewsSection?.heading || "Featured and latest reviews"}</h2>
            </div>
            <form action="/reviews" method="get" className="ps-latest-search">
              <Search size={18} aria-hidden="true" />
              <input name="q" defaultValue={q} placeholder="Search reviews..." aria-label="Search reviews" />
              <button type="submit" aria-label="Search reviews">Search</button>
            </form>
          </div>

          {featured ? (
            <article className="ps-review-featured">
              <Link href={`/reviews/${featured.slug}`} className="ps-review-featured-media">
                {featured.screenshots[0]?.media ? (
                  <Image
                    src={featured.screenshots[0].media.variants.find((variant) => variant.kind === "article")?.path || featured.screenshots[0].media.path}
                    alt={featured.screenshots[0].media.altText || featured.title}
                    fill
                    priority
                    sizes="(max-width: 900px) 100vw, 56vw"
                    className="object-cover"
                  />
                ) : featured.aiTool?.logo ? (
                  <Image src={featured.aiTool.logo.path} alt={featured.aiTool.logo.altText || featured.aiTool.name} fill className="object-contain p-14" sizes="(max-width: 900px) 100vw, 56vw" />
                ) : <span className="ps-media-placeholder" />}
              </Link>
              <div className="ps-review-featured-copy">
                <span className="ps-content-label">Featured review</span>
                <h2><Link href={`/reviews/${featured.slug}`}>{featured.title}</Link></h2>
                {featured.bestFor ? <p><strong>Best for:</strong> {featured.bestFor}</p> : null}
                <div className="ps-review-featured-meta">
                  {overall(featured) ? <span><Star size={15} fill="currentColor" /> {overall(featured)}/5 editor rating</span> : null}
                  {featured.products.length ? <span>{featured.products.length} ranked products</span> : null}
                </div>
                <Link href={`/reviews/${featured.slug}`} className="ps-inline-link">Read full review <ArrowRight size={16} /></Link>
              </div>
            </article>
          ) : null}

          <div className="ps-review-hub-layout">
            <div>
              {grid.length ? (
                <div className="ps-review-grid-v2">
                  {grid.map((review) => (
                    <article key={review.id} className="ps-review-list-card">
                      <Link href={`/reviews/${review.slug}`} className="ps-review-list-media">
                        {review.screenshots[0]?.media ? (
                          <Image
                            src={review.screenshots[0].media.variants.find((variant) => variant.kind === "article")?.path || review.screenshots[0].media.path}
                            alt={review.screenshots[0].media.altText || review.title}
                            fill
                            sizes="(max-width: 760px) 100vw, 33vw"
                            className="object-cover"
                          />
                        ) : review.aiTool?.logo ? (
                          <Image src={review.aiTool.logo.path} alt={review.aiTool.logo.altText || review.aiTool.name} fill className="object-contain p-8" sizes="33vw" />
                        ) : <span className="ps-media-placeholder" />}
                      </Link>
                      <div className="ps-review-list-body">
                        <span className="ps-content-label">{review.aiTool?.category?.name || "Technology Review"}</span>
                        <h3><Link href={`/reviews/${review.slug}`}>{review.title}</Link></h3>
                        {review.bestFor ? <p>{review.bestFor}</p> : null}
                        <div className="ps-review-list-meta">
                          {overall(review) ? <span><Star size={14} fill="currentColor" /> {overall(review)}/5</span> : null}
                          {review.products.length ? <span>{review.products.length} products ranked</span> : null}
                        </div>
                        <Link href={`/reviews/${review.slug}`} className="ps-inline-link">Read review <ArrowRight size={15} /></Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : <div className="ps-empty-state">No published reviews matched your search.</div>}
              <div className="mt-8"><PaginationV2 page={data.page} totalPages={data.pages} baseHref={baseHref} /></div>
            </div>

            <aside className="ps-review-hub-sidebar">
              <SidebarCard title="Latest Comparisons">
                <div className="ps-review-comparison-links">
                  {data.comparisons.map((comparison) => (
                    <Link key={comparison.id} href={`/comparisons/${comparison.slug}`}>
                      <small>{comparison.items.map((item) => item.productName).join(" vs ")}</small>
                      <strong>{comparison.title}</strong>
                    </Link>
                  ))}
                </div>
              </SidebarCard>
              <SidebarCard title="Tool Categories">
                <div className="ps-sidebar-category-list">
                  {data.categories.map((category) => (
                    <Link key={category.id} href={`/ai-tools?category=${encodeURIComponent(category.slug)}`}><span>{category.name}</span><strong>{category._count.tools}</strong></Link>
                  ))}
                </div>
              </SidebarCard>
              <div className="ps-sidebar-card ps-review-method-card">
                <span className="ps-eyebrow">Editorial policy</span>
                <h2>Ratings are entered manually.</h2>
                <p>Affiliate relationships and sponsorships are disclosed separately from editorial ratings.</p>
              </div>
            </aside>
          </div>
        </PublicContainer>
      </section>

      <NewsletterBand
        title={newsletter?.heading || "Get Better Product Decisions in Your Inbox"}
        description={newsletter?.description || "New reviews, comparisons and practical buying guidance from PushStream."}
      />
    </main>
  );
}
