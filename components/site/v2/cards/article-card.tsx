import Image from "next/image";
import Link from "next/link";
import { Bookmark } from "lucide-react";

type ArticleCardPost = {
  slug: string;
  title: string;
  excerpt?: string | null;
  readingTime?: number | null;
  publishedAt?: Date | string | null;
  category?: { name: string; slug?: string; color?: string | null } | null;
  author?: { name?: string | null; avatar?: string | null; authorProfile?: { slug?: string | null } | null } | null;
  featuredImage?: { path: string; altText?: string | null } | null;
};

function formatDate(value?: Date | string | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function ArticleCardV2({ post, compact = false }: { post: ArticleCardPost; compact?: boolean }) {
  const date = formatDate(post.publishedAt);
  return (
    <article className={`ps-card ps-card-hover ps-article-card ${compact ? "ps-article-card-compact" : ""}`}>
      <Link href={`/article/${post.slug}`} className="ps-article-media" aria-label={post.title}>
        {post.featuredImage ? (
          <Image src={post.featuredImage.path} alt={post.featuredImage.altText ?? post.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
        ) : <span className="ps-media-placeholder" />}
      </Link>
      <div className="ps-article-body">
        {post.category ? <span className="ps-content-label">{post.category.name}</span> : null}
        <h3><Link href={`/article/${post.slug}`}>{post.title}</Link></h3>
        {!compact && post.excerpt ? <p>{post.excerpt}</p> : null}
        <div className="ps-article-meta">
          {post.author?.avatar ? <span className="ps-author-avatar"><Image src={post.author.avatar} alt="" fill sizes="24px" className="object-cover" /></span> : null}
          <span>{post.author?.name ?? "PushStream"}</span>
          {date ? <span>{date}</span> : null}
          {post.readingTime ? <span>{post.readingTime} min read</span> : null}
          <Bookmark size={15} className="ml-auto" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}
