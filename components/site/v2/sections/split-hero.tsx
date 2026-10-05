import type { ReactNode } from "react";
import { PublicContainer } from "../primitives/container";
import { Eyebrow } from "../primitives/eyebrow";
import { PrimaryButton, SecondaryButton } from "../primitives/buttons";
import { ResponsiveHeroImage } from "../primitives/responsive-hero-image";

type Chip = { label: string; icon?: ReactNode };

export function SplitHero({
  eyebrow,
  title,
  accent,
  description,
  primary,
  secondary,
  image,
  mobileImage,
  imageAlt,
  imagePosition = "center",
  mobileImagePosition = "center",
  overlay = 0,
  chips = [],
  children,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  description: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  image?: string | null;
  mobileImage?: string | null;
  imageAlt?: string;
  imagePosition?: "center" | "top" | "bottom" | "left" | "right";
  mobileImagePosition?: "center" | "top" | "bottom" | "left" | "right";
  overlay?: number;
  chips?: Chip[];
  children?: ReactNode;
}) {
  return (
    <section className="ps-hero">
      <PublicContainer className="ps-hero-grid">
        <div className="ps-hero-copy">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h1>{title}{accent ? <> <span>{accent}</span></> : null}</h1>
          <p>{description}</p>
          {(primary || secondary) ? <div className="ps-hero-actions">{primary ? <PrimaryButton href={primary.href} arrow>{primary.label}</PrimaryButton> : null}{secondary ? <SecondaryButton href={secondary.href}>{secondary.label}</SecondaryButton> : null}</div> : null}
          {children}
        </div>
        <div className="ps-hero-visual">
          <div className="ps-hero-image">
            <ResponsiveHeroImage desktop={image ? { path: image } : null} mobile={mobileImage ? { path: mobileImage } : null} alt={imageAlt} desktopPosition={imagePosition} mobilePosition={mobileImagePosition} overlay={overlay} fallback={<div className="ps-hero-image-placeholder" />} />
          </div>
          {chips.map((chip, index) => <div key={`${chip.label}-${index}`} className={`ps-hero-chip ps-hero-chip-${(index % 6) + 1}`}>{chip.icon}<span>{chip.label}</span></div>)}
        </div>
      </PublicContainer>
    </section>
  );
}
