import type { ReactNode } from "react";
export function AdminPageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-end"><div className="min-w-0">{eyebrow && <p className="text-xs font-bold uppercase tracking-[0.13em] text-[var(--primary)]">{eyebrow}</p>}<h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>{description && <p className="mt-2 max-w-3xl text-sm text-[var(--text-secondary)] sm:text-base">{description}</p>}</div>{actions && <div className="flex flex-wrap gap-2">{actions}</div>}</div>;
}
