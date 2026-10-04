import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { ArticleCard } from "@/components/site/home/article-card";
import { publishedPostWhere } from "@/services/site/content.service";

export async function ContentHub({ title, description, categorySlugs, topics }: { title: string; description: string; categorySlugs: string[]; topics: string[] }) {
  const cats = await prisma.category.findMany({
    where: { archivedAt: null, OR: [{ slug: { in: categorySlugs } }, { parent: { slug: { in: categorySlugs } } }] },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const ids = cats.map((category) => category.id);
  const [featured, latest, popular] = await Promise.all([
    prisma.post.findFirst({ where: { ...publishedPostWhere(), categoryId: { in: ids }, isFeatured: true }, orderBy: { publishedAt: "desc" }, include: { category: true, featuredImage: true, author: true } }),
    prisma.post.findMany({ where: { ...publishedPostWhere(), categoryId: { in: ids } }, orderBy: { publishedAt: "desc" }, take: 8, include: { category: true, featuredImage: true, author: true } }),
    prisma.post.findMany({ where: { ...publishedPostWhere(), categoryId: { in: ids } }, orderBy: [{ views: "desc" }, { publishedAt: "desc" }], take: 4, include: { category: true, featuredImage: true, author: true } }),
  ]);

  return (
    <>
      <section className="bg-[linear-gradient(135deg,#f4f8ff_0%,#fff_58%,#f2fbf6_100%)] py-16 sm:py-20">
        <div className="site-container grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <p className="eyebrow">PushStream Hub</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--text-secondary)]">{description}</p>
            <form action="/search" className="mt-7 flex max-w-xl flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor={`hub-search-${categorySlugs.join("-")}`}>Search {title}</label>
              <input id={`hub-search-${categorySlugs.join("-")}`} type="search" name="q" aria-label={`Search ${title}`} placeholder={`Search ${title.toLowerCase()}...`} className="min-h-12 flex-1 rounded-md border border-[var(--border)] bg-white px-4 shadow-sm" />
              <button aria-label={`Search ${title}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-5 font-extrabold text-white transition hover:bg-[var(--primary-hover)]">
                <Search size={17} aria-hidden="true" /> Search
              </button>
            </form>
          </div>
          <div className="rounded-md border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
            <div className="grid gap-3 sm:grid-cols-2">
              {topics.slice(0, 4).map((topic, index) => (
                <div key={topic} className={index === 0 ? "rounded-md bg-[#eef4ff] p-5 sm:col-span-2" : "rounded-md border border-[var(--border)] bg-[#fbfdff] p-4"}>
                  <span className="text-xs font-extrabold uppercase tracking-[.12em] text-[var(--primary)]">Topic</span>
                  <div className="mt-2 text-lg font-black tracking-tight">{topic}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="site-container">
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => <span key={topic} className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm font-extrabold text-[var(--text-secondary)]">{topic}</span>)}
          </div>

          {featured ? (
            <Link href={`/article/${featured.slug}`} className="mt-10 grid overflow-hidden rounded-md bg-[#101827] text-white shadow-[var(--shadow-card)] lg:grid-cols-[.85fr_1fr]">
              <div className="relative min-h-[280px] bg-[#1d2a3f]">
                {featured.featuredImage ? (
                  <Image src={featured.featuredImage.path} alt={featured.featuredImage.altText ?? featured.title} fill sizes="(max-width: 900px) 100vw, 50vw" className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#1d2a3f,#234a70_56%,#0f766e)]" />
                )}
              </div>
              <div className="p-7 sm:p-10">
                <span className="eyebrow text-[#8cc0ff]">Featured guide</span>
                <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight tracking-tight">{featured.title}</h2>
                <p className="mt-3 max-w-2xl leading-7 text-white/70">{featured.excerpt}</p>
                <span className="mt-6 inline-flex items-center gap-2 font-extrabold text-[#8cc0ff]">Read guide <ArrowRight size={18} aria-hidden="true" /></span>
              </div>
            </Link>
          ) : null}

          <div className="mt-12 flex items-end justify-between gap-5">
            <div>
              <p className="eyebrow">Latest</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">Latest guides</h2>
            </div>
          </div>
          {latest.length ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{latest.map((post) => <ArticleCard key={post.id} post={post} />)}</div>
          ) : (
            <div className="mt-6 rounded-md border border-dashed border-[var(--border)] bg-[var(--background-soft)] p-8 text-center text-[var(--text-muted)]">Published guides for this hub will appear here automatically.</div>
          )}

          {popular.length > 0 ? (
            <>
              <div className="mt-14">
                <p className="eyebrow">Most read</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">Popular guides</h2>
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{popular.map((post) => <ArticleCard key={post.id} post={post} />)}</div>
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}
