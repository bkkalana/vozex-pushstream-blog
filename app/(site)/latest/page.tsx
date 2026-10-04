export const revalidate = 300;

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, FolderOpen, Search, Sparkles, Users } from "lucide-react";
import { ArticleCardV2 } from "@/components/site/v2/cards/article-card";
import { CompactArticleCard } from "@/components/site/v2/cards/compact-article-card";
import { PublicContainer } from "@/components/site/v2/primitives/container";
import { FilterPills } from "@/components/site/v2/primitives/filter-pills";
import { PaginationV2 } from "@/components/site/v2/primitives/pagination";
import { SidebarCard } from "@/components/site/v2/primitives/sidebar-card";
import { NewsletterBand } from "@/components/site/v2/sections/newsletter-band";
import { StatsRow } from "@/components/site/v2/sections/stats-row";
import { getLatestPageV2Data, type LatestSection } from "@/services/site/latest-v2.service";

function one(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }
function intPage(value: string | string[] | undefined) { const parsed = Number(one(value) ?? 1); return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1; }
function configString(section: LatestSection | undefined, key: string, fallback: string) { const value = section?.config[key]; return typeof value === "string" && value.trim() ? value.trim() : fallback; }

function queryHref(path: string, values: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => { if (value) params.set(key, value); });
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

function FeaturedStory({ post }: { post: NonNullable<Awaited<ReturnType<typeof getLatestPageV2Data>>["featured"]> }) {
  return <article className="ps-latest-featured ps-card">
    <Link href={`/article/${post.slug}`} className="ps-latest-featured-media">
      {post.featuredImage ? <Image src={post.featuredImage.path} alt={post.featuredImage.altText ?? post.title} fill sizes="(max-width: 900px) 100vw, 55vw" className="object-cover" /> : <span className="ps-media-placeholder" />}
    </Link>
    <div className="ps-latest-featured-copy">
      {post.category ? <span className="ps-content-label">{post.category.name}</span> : null}
      <h2><Link href={`/article/${post.slug}`}>{post.title}</Link></h2>
      {post.excerpt ? <p>{post.excerpt}</p> : null}
      <div className="ps-latest-featured-meta">
        <span>{post.author?.name ?? "PushStream"}</span>
        {post.publishedAt ? <span>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(post.publishedAt)}</span> : null}
        {post.readingTime ? <span>{post.readingTime} min read</span> : null}
      </div>
      <Link className="ps-inline-link" href={`/article/${post.slug}`}>Read Featured Article <ArrowRight size={16} /></Link>
    </div>
  </article>;
}

