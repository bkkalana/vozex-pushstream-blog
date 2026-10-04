/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { ImageIcon, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Media = { id:string; title:string|null; filename:string; path:string; altText?:string|null };

export function SectionMediaPicker({name="imageId",items,value}:{name?:string;items:Media[];value?:string|null}){
  const [selected,setSelected]=useState(value??"");
  const [open,setOpen]=useState(false);
  const [query,setQuery]=useState("");
  const current=items.find(x=>x.id===selected)??null;
  const visible=useMemo(()=>{const q=query.trim().toLowerCase();return items.filter(x=>!q||`${x.title??""} ${x.filename}`.toLowerCase().includes(q)).slice(0,120)},[items,query]);
  return <div className="space-y-2">
    <input type="hidden" name={name} value={selected}/>
    {current?<div className="overflow-hidden rounded-xl border bg-slate-50">
      <img src={current.path} alt={current.altText??""} className="aspect-[16/7] w-full object-cover"/>
      <div className="flex items-center justify-between gap-3 p-3"><div className="min-w-0"><div className="truncate text-sm font-semibold">{current.title??current.filename}</div><div className="truncate text-xs text-slate-500">{current.filename}</div></div><div className="flex gap-2"><Button type="button" variant="secondary" onClick={()=>setOpen(true)}>Change</Button><button type="button" onClick={()=>setSelected("")} className="rounded-lg border px-2 text-slate-500" aria-label="Remove image"><X size={16}/></button></div></div>
    </div>:<button type="button" onClick={()=>setOpen(true)} className="flex min-h-24 w-full items-center justify-center gap-2 rounded-xl border border-dashed bg-slate-50 text-sm font-semibold text-slate-600 hover:border-blue-300 hover:bg-blue-50"><ImageIcon size={18}/> Choose from Media Library</button>}
    {open?<div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/50 p-4" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
      <div className="max-h-[88vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-4"><div><h3 className="font-bold">Choose image</h3><p className="text-xs text-slate-500">Select an existing image from the PushStream media library.</p></div><Button type="button" variant="secondary" onClick={()=>setOpen(false)}>Close</Button></div>
        <div className="border-b p-4"><label className="flex items-center gap-2 rounded-xl border px-3"><Search size={17} className="text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search images…" className="min-h-11 flex-1 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"/></label></div>
        <div className="max-h-[64vh] overflow-auto p-4"><div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">{visible.map(m=><button key={m.id} type="button" onClick={()=>{setSelected(m.id);setOpen(false)}} className={`overflow-hidden rounded-xl border text-left transition hover:-translate-y-0.5 hover:shadow-md ${selected===m.id?"ring-2 ring-blue-500":""}`}><img src={m.path} alt={m.altText??""} className="aspect-[4/3] w-full object-cover"/><div className="p-2"><div className="truncate text-xs font-semibold">{m.title??m.filename}</div><div className="truncate text-[10px] text-slate-400">{m.filename}</div></div></button>)}</div>{visible.length===0?<div className="py-12 text-center text-sm text-slate-500">No matching images.</div>:null}</div>
      </div>
    </div>:null}
  </div>
}
