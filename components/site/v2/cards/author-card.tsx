import Image from "next/image";
import Link from "next/link";
export function AuthorCardV2({ author }: { author: { slug: string; displayName: string; title?: string | null; bio?: string | null; avatar?: { path: string; altText?: string | null } | null } }) {
  return <article className="ps-card ps-author-card"><Link href={`/author/${author.slug}`} className="ps-author-photo">{author.avatar ? <Image src={author.avatar.path} alt={author.avatar.altText ?? author.displayName} fill sizes="(max-width:768px) 100vw, 25vw" className="object-cover"/> : <span className="ps-media-placeholder"/>}</Link><div className="ps-author-body"><h3><Link href={`/author/${author.slug}`}>{author.displayName}</Link></h3>{author.title ? <span className="ps-author-role">{author.title}</span> : null}{author.bio ? <p>{author.bio}</p> : null}</div></article>;
}
