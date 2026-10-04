import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

export function ReviewCardV2({ review }: { review: {
  slug: string;
  title: string;
  verdict?: string | null;
  publishedAt?: Date | string | null;
  aiTool?: {
    name: string;
    logo?: { path: string; altText?: string | null } | null;
    category?: { name: string } | null;
  } | null;
} }) {
  const date = review.publishedAt ? new Date(review.publishedAt) : null;
  return (
    <article className="ps-card ps-card-hover ps-review-card">
      <Link href={`/reviews/${review.slug}`} className="ps-review-media" aria-label={review.title}>
        {review.aiTool?.logo ? (
          <Image
            src={review.aiTool.logo.path}
            alt={review.aiTool.logo.altText ?? review.aiTool.name}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="object-contain p-8"
          />
        ) : <span className="ps-media-placeholder" />}
      </Link>
      <div className="ps-review-body">
        <span className="ps-content-label">{review.aiTool?.category?.name ?? "Review"}</span>
        <h3><Link href={`/reviews/${review.slug}`}>{review.title}</Link></h3>
        {review.verdict ? <p>{review.verdict}</p> : null}
        {date && !Number.isNaN(date.getTime()) ? (
          <div className="ps-review-date"><CalendarDays size={13} /> {date.toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" })}</div>
        ) : null}
        <Link href={`/reviews/${review.slug}`} className="ps-inline-link">Read review <ArrowRight size={15} aria-hidden="true" /></Link>
      </div>
    </article>
  );
}
