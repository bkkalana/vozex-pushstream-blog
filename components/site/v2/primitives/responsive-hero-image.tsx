import { getImageProps } from "next/image";
import type { ReactNode } from "react";

type Media = { path: string; altText?: string | null } | null | undefined;
type Position = "center" | "top" | "bottom" | "left" | "right";

/**
 * Renders one responsive image request for the hero.
 *
 * Using two separately prioritized image elements for desktop/mobile can emit two high-priority
 * candidates and make the browser compete for bandwidth during LCP. A <picture>
 * lets the browser select the correct optimized source before downloading it.
 */
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
  const accessibleAlt = alt || primary.altText || "";
  const desktopImage = getImageProps({
    src: primary.path,
    alt: accessibleAlt,
    fill: true,
    sizes,
    quality: 82,
  }).props;
  const mobileImage = mobile
    ? getImageProps({
        src: mobile.path,
        alt: alt || mobile.altText || accessibleAlt,
        fill: true,
        sizes: "100vw",
        quality: 80,
      }).props
    : null;

  return <>
    <picture>
      {mobileImage ? <source media="(max-width: 767px)" srcSet={mobileImage.srcSet} sizes="100vw" /> : null}
      <img
        {...desktopImage}
        alt={accessibleAlt}
        fetchPriority="high"
        loading="eager"
        className="object-cover ps-hero-media-picture"
        style={{ ...desktopImage.style, objectPosition: desktopPosition }}
      />
    </picture>
    {mobileImage ? <style>{`@media (max-width:767px){.ps-hero-media-picture{object-position:${mobileImagePosition}!important}}`}</style> : null}
    {safeOverlay > 0 ? <span className="ps-hero-media-overlay" style={{ backgroundColor: `rgba(0,0,0,${safeOverlay / 100})` }} aria-hidden="true" /> : null}
  </>;
}
