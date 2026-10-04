import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { buildMetadata } from "@/lib/seo/metadata";
import { ArchiveHero, EmptyArchiveState } from "@/components/site/v2/pages/archive-shell";
import { PublicContainer } from "@/components/site/v2/primitives/container";

async function loadSeries(slug: string) {
  return prisma.contentSeries.findUnique({
    where: { slug },
    include: {
      posts: {
        orderBy: { sortOrder: "asc" },
        include: { post: { select: { title: true, slug: true, excerpt: true, status: true, robotsIndex: true, publishedAt: true, deletedAt: true } } },
      },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const series = await loadSeries(slug);
  if (!series) return {};
  return buildMetadata({
    title: series.name,
    description: series.description,
    canonicalPath: `/series/${series.slug}`,
    index: true,
    follow: true,
  });
}

export default async function SeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const series = await loadSeries(slug);
  if (!series) notFound();

  const now = new Date();
  const posts = series.posts.filter((item) => item.post.status === "PUBLISHED" && item.post.robotsIndex && !item.post.deletedAt && item.post.publishedAt && item.post.publishedAt <= now);

  return (
    <main>
      <ArchiveHero eyebrow="Content series" title={series.name} description={series.description}>
        <div className="ps-archive-stat-card"><strong>{posts.length}</strong><span>parts in this series</span></div>
      </ArchiveHero>
      <section className="ps-section ps-archive-section">
        <PublicContainer className="ps-series-wrap">
          {posts.length ? posts.map((item, index) => (
            <article key={item.post.slug} className="ps-series-card">
              <div className="ps-series-number">{String(index + 1).padStart(2, "0")}</div>
              <div>
                <span className="ps-content-label">Part {index + 1} of {posts.length}</span>
                <h2><Link href={`/article/${item.post.slug}`}>{item.post.title}</Link></h2>
                {item.post.excerpt ? <p>{item.post.excerpt}</p> : null}
                <Link href={`/article/${item.post.slug}`} className="ps-inline-link">Read part <ArrowRight size={15} /></Link>
              </div>
            </article>
          )) : <EmptyArchiveState title="No public parts yet" body="Published articles in this series will appear here." />}
        </PublicContainer>
      </section>
    </main>
  );
}
