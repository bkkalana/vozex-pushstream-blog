import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

type Tool = {
  slug: string;
  name: string;
  shortDescription: string;
  rating?: { toString(): string } | number | null;
  logo?: { path: string; altText?: string | null } | null;
  category?: { name: string } | null;
};

export function ToolCardV2({ tool }: { tool: Tool }) {
  return (
    <article className="ps-card ps-card-hover ps-tool-card">
      <div className="ps-tool-head">
        <div className="ps-tool-logo">{tool.logo ? <Image src={tool.logo.path} alt={tool.logo.altText ?? tool.name} fill sizes="48px" className="object-contain" /> : <span>{tool.name.slice(0,1)}</span>}</div>
        <div><h3>{tool.name}</h3>{tool.category ? <span>{tool.category.name}</span> : null}</div>
      </div>
      <p>{tool.shortDescription}</p>
      {tool.rating ? <div className="ps-rating"><Star size={15} fill="currentColor" aria-hidden="true" /> {tool.rating.toString()}</div> : null}
      <Link className="ps-button ps-button-primary w-full justify-center" href={`/ai-tools/${tool.slug}`}>View Details</Link>
    </article>
  );
}
