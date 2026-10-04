import type { ReactNode } from "react";
export function SidebarCard({ title, action, children, className = "" }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`ps-card ps-sidebar-card ${className}`.trim()}>{title || action ? <div className="ps-sidebar-head">{title ? <h2>{title}</h2> : <span/>}{action}</div> : null}<div className="ps-sidebar-body">{children}</div></section>;
}
