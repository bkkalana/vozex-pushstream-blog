import type { ReactNode } from "react";

const tones = {
  blue: "ps-icon-blue",
  violet: "ps-icon-violet",
  green: "ps-icon-green",
  orange: "ps-icon-orange",
  red: "ps-icon-red",
  yellow: "ps-icon-yellow",
} as const;

export function IconTile({ children, tone = "blue", className = "" }: { children: ReactNode; tone?: keyof typeof tones; className?: string }) {
  return <span className={`ps-icon-tile ${tones[tone]} ${className}`.trim()} aria-hidden="true">{children}</span>;
}
