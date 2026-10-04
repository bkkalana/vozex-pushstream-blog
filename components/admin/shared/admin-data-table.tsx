"use client";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { Table, TableBody, TableHead } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export type AdminColumn<Row> = { key: string; label: string; render: (row: Row) => ReactNode; sortable?: boolean; className?: string };
export function AdminDataTable<Row extends { id: string }>({ rows, columns, selected, onSelectedChange, bulkActions, emptyTitle="No records found", emptyDescription, sort, buildSortHref }: { rows: Row[]; columns: AdminColumn<Row>[]; selected?: string[]; onSelectedChange?: (ids:string[])=>void; bulkActions?: ReactNode; emptyTitle?: string; emptyDescription?: string; sort?: {key:string;direction:"asc"|"desc"}; buildSortHref?: (key:string,direction:"asc"|"desc")=>string }) {
  const controlled = selected !== undefined; const [internal, setInternal] = useState<string[]>([]); const active = controlled ? selected : internal;
  const setSelected = onSelectedChange ?? setInternal;
  const all = rows.length > 0 && rows.every((row)=>active.includes(row.id));
  const visibleRows = useMemo(() => rows, [rows]);
  if (!rows.length) return <EmptyState title={emptyTitle} description={emptyDescription}/>;
  return <div className="space-y-3">{active.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--background-blue)] px-4 py-3 text-sm"><strong>{active.length} selected</strong><div className="flex items-center gap-2">{bulkActions}<Button type="button" variant="ghost" className="min-h-9 px-3" onClick={()=>setSelected([])}>Clear</Button></div></div>}<Table><TableHead><tr><th className="w-12 px-4 py-3"><input aria-label="Select all rows" type="checkbox" checked={all} onChange={(event)=>setSelected(event.currentTarget.checked?rows.map((row)=>row.id):[])}/></th>{columns.map((column)=>{ const nextDirection=sort?.key===column.key&&sort.direction==="asc"?"desc":"asc"; const content=<span className="inline-flex items-center gap-1">{column.label}{sort?.key===column.key?(sort.direction==="asc"?<ArrowUp size={13}/>:<ArrowDown size={13}/>):<ChevronsUpDown size={13}/>}</span>; return <th key={column.key} className={`px-4 py-3 ${column.className??""}`}>{column.sortable&&buildSortHref?<Link href={buildSortHref(column.key,nextDirection)}>{content}</Link>:column.sortable?content:column.label}</th>;})}</tr></TableHead><TableBody>{visibleRows.map((row)=><tr key={row.id} className="border-t border-[var(--border)] hover:bg-slate-50/70"><td className="px-4 py-3"><input aria-label={`Select row ${row.id}`} type="checkbox" checked={active.includes(row.id)} onChange={(event)=>setSelected(event.currentTarget.checked?[...active,row.id]:active.filter((id)=>id!==row.id))}/></td>{columns.map((column)=><td key={column.key} className={`px-4 py-3 ${column.className??""}`}>{column.render(row)}</td>)}</tr>)}</TableBody></Table></div>;
}
