import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  Filter,
  ImageIcon,
  Mic2,
  Palette,
  Search,
  Sparkles,
  Star,
  Video,
  WandSparkles,
  Workflow,
} from "lucide-react";
import { ToolCardV2 } from "@/components/site/v2/cards/tool-card";
import { ReviewCardV2 } from "@/components/site/v2/cards/review-card";
import { PublicContainer } from "@/components/site/v2/primitives/container";
import { PaginationV2 } from "@/components/site/v2/primitives/pagination";
import { NewsletterBand } from "@/components/site/v2/sections/newsletter-band";
import { StatsRow } from "@/components/site/v2/sections/stats-row";
import { getAiToolsV2Page } from "@/services/site/ai-tools-v2.service";
import { ResponsiveHeroImage } from "@/components/site/v2/primitives/responsive-hero-image";
import { resolveHeroMedia } from "@/services/site/hero-media.service";

export const revalidate = 300;

type RawParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalize(sp: RawParams): Record<string, string | undefined> {
  return Object.fromEntries(Object.entries(sp).map(([key, value]) => [key, one(value)]));
}

function sectionString(section: { config: Record<string, unknown> } | undefined, key: string, fallback: string) {
  const value = section?.config[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function queryHref(values: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const qs = params.toString();
  return qs ? `/ai-tools?${qs}` : "/ai-tools";
}

function categoryIcon(name: string) {
  const key = name.toLowerCase();
  if (key.includes("image") || key.includes("photo")) return ImageIcon;
  if (key.includes("video")) return Video;
  if (key.includes("audio") || key.includes("voice")) return Mic2;
  if (key.includes("design") || key.includes("creative")) return Palette;
  if (key.includes("product") || key.includes("automation")) return Workflow;
  if (key.includes("writing") || key.includes("content")) return WandSparkles;
  return Bot;
}

function pricingLabel(tool: { pricingModel: string; startingPrice: { toString(): string } | null; currency: string | null }) {
  if (tool.pricingModel === "FREE") return "Free";
  if (tool.pricingModel === "FREEMIUM") return tool.startingPrice ? `Freemium · from ${tool.currency ?? "USD"} ${tool.startingPrice.toString()}` : "Freemium";
  if (tool.pricingModel === "FREE_TRIAL") return tool.startingPrice ? `Free trial · from ${tool.currency ?? "USD"} ${tool.startingPrice.toString()}` : "Free trial";
  if (tool.pricingModel === "ENTERPRISE") return "Enterprise";
  return tool.startingPrice ? `From ${tool.currency ?? "USD"} ${tool.startingPrice.toString()}` : "Paid";
}

export default async function Page({ searchParams }: { searchParams: Promise<RawParams> }) {
  const sp = await searchParams;
  const raw = normalize(sp);
  const data = await getAiToolsV2Page(raw);

  const hero = data.section("hero");
  const heroMedia = await resolveHeroMedia(hero);
  const stats = data.section("stats");
  const categoriesSection = data.section("categories");
  const topSection = data.section("top-tools");
  const directorySection = data.section("directory");
  const reviewsSection = data.section("reviews");
  const newsletter = data.section("newsletter");

  const q = raw.q ?? "";
  const category = raw.category ?? "";
  const pricing = raw.pricing ?? "";
  const sort = raw.sort ?? "top-rated";
  const freeTrial = raw.freeTrial ?? "";

  const baseHref = queryHref({ q, category, pricing, sort, freeTrial });

  const heroChips = hero?.items.length
    ? hero.items.filter((item) => item.title).slice(0, 5).map((item) => item.title!)
    : data.categories.slice(0, 5).map((item) => item.name);

  const configuredStats = stats?.items
    .filter((item) => item.title || item.subtitle)
    .slice(0, 4)
    .map((item) => ({ value: item.title || "—", label: item.subtitle || item.body || "Stat" })) ?? [];

  const statItems = configuredStats.length ? configuredStats : [
    { value: `${data.stats.tools}+`, label: "Published Tools" },
    { value: `${data.stats.categories}+`, label: "AI Categories" },
    { value: `${data.stats.free}+`, label: "Free / Trial Options" },
    { value: `${data.stats.verified}+`, label: "Verified Listings" },
  ];

  return (
    <main className="ps-ai-page">
      {hero ? (
        <section className="ps-ai-hero">
          <PublicContainer className="ps-ai-hero-grid">
            <div>
              <span className="ps-eyebrow">{sectionString(hero, "eyebrow", "AI TOOLS DIRECTORY")}</span>
              <h1>
                {hero.heading || "Best AI Tools for Content Creators"}
                <span>{sectionString(hero, "accentText", "Create Faster. Work Smarter.")}</span>
              </h1>
              <p>
                {hero.description || "Discover practical AI tools for writing, images, video, audio, design, automation and productivity. Compare pricing, ratings, features and verified editorial notes before you choose."}
              </p>
              <div className="ps-hero-actions">
                <Link href={sectionString(hero, "primaryCtaUrl", "#directory")} className="ps-button ps-button-primary">
                  {sectionString(hero, "primaryCtaLabel", "Explore AI Tools")} <ArrowRight size={16} />
                </Link>
                <Link href={sectionString(hero, "secondaryCtaUrl", "/reviews")} className="ps-button ps-button-secondary">
                  {sectionString(hero, "secondaryCtaLabel", "How We Review")}
                </Link>
              </div>
            </div>

            <div className="ps-ai-hero-visual">
              <div className="ps-ai-hero-image">
                <ResponsiveHeroImage desktop={heroMedia.desktop} mobile={heroMedia.mobile} alt={heroMedia.alt || "AI tools illustration"} desktopPosition={heroMedia.desktopPosition} mobilePosition={heroMedia.mobilePosition} overlay={heroMedia.overlay} sizes="(max-width: 900px) 100vw, 46vw" fallback={<div className="ps-ai-hero-placeholder"><Sparkles size={38} /><strong>AI Tools Directory</strong><span>Writing · Image · Video · Audio · Productivity</span></div>} />
              </div>
              {heroChips.map((chip, index) => (
                <span key={`${chip}-${index}`} className={`ps-ai-chip ps-ai-chip-${index + 1}`}>
                  {chip}
                </span>
              ))}
            </div>
          </PublicContainer>
        </section>
      ) : null}

      {stats ? (
        <section className="ps-ai-stats">
          <PublicContainer><StatsRow items={statItems} /></PublicContainer>
        </section>
      ) : null}

      {categoriesSection ? (
        <section className="ps-section ps-ai-categories">
          <PublicContainer>
            <div className="ps-section-heading">
              <div>
                <span className="ps-eyebrow">Browse by use</span>
                <h2 className="ps-section-title">{categoriesSection.heading || "Popular AI Tool Categories"}</h2>
                <p>{categoriesSection.description || "Jump straight into the kind of AI tool you need."}</p>
              </div>
              <Link href="#directory" className="ps-inline-link">View all tools <ArrowRight size={15} /></Link>
            </div>
            <div className="ps-ai-category-grid">
              {data.categories.slice(0, categoriesSection.itemCount ?? 6).map((item) => {
                const Icon = categoryIcon(item.name);
                return (
                  <Link key={item.id} href={queryHref({ category: item.slug })} className="ps-ai-category-card">
                    <span className="ps-ai-category-icon"><Icon size={22} /></span>
                    <div>
                      <h3>{item.name}</h3>
                      <p>{item.description || "Explore curated AI tools in this category."}</p>
                      <small>{item._count.tools} tools</small>
                    </div>
                    <ArrowRight size={17} />
                  </Link>
                );
              })}
            </div>
          </PublicContainer>
        </section>
      ) : null}

      {topSection && data.topTools.length ? (
        <section className="ps-section ps-ai-editors">
          <PublicContainer>
            <div className="ps-section-heading">
              <div>
                <span className="ps-eyebrow">Hand-picked</span>
                <h2 className="ps-section-title">{topSection.heading || "Editor’s Choice"}</h2>
                <p>{topSection.description || "Standout tools selected from the published directory."}</p>
              </div>
            </div>
            <div className="ps-ai-editor-grid">
              {data.topTools.slice(0, topSection.itemCount ?? 4).map((tool, index) => (
                <article key={tool.id} className="ps-ai-editor-card">
                  <span className="ps-ai-rank">#{index + 1}</span>
                  <div className="ps-ai-editor-head">
                    <div className="ps-ai-editor-logo">
                      {tool.logo ? (
                        <Image src={tool.logo.path} alt={tool.logo.altText ?? tool.name} fill sizes="64px" className="object-contain" />
                      ) : <span>{tool.name.slice(0, 1)}</span>}
                    </div>
                    <div>
                      <span>{tool.category.name}</span>
                      <h3>{tool.name}</h3>
                    </div>
                  </div>
                  <p>{tool.shortDescription}</p>
                  <div className="ps-ai-editor-meta">
                    {tool.rating ? <span><Star size={14} fill="currentColor" /> {tool.rating.toString()}</span> : <span>Not rated</span>}
                    <span>{pricingLabel(tool)}</span>
                    {tool.reviewCount > 0 ? <span>{tool.reviewCount.toLocaleString()} reviews</span> : null}
                  </div>
                  <Link href={`/ai-tools/${tool.slug}`} className="ps-button ps-button-primary w-full justify-center">View Tool</Link>
                </article>
              ))}
            </div>
          </PublicContainer>
        </section>
      ) : null}

      {directorySection ? (
        <section id="directory" className="ps-section ps-ai-directory-section">
          <PublicContainer>
            <div className="ps-section-heading">
              <div>
                <span className="ps-eyebrow">Search and compare</span>
                <h2 className="ps-section-title">{directorySection.heading || "Compare AI Tools"}</h2>
                <p>{data.list.total} published tools match the current filters.</p>
              </div>
            </div>

            <div className="ps-ai-directory-layout">
              <aside className="ps-ai-filter-panel">
                <form action="/ai-tools" method="get" className="ps-ai-filter-form">
                  <div className="ps-ai-filter-title"><Filter size={17} /><strong>Filter Tools</strong></div>
                  <label>
                    <span>Search</span>
                    <div className="ps-ai-input-wrap"><Search size={16} /><input name="q" defaultValue={q} placeholder="Search AI tools..." /></div>
                  </label>
                  <label>
                    <span>Category</span>
                    <select name="category" defaultValue={category}>
                      <option value="">All categories</option>
                      {data.categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
                    </select>
                  </label>
                  <fieldset>
                    <legend>Pricing</legend>
                    {[['','Any pricing'],['FREE','Free'],['FREEMIUM','Freemium'],['PAID','Paid'],['FREE_TRIAL','Free trial'],['ENTERPRISE','Enterprise']].map(([value,label]) => (
                      <label key={value || 'all'} className="ps-ai-radio"><input type="radio" name="pricing" value={value} defaultChecked={pricing === value} /> <span>{label}</span></label>
                    ))}
                  </fieldset>
                  <label className="ps-ai-check"><input type="checkbox" name="freeTrial" value="yes" defaultChecked={freeTrial === "yes"} /><span>Free trial available</span></label>
                  <label>
                    <span>Sort by</span>
                    <select name="sort" defaultValue={sort}>
                      <option value="top-rated">Top Rated</option>
                      <option value="most-popular">Most Popular</option>
                      <option value="newest">Newest</option>
                      <option value="recently-updated">Recently Updated</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </label>
                  <button type="submit" aria-label="Apply AI tool filters" className="ps-button ps-button-primary w-full justify-center">Apply Filters</button>
                  <Link href="/ai-tools" className="ps-ai-clear">Clear all filters</Link>
                </form>
              </aside>

              <div className="ps-ai-directory-results">
                {data.list.items.length ? (
                  <>
                    <div className="ps-ai-table-wrap">
                      <table className="ps-ai-table">
                        <thead>
                          <tr>
                            <th>Tool</th>
                            <th>Rating</th>
                            <th>Key Features</th>
                            <th>Best For</th>
                            <th>Pricing</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.list.items.map((tool) => (
                            <tr key={tool.id}>
                              <td>
                                <Link href={`/ai-tools/${tool.slug}`} className="ps-ai-table-tool">
                                  <span className="ps-ai-table-logo">
                                    {tool.logo ? <Image src={tool.logo.path} alt={tool.logo.altText ?? tool.name} fill sizes="44px" className="object-contain" /> : <span>{tool.name.slice(0,1)}</span>}
                                  </span>
                                  <span><strong>{tool.name}</strong><small>{tool.category.name}</small></span>
                                </Link>
                              </td>
                              <td>{tool.rating ? <span className="ps-ai-rating"><Star size={13} fill="currentColor" /> {tool.rating.toString()}</span> : "—"}</td>
                              <td>{tool.features.slice(0,3).map((feature) => feature.name).join(", ") || "—"}</td>
                              <td>{tool.useCases.slice(0,2).map((useCase) => useCase.name).join(", ") || "—"}</td>
                              <td>{pricingLabel(tool)}</td>
                              <td><Link href={`/ai-tools/${tool.slug}`} className="ps-ai-table-action">View details</Link></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="ps-ai-mobile-list">
                      {data.list.items.map((tool) => <ToolCardV2 key={tool.id} tool={tool} />)}
                    </div>

                    <div className="ps-ai-pagination">
                      <PaginationV2 page={data.list.page} totalPages={data.list.pages} baseHref={baseHref} />
                    </div>
                  </>
                ) : (
                  <div className="ps-empty-state">No published AI tools match these filters.</div>
                )}
              </div>
            </div>
          </PublicContainer>
        </section>
      ) : null}

      {reviewsSection && data.latestReviews.length ? (
        <section className="ps-section ps-ai-reviews">
          <PublicContainer>
            <div className="ps-section-heading">
              <div>
                <span className="ps-eyebrow">Hands-on editorial coverage</span>
                <h2 className="ps-section-title">{reviewsSection.heading || "Latest AI Tool Reviews"}</h2>
                <p>{reviewsSection.description || "Read recent reviews before choosing a tool for your workflow."}</p>
              </div>
              <Link href="/reviews" className="ps-inline-link">View all reviews <ArrowRight size={15} /></Link>
            </div>
            <div className="ps-ai-review-grid">
              {data.latestReviews.slice(0, reviewsSection.itemCount ?? 4).map((review) => <ReviewCardV2 key={review.id} review={review} />)}
            </div>
          </PublicContainer>
        </section>
      ) : null}

      {newsletter ? (
        <NewsletterBand
          title={newsletter.heading || "Get Better AI Tool Picks in Your Inbox"}
          description={newsletter.description || "New AI tools, practical comparisons and editorial reviews delivered without the hype."}
        />
      ) : null}
    </main>
  );
}
