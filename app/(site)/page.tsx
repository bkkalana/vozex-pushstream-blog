export const revalidate = 300;

import Link from "next/link";
import {
  Bot,
  Box,
  Code2,
  FileText,
  Globe2,
  Hammer,
  Palette,
  Sparkles,
  Star,
  Wrench,
  Zap,
} from "lucide-react";
import { AdSlot } from "@/components/site/monetization/ad-slot";
import { ArticleCardV2 } from "@/components/site/v2/cards/article-card";
import { CategoryCard } from "@/components/site/v2/cards/category-card";
import { ComparisonCardV2 } from "@/components/site/v2/cards/comparison-card";
import { ReviewCardV2 } from "@/components/site/v2/cards/review-card";
import { ToolCardV2 } from "@/components/site/v2/cards/tool-card";
import { PublicContainer } from "@/components/site/v2/primitives/container";
import { PrimaryButton } from "@/components/site/v2/primitives/buttons";
import { SectionHeading } from "@/components/site/v2/primitives/section-heading";
import { NewsletterBand } from "@/components/site/v2/sections/newsletter-band";
import { SplitHero } from "@/components/site/v2/sections/split-hero";
import { StatsRow } from "@/components/site/v2/sections/stats-row";
import { getHomePageV2Data, type PublicHomeSection } from "@/services/site/home-v2.service";
import { resolveHeroMedia } from "@/services/site/hero-media.service";

const iconMap = {
  ai: Bot,
  "ai-tools": Bot,
  wordpress: Wrench,
  development: Code2,
  reviews: Star,
  "how-to": Hammer,
  products: Box,
  resources: Box,
  design: Palette,
  default: Globe2,
} as const;

const toneByIndex = ["violet", "blue", "green", "orange", "red", "blue"] as const;

function sectionConfig(section?: PublicHomeSection) {
  return section?.config ?? {};
}

