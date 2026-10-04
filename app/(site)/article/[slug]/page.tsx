import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Mail, Search, UserRound } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { JsonLd } from "@/components/site/json-ld";
import { ArticleJsonRenderer } from "@/components/site/article-json-renderer";
import { ArticleToc } from "@/components/site/article/article-toc";
import { ReadingProgress } from "@/components/site/article/reading-progress";
import { ShareActions } from "@/components/site/article/share-actions";
import { TutorialRequirements } from "@/components/site/article/tutorial-requirements";
import { ViewTracker } from "@/components/site/article/view-tracker";
import { CommentForm } from "@/components/site/engagement/comment-form";
import { AdSlot } from "@/components/site/monetization/ad-slot";
import { ArticleCardV2 } from "@/components/site/v2/cards/article-card";
import { CompactArticleCard } from "@/components/site/v2/cards/compact-article-card";
import { Breadcrumbs } from "@/components/site/v2/primitives/breadcrumbs";
import { PublicContainer } from "@/components/site/v2/primitives/container";
import { NewsletterBand } from "@/components/site/v2/sections/newsletter-band";
import { extractToc } from "@/services/site/toc";
import { relatedPosts } from "@/services/site/content.service";
import { buildMetadata } from "@/lib/seo/metadata";
import { articleSchema, breadcrumbSchema } from "@/lib/seo/schema";
import { getCachedPublishedArticle } from "@/lib/cache/public-cache";

export const revalidate = 300;

async function getPost(slug: string) { return getCachedPublishedArticle(slug); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    canonicalPath: `/article/${post.slug}`,
    canonicalUrl: post.canonicalUrl,
    index: post.robotsIndex,
    follow: post.robotsFollow,
    ogTitle: post.ogTitle,
    ogDescription: post.ogDescription,
    ogImage: post.ogImage?.path || post.featuredImage?.path,
    twitterImage: post.twitterImage?.path || post.ogImage?.path || post.featuredImage?.path,
    type: "article",
    publishedTime: post.publishedAt?.toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
  });
}

