import Image from "next/image";
import Link from "next/link";

export function CompactArticleCard({ post, rank }: { post: { slug: string; title: string; publishedAt?: Date | string | null; featuredImage?: { path: string; altText?: string | null } | null }; rank?: number }) {
  const date = post.publishedAt ? new Date(post.publishedAt) : null;
  return <article className="ps-compact-article">{typeof rank === "number" ? <span className="ps-compact-rank">{rank}</span> : null}<Link href={`/article/${post.slug}`} className="ps-compact-thumb">{post.featuredImage ? <Image src={post.featuredImage.path} alt={post.featuredImage.altText ?? post.title} fill sizes="96px" className="object-cover"/> : <span className="ps-media-placeholder"/>}</Link><div><h3><Link href={`/article/${post.slug}`}>{post.title}</Link></h3>{date && !Number.isNaN(date.getTime()) ? <time>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date)}</time> : null}</div></article>;
}