function stringConfig(section: PublicHomeSection | undefined, key: string, fallback: string) {
  const value = sectionConfig(section)[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function categoryHref(slug: string) {
  const topLevel: Record<string, string> = {
    "ai-tools": "/ai-tools",
    wordpress: "/wordpress",
    development: "/development",
    reviews: "/reviews",
    "how-to": "/how-to",
    resources: "/resources",
    products: "/resources",
  };
  return topLevel[slug] ?? `/category/${slug}`;
}

function getCategoryIcon(slug: string, configured?: string | null) {
  const key = (configured || slug).toLowerCase();
  if (key.includes("ai")) return Bot;
  if (key.includes("wordpress")) return Wrench;
  if (key.includes("develop") || key.includes("code")) return Code2;
  if (key.includes("review")) return Star;
  if (key.includes("how") || key.includes("tutorial")) return Hammer;
  if (key.includes("product") || key.includes("resource")) return Box;
  return iconMap.default;
}

function homeStats(section: PublicHomeSection | undefined, publishedPostCount: number) {
  if (section?.items.length) {
    return section.items.slice(0, 4).map((item) => ({
      value: item.title || item.itemKey || "—",
      label: item.subtitle || item.body || "",
    }));
  }
  const articleLabel = publishedPostCount === 1 ? "Published Article" : "Published Articles";
  return [
    { value: publishedPostCount ? `${publishedPostCount}+` : "0", label: articleLabel },
    { value: "50+", label: "Tools Reviewed" },
    { value: "100K+", label: "Monthly Readers" },
    { value: "4.9/5", label: "Community Rating" },
  ];
}

function heroChips(section?: PublicHomeSection) {
  if (section?.items.length) {
    return section.items.slice(0, 6).map((item) => {
      const Icon = getCategoryIcon(item.itemKey || item.title || "", item.icon);
      return { label: item.title || item.itemKey || "Topic", icon: <Icon size={19} aria-hidden="true" /> };
    });
  }
  return [
    { label: "AI Tools", icon: <Bot size={19} aria-hidden="true" /> },
    { label: "WordPress", icon: <Wrench size={19} aria-hidden="true" /> },
    { label: "Development", icon: <Code2 size={19} aria-hidden="true" /> },
    { label: "Reviews", icon: <Star size={19} aria-hidden="true" /> },
    { label: "How-To", icon: <FileText size={19} aria-hidden="true" /> },
    { label: "Products", icon: <Box size={19} aria-hidden="true" /> },
  ];
}

function splitHeroHeading(section?: PublicHomeSection) {
  const heading = section?.heading?.trim() || "Smarter Tech. Better Solutions.";
  const configuredAccent = sectionConfig(section).accentText;
  if (typeof configuredAccent === "string" && configuredAccent.trim()) {
    return { title: heading, accent: configuredAccent.trim() };
  }
  const parts = heading.split(".").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) return { title: `${parts[0]}.`, accent: `${parts.slice(1).join(". ")}.` };
  return { title: heading, accent: "" };
}

export default async function HomePage() {
  const data = await getHomePageV2Data();
  const hero = data.section("hero");
  const heroMedia = await resolveHeroMedia(hero);
  const stats = data.section("stats");
  const categories = data.section("categories");
  const trending = data.section("trending");
  const latest = data.section("latest");
  const tools = data.section("tools");
  const reviews = data.section("reviews");
  const newsletter = data.section("newsletter");
  const heroTitle = splitHeroHeading(hero);

  return (
    <main className="ps-home-v2 flex flex-col">
      {hero ? (
        <div style={{ order: hero.sortOrder }}>
        <SplitHero
          eyebrow={stringConfig(hero, "eyebrow", "TECH GUIDES FOR A SMARTER TOMORROW")}
          title={heroTitle.title}
          accent={heroTitle.accent}
          description={hero.description || "PushStream helps you discover the best AI tools, solve WordPress issues, learn development skills, read honest reviews, and find practical guides to grow online."}
          primary={{
            label: stringConfig(hero, "primaryCtaLabel", "Explore Guides"),
            href: stringConfig(hero, "primaryCtaUrl", "/latest"),
          }}
          secondary={{
            label: stringConfig(hero, "secondaryCtaLabel", "Latest Articles"),
            href: stringConfig(hero, "secondaryCtaUrl", "/latest"),
          }}
          image={heroMedia.desktop?.path ?? heroMedia.mobile?.path ?? null}
          mobileImage={heroMedia.mobile?.path ?? null}
          imageAlt={heroMedia.alt || "PushStream technology workspace"}
          imagePosition={heroMedia.desktopPosition}
          mobileImagePosition={heroMedia.mobilePosition}
          overlay={heroMedia.overlay}
          chips={heroChips(hero)}
        />
        </div>
      ) : null}

      {stats ? (
        <section style={{ order: stats.sortOrder }} className="ps-home-stats-strip">
          <PublicContainer>
            <StatsRow items={homeStats(stats, data.publishedPostCount)} />
          </PublicContainer>
        </section>
      ) : null}

      <div style={{ order: (stats?.sortOrder ?? hero?.sortOrder ?? 10) + 1 }}><AdSlot placement="HOME_AFTER_HERO" /></div>

      {categories ? (
        <section style={{ order: categories.sortOrder }} className="ps-section ps-home-categories">
          <PublicContainer>
            <SectionHeading
              eyebrow={stringConfig(categories, "eyebrow", "Explore topics")}
              title={categories.heading || "Popular Categories"}
              description={categories.description || "Explore practical guides, reviews and tools across the topics PushStream covers."}
              action={<Link href="/latest" className="ps-inline-link">View All Categories →</Link>}
            />
            {data.categories.length ? (
              <div className="ps-home-category-grid">
                {data.categories.map((category, index) => {
                  const Icon = getCategoryIcon(category.slug, category.icon);
                  return (
                    <CategoryCard
                      key={category.id}
                      href={categoryHref(category.slug)}
                      icon={<Icon aria-hidden="true" />}
                      tone={toneByIndex[index % toneByIndex.length]}
                      title={category.name}
                      description={category.description}
                      meta={`${category._count.posts} articles`}
                    />
                  );
                })}
              </div>
            ) : <div className="ps-empty-state">No public categories are available yet.</div>}
          </PublicContainer>
        </section>
      ) : null}

      {trending ? (
        <section style={{ order: trending.sortOrder }} className="ps-section ps-section-soft ps-home-trending">
          <PublicContainer>
            <SectionHeading
              eyebrow={stringConfig(trending, "eyebrow", "Trending")}
              title={trending.heading || "Trending Articles"}
              description={trending.description || "Popular stories readers are exploring right now."}
              action={<Link href="/latest" className="ps-inline-link">View All Trending →</Link>}
            />
            {data.trending.length ? <div className="ps-home-article-grid">{data.trending.map((post) => <ArticleCardV2 key={post.id} post={post} />)}</div> : <div className="ps-empty-state">No trending articles yet.</div>}
          </PublicContainer>
        </section>
      ) : null}

      {latest ? (
        <section style={{ order: latest.sortOrder }} className="ps-section ps-home-latest">
          <PublicContainer>
            <SectionHeading
              eyebrow={stringConfig(latest, "eyebrow", "Fresh content")}
              title={latest.heading || "Latest Articles"}
              description={latest.description || "Fresh tutorials, reviews and practical guides from the PushStream team."}
              action={<Link href="/latest" className="ps-inline-link">View All Articles →</Link>}
            />
            {data.latest.length ? <div className="ps-home-article-grid">{data.latest.map((post) => <ArticleCardV2 key={post.id} post={post} />)}</div> : <div className="ps-empty-state">No published articles yet.</div>}
          </PublicContainer>
        </section>
      ) : null}

      <div style={{ order: (latest?.sortOrder ?? 50) + 1 }}><AdSlot placement="HOME_BETWEEN_SECTIONS" /></div>

      {tools ? (
        <section style={{ order: tools.sortOrder }} className="ps-section ps-section-soft ps-home-tools">
          <PublicContainer>
            <SectionHeading
              eyebrow={stringConfig(tools, "eyebrow", "Useful resources")}
              title={tools.heading || "Featured Tools"}
              description={tools.description || "Hand-picked tools and services useful for creators, developers and online businesses."}
              action={<Link href="/ai-tools" className="ps-inline-link">View All Tools →</Link>}
            />
            {data.tools.length ? <div className="ps-home-tools-grid">{data.tools.map((tool) => <ToolCardV2 key={tool.id} tool={tool} />)}</div> : <div className="ps-empty-state">No featured tools yet.</div>}
          </PublicContainer>
        </section>
      ) : null}

      {reviews ? (
        <section style={{ order: reviews.sortOrder }} className="ps-section ps-home-reviews">
          <PublicContainer>
            <SectionHeading
              eyebrow={stringConfig(reviews, "eyebrow", "Honest opinions")}
              title={reviews.heading || "Reviews & Comparisons"}
              description={reviews.description || "Independent reviews and practical side-by-side comparisons."}
              action={<Link href="/reviews" className="ps-inline-link">View All Reviews →</Link>}
            />
            {(data.reviews.length || data.comparisons.length) ? (
              <div className="ps-home-review-grid">
                {data.reviews.map((review) => <ReviewCardV2 key={`review-${review.id}`} review={review} />)}
                {data.comparisons.map((comparison) => <ComparisonCardV2 key={`comparison-${comparison.id}`} comparison={comparison} />)}
              </div>
            ) : <div className="ps-empty-state">No published reviews or comparisons yet.</div>}
            <div className="ps-home-review-cta"><PrimaryButton href="/reviews" arrow>Explore Reviews</PrimaryButton></div>
          </PublicContainer>
        </section>
      ) : null}

      {newsletter ? (
        <div style={{ order: newsletter.sortOrder }}>
        <NewsletterBand
          title={newsletter.heading || "Get the Latest Tech Guides in Your Inbox"}
          description={newsletter.description || "Join readers and get fresh articles, tool recommendations and practical web tips delivered to your inbox every week."}
        />
        </div>
      ) : null}
    </main>
  );
}
