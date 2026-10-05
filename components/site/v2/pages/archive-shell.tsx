import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { PublicContainer } from "@/components/site/v2/primitives/container";
import { ResponsiveHeroImage } from "@/components/site/v2/primitives/responsive-hero-image";

export function ArchiveHero({ eyebrow, title, description, actions = [], children, media }: { eyebrow: string; title: string; description?: string | null; actions?: Array<{ label: string; href: string; primary?: boolean }>; children?: ReactNode; media?: { desktop?: {path:string;altText?:string|null}|null; mobile?: {path:string;altText?:string|null}|null; alt?:string; desktopPosition?:"center"|"top"|"bottom"|"left"|"right"; mobilePosition?:"center"|"top"|"bottom"|"left"|"right"; overlay?:number } | null; }) {
  return <section className="ps-archive-hero"><PublicContainer className="ps-archive-hero-inner"><div><span className="ps-eyebrow">{eyebrow}</span><h1>{title}</h1>{description ? <p>{description}</p> : null}{actions.length ? <div className="ps-hero-actions">{actions.map((action) => <Link key={action.href + action.label} href={action.href} className={`ps-button ${action.primary ? "ps-button-primary" : "ps-button-secondary"}`}>{action.label}{action.primary ? <ArrowRight size={16}/> : null}</Link>)}</div> : null}</div>{children ? <div className="ps-archive-hero-aside">{children}</div> : media && (media.desktop || media.mobile) ? <div className="ps-archive-hero-aside ps-archive-hero-media"><ResponsiveHeroImage desktop={media.desktop} mobile={media.mobile} alt={media.alt} desktopPosition={media.desktopPosition} mobilePosition={media.mobilePosition} overlay={media.overlay} sizes="(max-width: 860px) 100vw, 38vw" /></div> : null}</PublicContainer></section>;
}

export function EmptyArchiveState({ title, body }: { title: string; body: string }) {
  return <div className="ps-empty-state"><h2>{title}</h2><p>{body}</p></div>;
}
