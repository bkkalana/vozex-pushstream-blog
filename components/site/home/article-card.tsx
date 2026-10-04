import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock3 } from "lucide-react";

type PostCard = {
  slug: string;
  title: string;
  excerpt: string | null;
  readingTime: number;
  publishedAt: Date | null;
  featuredImage: { path: string; altText: string | null } | null;
  category: { name: string; slug: string } | null;
};

function initials(value: string) {
  return value.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

export function ArticleCard({ post }: { post: PostCard }) {
  const category = post.category?.name ?? "Guide";
  return (
    <article className="ui-card ui-card-hover group overflow-hidden">
      <Link href={`/article/${post.slug}`} className="block h-full">
        <div className="relative aspect-[16/10] overflow-hidden border-b border-[var(--border)] bg-[#eef4fb]">
          {post.featuredImage ? (
            <Image src={post.featuredImage.path} alt={post.featuredImage.altText ?? post.title} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition duration-300 group-hover:scale-[1.03]" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,#bfdbfe,transparent_32%),radial-gradient(circle_at_86%_18%,#bbf7d0,transparent_28%),linear-gradient(135deg,#eaf4ff_0%,#ffffff_54%,#edfdf6_100%)]">
              <div className="absolute left-4 top-4 rounded-md bg-white/85 px-2.5 py-1 text-[.68rem] font-extrabold uppercase tracking-[.12em] text-[var(--primary)] shadow-sm backdrop-blur">{category}</div>
              <div className="absolute bottom-5 left-5 grid size-14 place-items-center rounded-md bg-[#071b46] text-lg font-black text-white shadow-xl">{initials(post.title)}</div>
              <div className="absolute bottom-6 right-5 h-1.5 w-20 rounded-full bg-[var(--primary)]" />
            </div>
          )}
        </div>
        <div className="flex min-h-[205px] flex-col p-5">
          <span className="inline-flex w-fit rounded-md bg-[#eaf4ff] px-2 py-1 text-[.68rem] font-extrabold uppercase tracking-[.08em] text-[var(--primary)]">{category}</span>
          <h3 className="mt-3 text-xl font-black leading-tight tracking-tight group-hover:text-[var(--primary)]">{post.title}</h3>
          {post.excerpt ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">{post.excerpt}</p> : null}
          <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs font-semibold text-[var(--text-muted)]">
            <span>{post.publishedAt?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            <span className="inline-flex items-center gap-1"><Clock3 size={13} />{post.readingTime || 1} min</span>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-extrabold text-[var(--primary)]">Read article <ArrowRight size={15} /></span>
        </div>
      </Link>
    </article>
  );
}
