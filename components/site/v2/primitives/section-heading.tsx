import type { ReactNode } from "react";
import { Eyebrow } from "./eyebrow";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={`ps-section-heading ${align === "center" ? "ps-section-heading-center" : ""} ${className}`.trim()}>
      <div className="min-w-0">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 className="ps-section-title">{title}</h2>
        {description ? <p className="ps-section-description">{description}</p> : null}
      </div>
      {action ? <div className="ps-section-action">{action}</div> : null}
    </div>
  );
}
