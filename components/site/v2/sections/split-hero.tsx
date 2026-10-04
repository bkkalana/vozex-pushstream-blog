import Image from "next/image";
import type { ReactNode } from "react";
import { PublicContainer } from "../primitives/container";
import { Eyebrow } from "../primitives/eyebrow";
import { PrimaryButton, SecondaryButton } from "../primitives/buttons";

type Chip = { label: string; icon?: ReactNode };

export function SplitHero({
  eyebrow,
  title,
  accent,
  description,
  primary,
  secondary,
  image,
  imageAlt,
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
  imageAlt?: string;
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
            {image ? <Image src={image} alt={imageAlt ?? ""} fill priority sizes="(max-width: 900px) 100vw, 50vw" className="object-cover" /> : <div className="ps-hero-image-placeholder" />}
          </div>
          {chips.map((chip, index) => <div key={`${chip.label}-${index}`} className={`ps-hero-chip ps-hero-chip-${(index % 6) + 1}`}>{chip.icon}<span>{chip.label}</span></div>)}
        </div>
      </PublicContainer>
    </section>
  );
}
