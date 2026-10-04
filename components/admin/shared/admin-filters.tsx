"use client";
import { useState, type ReactNode } from "react";
import { Filter, Search } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export function AdminFilters({ searchName="q", defaultSearch="", children, onReset }: { searchName?:string; defaultSearch?:string; children?:ReactNode; onReset?:()=>void }) {
  const [open,setOpen]=useState(false);
  const filters=<div className="space-y-4">{children}<Button type="button" variant="ghost" className="w-full" onClick={onReset}>Reset filters</Button></div>;
  return <div className="mb-5 flex flex-wrap items-center gap-3"><label className="relative min-w-0 flex-1 md:max-w-md"><span className="sr-only">Search</span><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"/><Input name={searchName} defaultValue={defaultSearch} placeholder="Search…" className="pl-10"/></label><div className="hidden items-center gap-3 md:flex">{children}</div><Button type="button" variant="secondary" className="md:hidden" onClick={()=>setOpen(true)}><Filter size={17}/>Filters</Button><Sheet open={open} title="Filters" onClose={()=>setOpen(false)}>{filters}</Sheet></div>;
}