export default async function LatestPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const page = intPage(sp.page);
  const query = one(sp.q)?.trim() || undefined;
  const category = one(sp.category)?.trim() || undefined;
  const sortRaw = one(sp.sort);
  const sort = sortRaw === "popular" || sortRaw === "oldest" ? sortRaw : "latest";
  const data = await getLatestPageV2Data({ page, query, category, sort });
  const hero = data.section("hero");
  const stats = data.section("stats");
  const featured = data.section("featured");
  const articles = data.section("articles");
  const newsletter = data.section("newsletter");
  const showSidebarTrending = articles?.config.showSidebarTrending !== false;
  const showSidebarCategories = articles?.config.showSidebarCategories !== false;
  const showSidebarNewsletter = articles?.config.showSidebarNewsletter !== false;
  const showSidebarTools = articles?.config.showSidebarTools !== false;
  const hasSidebar = showSidebarTrending || showSidebarCategories || showSidebarNewsletter || (showSidebarTools && data.tools.length > 0);
  const baseHref = queryHref("/latest", { q: query, category, sort: sort === "latest" ? undefined : sort });

  const chips = [
    { label: "AI Tools", icon: <Sparkles size={18} /> },
    { label: "WordPress", icon: <BookOpen size={18} /> },
    { label: "Development", icon: <FolderOpen size={18} /> },
  ];

  return <main className="ps-latest-page">
    {hero ? <section className="ps-latest-hero" style={{ order: hero.sortOrder }}>
      <PublicContainer className="ps-latest-hero-grid">
        <div>
          <span className="ps-eyebrow">{configString(hero, "eyebrow", "LEARN. BUILD. GROW.")}</span>
          <h1>{hero.heading || "Latest Articles"} <span>{configString(hero, "accentText", "Learn. Build. Grow.")}</span></h1>
          <p>{hero.description || "Explore practical tutorials, honest reviews and useful guides designed to help you solve problems, learn faster and build better online."}</p>
          <div className="ps-hero-actions">
            <Link href="#articles" className="ps-button ps-button-primary">Browse Articles <ArrowRight size={16} /></Link>
            <Link href="/ai-tools" className="ps-button ps-button-secondary">Explore AI Tools</Link>
          </div>
        </div>
        <div className="ps-latest-hero-visual">
          <div className="ps-latest-hero-image">{data.heroImage ? <Image src={data.heroImage.path} alt={data.heroImage.altText ?? "PushStream latest articles workspace"} fill priority sizes="(max-width: 900px) 100vw, 46vw" className="object-cover" /> : <span className="ps-media-placeholder" />}</div>
          {chips.map((chip, index) => <div key={chip.label} className={`ps-latest-chip ps-latest-chip-${index + 1}`}>{chip.icon}<span>{chip.label}</span></div>)}
        </div>
      </PublicContainer>
    </section> : null}

    {stats ? <section className="ps-latest-stats"><PublicContainer><StatsRow items={[
      { value: `${data.stats.articles}+`, label: "Published Articles" },
      { value: `${data.stats.categories}+`, label: "Topics Covered" },
      { value: `${data.stats.authors}+`, label: "Contributors" },
      { value: "Weekly", label: "Fresh Content" },
    ]} /></PublicContainer></section> : null}

    <section id="articles" className="ps-section ps-latest-content">
      <PublicContainer>
        <div className="ps-latest-toolbar">
          <div><span className="ps-eyebrow">Explore the library</span><h2>{articles?.heading || "All Articles"}</h2></div>
          <form action="/latest" method="get" className="ps-latest-search">
            {category ? <input type="hidden" name="category" value={category} /> : null}
            {sort !== "latest" ? <input type="hidden" name="sort" value={sort} /> : null}
            <Search size={18} aria-hidden="true" />
            <input name="q" defaultValue={query ?? ""} placeholder="Search articles..." aria-label="Search articles" />
            <button type="submit" aria-label="Search latest articles">Search</button>
          </form>
        </div>

        <div className="ps-latest-filter-row">
          <FilterPills items={[
            { label: "All", href: queryHref("/latest", { q: query, sort: sort === "latest" ? undefined : sort }), active: !category },
            ...data.categories.slice(0, 8).map((item) => ({ label: item.name, href: queryHref("/latest", { q: query, category: item.slug, sort: sort === "latest" ? undefined : sort }), active: category === item.slug })),
          ]} ariaLabel="Article categories" />
          <form action="/latest" method="get" className="ps-latest-sort">
            {query ? <input type="hidden" name="q" value={query} /> : null}
            {category ? <input type="hidden" name="category" value={category} /> : null}
            <label htmlFor="latest-sort">Sort:</label>
            <select id="latest-sort" name="sort" defaultValue={sort}>
              <option value="latest">Latest</option>
              <option value="popular">Popular</option>
              <option value="oldest">Oldest</option>
            </select>
            <button type="submit" aria-label="Apply article sort">Apply</button>
          </form>
        </div>

        {featured && data.featured && page === 1 && !query && !category ? <div className="ps-latest-featured-wrap"><div className="ps-section-heading"><div><span className="ps-eyebrow">Editor&apos;s pick</span><h2 className="ps-section-title">{featured.heading || "Featured Article"}</h2></div></div><FeaturedStory post={data.featured} /></div> : null}

        <div className={`ps-latest-layout ${hasSidebar ? "" : "ps-latest-layout-no-sidebar"}`}>
          <div>
            {data.items.length ? <div className="ps-latest-grid">{data.items.map((post) => <ArticleCardV2 key={post.id} post={post} />)}</div> : <div className="ps-empty-state">No articles matched your filters.</div>}
            <div className="ps-latest-pagination"><PaginationV2 page={data.page} totalPages={data.pages} baseHref={baseHref} /></div>
          </div>

          {hasSidebar ? <aside className="ps-latest-sidebar" aria-label="Article sidebar">
            {showSidebarTrending ? <SidebarCard title="Trending Articles">
              {data.trending.map((post, index) => <CompactArticleCard key={post.id} post={post} rank={index + 1} />)}
            </SidebarCard> : null}
            {showSidebarCategories ? <SidebarCard title="Categories">
              <div className="ps-sidebar-category-list">{data.categories.slice(0, 10).map((item) => <Link key={item.id} href={`/category/${item.slug}`}><span>{item.name}</span><strong>{item._count.posts}</strong></Link>)}</div>
            </SidebarCard> : null}
            {showSidebarNewsletter ? <SidebarCard title="Newsletter">
              <p className="ps-sidebar-copy">Get practical tutorials and fresh technology guides in your inbox.</p>
              <Link href="/#newsletter" className="ps-button ps-button-primary w-full justify-center">Subscribe Free</Link>
            </SidebarCard> : null}
            {showSidebarTools && data.tools.length ? <SidebarCard title="Featured Tools">
              <div className="ps-sidebar-tool-list">{data.tools.map((tool) => <Link key={tool.id} href={`/ai-tools/${tool.slug}`}><span className="ps-sidebar-tool-logo">{tool.logo ? <Image src={tool.logo.path} alt={tool.logo.altText ?? tool.name} fill sizes="38px" className="object-contain" /> : tool.name.slice(0, 1)}</span><span><strong>{tool.name}</strong><small>{tool.category?.name ?? "Tool"}</small></span></Link>)}</div>
            </SidebarCard> : null}
          </aside> : null}
        </div>
      </PublicContainer>
    </section>

    {newsletter ? <NewsletterBand title={newsletter.heading || "Get New Articles in Your Inbox"} description={newsletter.description || "Join PushStream readers and get useful tutorials, reviews and online growth tips delivered weekly."} /> : null}
  </main>;
}
