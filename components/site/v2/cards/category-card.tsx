import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { IconTile } from "../primitives/icon-tile";

export function CategoryCard({
  href,
  icon,
  tone = "blue",
  title,
  description,
  meta,
}: {
  href: string;
  icon: ReactNode;
  tone?: "blue" | "violet" | "green" | "orange" | "red" | "yellow";
  title: string;
  description?: string | null;
  meta?: string;
}) {
  return (
    <Link href={href} className="ps-card ps-card-hover ps-category-card">
      <IconTile tone={tone}>{icon}</IconTile>
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {meta ? <span className="ps-category-meta">{meta} <ArrowRight size={14} aria-hidden="true" /></span> : null}
    </Link>
  );
}
