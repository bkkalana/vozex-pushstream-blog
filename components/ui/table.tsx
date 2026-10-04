import type { HTMLAttributes, TableHTMLAttributes } from "react";
export function Table(props: TableHTMLAttributes<HTMLTableElement>) { return <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-white" role="region" aria-label="Scrollable data table" tabIndex={0}><table className="w-full border-collapse text-left text-sm" {...props}/></div>; }
export function TableHead(props: HTMLAttributes<HTMLTableSectionElement>) { return <thead className="bg-[var(--background-soft)] text-xs uppercase tracking-wide text-[var(--text-muted)]" {...props}/>; }
export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) { return <tbody {...props}/>; }
