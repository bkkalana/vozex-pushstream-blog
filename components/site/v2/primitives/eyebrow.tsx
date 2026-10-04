import type { ReactNode } from "react";

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`ps-eyebrow ${className}`.trim()}>{children}</span>;
}
