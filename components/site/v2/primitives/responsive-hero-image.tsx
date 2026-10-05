import Image from "next/image";
import type { ReactNode } from "react";

type Media = { path: string; altText?: string | null } | null | undefined;
type Position = "center" | "top" | "bottom" | "left" | "right";

export function ResponsiveHeroImage({
  desktop,
  mobile,
  alt,
  desktopPosition = "center",
  mobilePosition = "center",
  overlay = 0,
  sizes = "(max-width: 900px) 100vw, 50vw",
  fallback,
}: {
  desktop?: Media;
  mobile?: Media;
  alt?: string;
  desktopPosition?: Position;
  mobilePosition?: Position;
  overlay?: number;
  sizes?: string;
  fallback?: ReactNode;
}) {
  const primary = desktop || mobile;
  if (!primary) return <>{fallback ?? null}</>;
  const safeOverlay = Math.min(80, Math.max(0, overlay));
  return <>
    <Image
      src={primary.path}
      alt={alt || primary.altText || ""}
      fill
      priority
      sizes={sizes}
      className={`object-cover ${mobile ? "ps-hero-media-desktop ps-hero-media-has-mobile" : "ps-hero-media-desktop"}`}
      style={{ objectPosition: desktopPosition }}
    />
    {mobile ? <Image
      src={mobile.path}
      alt={alt || mobile.altText || ""}
      fill
      priority
      sizes="100vw"
      className="object-cover ps-hero-media-mobile"
      style={{ objectPosition: mobilePosition }}
    /> : null}
    {safeOverlay > 0 ? <span className="ps-hero-media-overlay" style={{ backgroundColor: `rgba(0,0,0,${safeOverlay / 100})` }} aria-hidden="true" /> : null}
  </>;
}
