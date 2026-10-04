import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Compass,
  Heart,
  Lightbulb,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { PublicContainer } from "@/components/site/v2/primitives/container";
import { NewsletterBand } from "@/components/site/v2/sections/newsletter-band";
import { getEditorialPageData, type EditorialPageSection } from "@/services/site/about-contact-v2.service";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "About PushStream",
  description: "Learn about PushStream, our mission, topics, people and values.",
};

function stringConfig(section: EditorialPageSection | undefined, key: string, fallback: string) {
  const value = section?.config[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function itemIcon(name?: string | null) {
  const key = (name ?? "").toLowerCase();
  if (key.includes("target") || key.includes("mission")) return Target;
  if (key.includes("compass") || key.includes("vision")) return Compass;
  if (key.includes("trust") || key.includes("shield")) return ShieldCheck;
  if (key.includes("heart") || key.includes("community")) return Heart;
  if (key.includes("idea") || key.includes("light")) return Lightbulb;
  if (key.includes("rocket") || key.includes("growth")) return Rocket;
  if (key.includes("code") || key.includes("dev")) return Code2;
  if (key.includes("book") || key.includes("learn")) return BookOpen;
  return Sparkles;
}

export default async function AboutPage() {
  const data = await getEditorialPageData("about");
  const hero = data.section("hero");
  const mission = data.section("mission");
  const topics = data.section("topics");
  const team = data.section("team");
  const values = data.section("values");
  const community = data.section("community");
  const newsletter = data.section("newsletter");
  const heroImage = hero?.imageId ? data.media.get(hero.imageId) : null;

  const missionItems = mission?.items.length
    ? mission.items.slice(0, 2)
    : [
        { title: "Our Mission", subtitle: "Make useful knowledge easier to act on.", body: "PushStream turns technical ideas, tools and online-business concepts into clear, practical guidance people can use with confidence.", icon: "target", imageId: null, url: null, sortOrder: 10, config: {} },
        { title: "Our Vision", subtitle: "A smarter, more useful web for everyone.", body: "We want creators, builders and businesses to spend less time sorting through noise and more time learning, building and growing.", icon: "compass", imageId: null, url: null, sortOrder: 20, config: {} },
      ];

  const topicItems = topics?.items.length
    ? topics.items.filter((item) => item.title).map((item) => ({
        id: item.id ?? item.title!,
        name: item.title!,
        slug: item.url?.replace(/^\/+/, "") || "",
        description: item.body,
        icon: item.icon,
        count: item.subtitle,
      }))
    : data.categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        count: `${category._count.posts} published articles`,
      }));

  const valueItems = values?.items.length
    ? values.items
    : [
        { title: "Useful First", body: "Every guide should help the reader do something better, faster or more confidently.", icon: "lightbulb" },
        { title: "Clarity Over Noise", body: "We simplify complexity without hiding the details that matter.", icon: "book" },
        { title: "Trust Matters", body: "Clear disclosures, careful updates and transparent editorial choices matter to us.", icon: "shield" },
        { title: "Keep Improving", body: "Technology changes quickly, so our content and recommendations should evolve with it.", icon: "rocket" },
      ];

  const communityItems = community?.items.length
    ? community.items.slice(0, 4).map((item) => ({ value: item.title || "—", label: item.subtitle || item.body || "Community" }))
    : [
        { value: `${data.categories.reduce((sum, category) => sum + category._count.posts, 0)}+`, label: "Published Guides" },
        { value: `${data.categories.length}+`, label: "Topics Covered" },
        { value: `${data.authors.length}+`, label: "Contributors" },
        { value: "Always", label: "Learning & Updating" },
      ];

  return (
    <main className="ps-about-page">
      {hero ? (
        <section className="ps-about-hero">
          <PublicContainer className="ps-about-hero-grid">
            <div>
              <span className="ps-eyebrow">{stringConfig(hero, "eyebrow", "ABOUT PUSHSTREAM")}</span>
              <h1>
                {hero.heading || "A Smarter Web For Everyone."}
                <span>{stringConfig(hero, "accentText", "Learn. Build. Grow.")}</span>
              </h1>
              <p>{hero.description || "PushStream publishes practical technology, WordPress, development, AI-tool and online-business guidance for people who want clear answers and useful next steps."}</p>
              <div className="ps-hero-actions">
                <Link href={stringConfig(hero, "primaryCtaUrl", "/latest")} className="ps-button ps-button-primary">
                  {stringConfig(hero, "primaryCtaLabel", "Explore Articles")} <ArrowRight size={16} />
                </Link>
                <Link href={stringConfig(hero, "secondaryCtaUrl", "/contact")} className="ps-button ps-button-secondary">
                  {stringConfig(hero, "secondaryCtaLabel", "Contact Us")}
                </Link>
              </div>
            </div>
            <div className="ps-about-hero-visual">
              <div className="ps-about-hero-image">
                {heroImage ? (
                  <Image src={heroImage.path} alt={heroImage.altText ?? "About PushStream"} fill priority sizes="(max-width: 900px) 100vw, 45vw" className="object-cover" />
                ) : (
                  <div className="ps-about-hero-placeholder"><Users size={44} /><strong>{data.settings.siteName}</strong><span>{data.settings.tagline}</span></div>
                )}
              </div>
              {(hero.items.length ? hero.items.slice(0, 3).map((item) => item.title).filter(Boolean) : ["Practical guides", "Independent reviews", "Builder community"]).map((label, index) => (
                <span key={`${label}-${index}`} className={`ps-about-float ps-about-float-${index + 1}`}><CheckCircle2 size={14} /> {label}</span>
              ))}
            </div>
          </PublicContainer>
        </section>
      ) : null}

      {mission ? (
        <section className="ps-section ps-about-mission">
          <PublicContainer>
            <div className="ps-section-heading ps-section-heading-centered">
              <div><span className="ps-eyebrow">WHY WE EXIST</span><h2 className="ps-section-title">{mission.heading || "Our Mission & Vision"}</h2>{mission.description ? <p>{mission.description}</p> : null}</div>
            </div>
            <div className="ps-about-mission-grid">
              {missionItems.map((item, index) => {
                const Icon = itemIcon(item.icon);
                return <article key={`${item.title}-${index}`} className="ps-about-mission-card"><span className="ps-about-icon"><Icon size={24} /></span><span className="ps-about-card-kicker">{index === 0 ? "Mission" : "Vision"}</span><h3>{item.title}</h3>{item.subtitle ? <strong>{item.subtitle}</strong> : null}{item.body ? <p>{item.body}</p> : null}</article>;
              })}
            </div>
          </PublicContainer>
        </section>
      ) : null}

      {topics ? (
        <section className="ps-section ps-about-topics">
          <PublicContainer>
            <div className="ps-section-heading"><div><span className="ps-eyebrow">WHAT WE COVER</span><h2 className="ps-section-title">{topics.heading || "Topics on PushStream"}</h2>{topics.description ? <p>{topics.description}</p> : null}</div><Link href="/latest" className="ps-inline-link">Browse all articles <ArrowRight size={16} /></Link></div>
            <div className="ps-about-topic-grid">
              {topicItems.slice(0, topics.itemCount ?? 6).map((category) => {
                const Icon = itemIcon(category.icon ?? category.name);
                const href = category.slug ? (category.slug.startsWith("http") ? category.slug : category.slug.startsWith("category/") ? `/${category.slug}` : `/category/${category.slug}`) : "/latest";
                return <Link key={category.id} href={href} className="ps-about-topic-card"><span className="ps-about-icon"><Icon size={22} /></span><h3>{category.name}</h3>{category.description ? <p>{category.description}</p> : null}<small>{category.count || "Explore articles"}</small></Link>;
              })}
            </div>
          </PublicContainer>
        </section>
      ) : null}

      {team ? (
        <section className="ps-section ps-about-team">
          <PublicContainer>
            <div className="ps-section-heading ps-section-heading-centered"><div><span className="ps-eyebrow">PEOPLE BEHIND THE CONTENT</span><h2 className="ps-section-title">{team.heading || "The People Behind PushStream"}</h2>{team.description ? <p>{team.description}</p> : null}</div></div>
            <div className="ps-about-team-grid">
              {data.authors.slice(0, team.itemCount ?? 4).map((author) => (
                <article key={author.id} className="ps-about-team-card">
                  <div className="ps-about-team-avatar">{author.user.avatar ? <Image src={author.user.avatar} alt={author.user.name} fill sizes="180px" className="object-cover" /> : <span>{author.user.name.slice(0, 1).toUpperCase()}</span>}</div>
                  <h3><Link href={`/author/${author.slug}`}>{author.user.name}</Link></h3>
                  {author.jobTitle ? <strong>{author.jobTitle}</strong> : null}
                  {author.shortBio ? <p>{author.shortBio}</p> : null}
                  {author.expertise.length ? <div className="ps-about-expertise">{author.expertise.slice(0, 3).map((item) => <span key={item.id}>{item.topic}</span>)}</div> : null}
                </article>
              ))}
            </div>
          </PublicContainer>
        </section>
      ) : null}

      {values ? (
        <section className="ps-section ps-about-values">
          <PublicContainer>
            <div className="ps-section-heading ps-section-heading-centered"><div><span className="ps-eyebrow">OUR VALUES</span><h2 className="ps-section-title">{values.heading || "What Guides Us"}</h2>{values.description ? <p>{values.description}</p> : null}</div></div>
            <div className="ps-about-values-grid">
              {valueItems.slice(0, values.itemCount ?? 4).map((item, index) => { const Icon = itemIcon(item.icon); return <article key={`${item.title}-${index}`} className="ps-about-value-card"><span className="ps-about-icon"><Icon size={22} /></span><h3>{item.title}</h3>{item.body ? <p>{item.body}</p> : null}</article>; })}
            </div>
          </PublicContainer>
        </section>
      ) : null}

      {community ? (
        <section className="ps-about-community">
          <PublicContainer>
            <div className="ps-about-community-copy"><span className="ps-eyebrow">COMMUNITY</span><h2>{community.heading || "A Growing Community"}</h2>{community.description ? <p>{community.description}</p> : <p>Built for curious readers, practical builders and teams who want useful technology knowledge without unnecessary noise.</p>}</div>
            <div className="ps-about-community-stats">{communityItems.map((item, index) => <div key={`${item.label}-${index}`}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>
          </PublicContainer>
        </section>
      ) : null}

      {newsletter ? <NewsletterBand title={newsletter.heading || "Join the PushStream Community"} description={newsletter.description || "Get practical guides, useful tools and fresh ideas delivered to your inbox."} /> : null}
    </main>
  );
}