function date(value: Date | null | undefined) {
  return value ? value.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const now = new Date();
  const toc = post.tableOfContentsEnabled ? extractToc(post.content) : [];
  const [related, membership, previousNext, recentPosts, sidebarCategories] = await Promise.all([
    relatedPosts(post.id, post.categoryId, post.tags.map((item) => item.tagId), 4),
    prisma.contentSeriesPost.findUnique({
      where: { postId: post.id },
      include: { series: { include: { posts: { orderBy: { sortOrder: "asc" }, include: { post: { select: { title: true, slug: true, status: true, deletedAt: true } } } } } } },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now }, id: { not: post.id } },
      orderBy: { publishedAt: "desc" },
      take: 2,
      select: { id: true, title: true, slug: true },
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now }, id: { not: post.id } },
      orderBy: { publishedAt: "desc" },
      take: 4,
      select: { id: true, title: true, slug: true, publishedAt: true, readingTime: true, featuredImage: { select: { path: true, altText: true } } },
    }),
    prisma.category.findMany({
      where: { archivedAt: null },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      take: 8,
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { posts: { where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now } } } } },
      },
    }),
  ]);

  const articleLd = articleSchema({
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    url: `/article/${post.slug}`,
    image: post.ogImage?.path || post.featuredImage?.path,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: post.author.name,
    schemaType: post.schemaType,
  });
  const crumbLd = breadcrumbSchema([
    { name: "Home", url: "/" },
    ...(post.category ? [{ name: post.category.name, url: `/category/${post.category.slug}` }] : []),
    { name: post.title, url: `/article/${post.slug}` },
  ]);

  return <>
    <JsonLd value={articleLd} />
    <JsonLd value={crumbLd} />
    <ReadingProgress />
    <ViewTracker postId={post.id} />

    <article className="ps-article-page">
      <header className="ps-article-hero">
        <PublicContainer className="ps-article-hero-inner">
          <Breadcrumbs items={[
            { label: "Home", href: "/" },
            ...(post.category ? [{ label: post.category.name, href: `/category/${post.category.slug}` }] : []),
            { label: post.title },
          ]} />
          {post.category ? <Link href={`/category/${post.category.slug}`} className="ps-content-label mt-6 inline-flex">{post.category.name}</Link> : null}
          <h1>{post.title}</h1>
          {(post.subtitle || post.excerpt) ? <p className="ps-article-deck">{post.subtitle || post.excerpt}</p> : null}
          <div className="ps-article-byline">
            <span className="ps-article-author-mark" aria-hidden="true">{post.author.name.slice(0, 1).toUpperCase()}</span>
            <span className="ps-article-byline-author">By {post.author.authorProfile ? <Link href={`/author/${post.author.authorProfile.slug}`}>{post.author.name}</Link> : post.author.name}</span>
            {post.publishedAt ? <span><CalendarDays size={15} />{date(post.publishedAt)}</span> : null}
            <span><Clock3 size={15} />{post.readingTime || 1} min read</span>
            <span className="ps-article-updated">Updated {date(post.updatedAt)}</span>
          </div>
          <div className="ps-article-share"><span>Share</span><ShareActions title={post.title} /></div>
        </PublicContainer>
      </header>

      {post.featuredImage ? <PublicContainer className="ps-article-featured-wrap">
        <figure className="ps-article-featured">
          <div className="relative aspect-[16/8.3] overflow-hidden"><Image src={post.featuredImage.path} alt={post.featuredImageAlt || post.featuredImage.altText || post.title} fill priority sizes="(max-width: 1100px) 100vw, 1100px" className="object-cover" /></div>
          {post.featuredImage.caption ? <figcaption>{post.featuredImage.caption}</figcaption> : null}
        </figure>
      </PublicContainer> : null}

      <PublicContainer className="ps-article-content-wrap">
        <div className="ps-article-layout">
          <div className="min-w-0">
            <ArticleToc items={toc} mobile />

            {post.excerpt ? <section className="ps-quick-answer" aria-labelledby="quick-answer-title">
              <span className="ps-quick-answer-icon">✓</span>
              <div><p id="quick-answer-title" className="ps-quick-answer-label">Quick Answer</p><p>{post.excerpt}</p></div>
            </section> : null}

            {post.isSponsored ? <section className="ps-article-disclosure ps-article-disclosure-sponsored">
              <strong>Sponsored content</strong>
              <p>{post.sponsorDisclosureText || `This article is sponsored${post.sponsorName ? ` by ${post.sponsorName}` : ""}. Sponsored relationships are disclosed separately from editorial content.`}</p>
              {post.sponsorUrl ? <a href={post.sponsorUrl} target="_blank" rel="nofollow sponsored noopener">Sponsor information</a> : null}
            </section> : null}

            <TutorialRequirements difficulty={post.tutorialDifficulty} minutes={post.tutorialEstimatedMinutes} requirements={post.tutorialRequirements} tools={post.tutorialToolsNeeded} prerequisites={post.tutorialPrerequisites} />
            <AdSlot placement="ARTICLE_AFTER_INTRO" categoryId={post.categoryId} articleType={post.schemaType} />
            <ArticleJsonRenderer doc={post.content} />
            <AdSlot placement="ARTICLE_MIDDLE" categoryId={post.categoryId} articleType={post.schemaType} />
            <AdSlot placement="ARTICLE_BEFORE_RELATED_POSTS" categoryId={post.categoryId} articleType={post.schemaType} />

            {membership ? (() => {
              const live = membership.series.posts.filter((item) => item.post.status === "PUBLISHED" && !item.post.deletedAt);
              const index = live.findIndex((item) => item.postId === post.id);
              const previous = index > 0 ? live[index - 1] : null;
              const next = index >= 0 && index < live.length - 1 ? live[index + 1] : null;
              return <section className="ps-article-series">
                <p>Series · Part {index + 1} of {live.length}</p>
                <h2><Link href={`/series/${membership.series.slug}`}>{membership.series.name}</Link></h2>
                <div>{previous ? <Link href={`/article/${previous.post.slug}`}><ArrowLeft size={15} />{previous.post.title}</Link> : null}{next ? <Link href={`/article/${next.post.slug}`}>{next.post.title}<ArrowRight size={15} /></Link> : null}</div>
              </section>;
            })() : null}

            {post.tags.length ? <div className="ps-article-tags">{post.tags.map((item) => <Link key={item.tagId} href={`/tag/${item.tag.slug}`}>#{item.tag.name}</Link>)}</div> : null}

            <section className="ps-article-author-box">
              <div className="ps-article-author-avatar"><UserRound size={24} aria-hidden="true" /></div>
              <div><p className="ps-article-author-kicker">Written by</p><h2>{post.author.name}</h2>{post.author.authorProfile?.jobTitle ? <p className="ps-article-author-role">{post.author.authorProfile.jobTitle}</p> : null}<p>{post.author.authorProfile?.shortBio || "PushStream contributor."}</p>{post.author.authorProfile ? <Link href={`/author/${post.author.authorProfile.slug}`}>More from this author <ArrowRight size={15} /></Link> : null}</div>
            </section>

            {post.allowComments ? <section className="ps-article-comments">
              <div className="ps-section-heading"><div><span className="ps-eyebrow">Discussion</span><h2 className="ps-section-title">Comments</h2></div></div>
              {post.comments.length ? <div className="space-y-4">{post.comments.map((comment) => <article key={comment.id} className="ps-comment-card"><div className="font-bold">{comment.name}</div><time>{comment.createdAt.toLocaleDateString()}</time><p>{comment.content}</p>{comment.replies.length ? <div className="ps-comment-replies">{comment.replies.map((reply) => <div key={reply.id}><strong>{reply.name}</strong><p>{reply.content}</p></div>)}</div> : null}</article>)}</div> : <p className="ps-muted-copy">No approved comments yet.</p>}
              <CommentForm postId={post.id} />
            </section> : null}

            {previousNext.length ? <nav className="ps-article-next-prev" aria-label="More articles">{previousNext.map((item) => <Link key={item.id} href={`/article/${item.slug}`}><span>More reading</span><strong>{item.title}</strong><ArrowRight size={16} /></Link>)}</nav> : null}
          </div>

          <aside className="ps-article-sidebar" aria-label="Article sidebar">
            <div className="ps-article-sidebar-sticky">
              <form action="/search" method="get" className="ps-article-sidebar-search"><Search size={18} aria-hidden="true" /><input name="q" placeholder="Search articles..." aria-label="Search articles" /><button type="submit" aria-label="Search articles">Search</button></form>
              {toc.length ? <div className="ps-sidebar-card"><ArticleToc items={toc} embedded /></div> : null}
              <div className="ps-sidebar-card ps-sidebar-newsletter"><span className="ps-sidebar-newsletter-icon"><Mail size={19} /></span><h2>Stay in the loop</h2><p>Get practical tech guides and useful tools in your inbox every week.</p><Link href="/#newsletter" className="ps-button ps-button-primary w-full justify-center">Subscribe Free</Link></div>
              {recentPosts.length ? <div className="ps-sidebar-card"><h2 className="ps-sidebar-title">Recent Articles</h2><div className="mt-3 space-y-1">{recentPosts.map((item, index) => <CompactArticleCard key={item.id} post={item} rank={index + 1} />)}</div></div> : null}
              {sidebarCategories.length ? <div className="ps-sidebar-card"><h2 className="ps-sidebar-title">Categories</h2><div className="ps-sidebar-category-list mt-3">{sidebarCategories.map((category) => <Link key={category.id} href={`/category/${category.slug}`}><span>{category.name}</span><strong>{category._count.posts}</strong></Link>)}</div></div> : null}
              <AdSlot placement="SIDEBAR" categoryId={post.categoryId} articleType={post.schemaType} />
              {post.isAffiliate ? <div className="ps-article-disclosure"><strong>Affiliate disclosure</strong><p>This article may contain affiliate links. Editorial content remains independently managed.</p></div> : null}
            </div>
          </aside>
        </div>
      </PublicContainer>
    </article>

    {related.length ? <section className="ps-section ps-related-section"><PublicContainer><div className="ps-section-heading"><div><span className="ps-eyebrow">Keep reading</span><h2 className="ps-section-title">Related Articles</h2></div></div><div className="ps-related-grid">{related.map((item) => <ArticleCardV2 key={item.id} post={item} />)}</div></PublicContainer></section> : null}
    <NewsletterBand title="Get New Articles in Your Inbox" description="Join PushStream readers and get practical tutorials, reviews and useful technology tips delivered weekly." />
  </>;
}
