import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { buildMetadata } from "@/lib/seo/metadata";
import { ArchiveHero, EmptyArchiveState } from "@/components/site/v2/pages/archive-shell";
import { ArticleCardV2 } from "@/components/site/v2/cards/article-card";
import { PublicContainer } from "@/components/site/v2/primitives/container";

async function loadGuide(slug: string) {
  return prisma.featuredCollection.findFirst({
    where: { slug, published: true, robotsIndex: true },
    include: { coverImage: true, items: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = await loadGuide(slug);
  if (!collection) return {};
  return buildMetadata({
    title: collection.seoTitle || collection.title,
    description: collection.seoDescription || collection.description,
    canonicalPath: `/guides/${collection.slug}`,
    index: collection.robotsIndex,
    follow: true,
    ogImage: collection.coverImage?.path,
  });
}

export default async function GuideDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await loadGuide(slug);
  if (!collection) notFound();

  const postIds = collection.items.filter((item) => item.itemType === "POST").map((item) => item.itemId);
  const posts = postIds.length ? await prisma.post.findMany({
    where: { id: { in: postIds }, status: "PUBLISHED", deletedAt: null, robotsIndex: true, publishedAt: { lte: new Date() } },
    include: { category: true, author: { include: { authorProfile: true } }, featuredImage: true },
  }) : [];

  const map = new Map(posts.map((post) => [post.id, post]));
  const ordered = postIds.map((id) => map.get(id)).filter(Boolean) as typeof posts;

  return (
    <main>
      <ArchiveHero eyebrow="Curated guide" title={collection.title} description={collection.description}>
        <div className="ps-archive-stat-card"><strong>{ordered.length}</strong><span>published items</span></div>
      </ArchiveHero>
      <section className="ps-section ps-archive-section">
        <PublicContainer>
          {ordered.length ? <div className="ps-archive-grid">{ordered.map((post) => <ArticleCardV2 key={post.id} post={post} />)}</div> : <EmptyArchiveState title="No published items" body="This collection does not currently contain public articles." />}
        </PublicContainer>
      </section>
    </main>
  );
}
