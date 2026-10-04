import type { ReactNode } from "react";
import { IconTile } from "../primitives/icon-tile";
export function FeatureCard({ icon, title, description, tone = "blue" }: { icon: ReactNode; title: string; description: string; tone?: "blue" | "violet" | "green" | "orange" | "red" | "yellow" }) {
  return <div className="ps-card ps-feature-card"><IconTile tone={tone}>{icon}</IconTile><div><h3>{title}</h3><p>{description}</p></div></div>;
}
