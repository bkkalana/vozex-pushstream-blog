"use client";
import {useMemo,useState} from "react";

type Option={id:string;label:string;type:string};
export function ManualItemPicker({name="manualSelection",options,initial=[]}:{name?:string;options:Option[];initial?:string[]}){
  const [query,setQuery]=useState("");const [selected,setSelected]=useState<string[]>(()=>[...new Set(initial)]);
  const visible=useMemo(()=>{const q=query.trim().toLowerCase();return options.filter(x=>!q||`${x.label} ${x.type}`.toLowerCase().includes(q)).slice(0,40)},[query,options]);
  const selectedOptions=selected.map(id=>options.find(x=>x.id===id)).filter(Boolean) as Option[];
  function toggle(id:string){setSelected(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id].slice(0,50))}
  return <div className="space-y-2"><input type="hidden" name={name} value={selected.join(",")}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search posts, tools, reviews, authors or categories…" className="min-h-11 w-full rounded-xl border px-3 font-normal"/><div className="max-h-48 overflow-auto rounded-xl border bg-slate-50 p-2"><div className="grid gap-1">{visible.map(x=><label key={`${x.type}-${x.id}`} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-white"><input type="checkbox" checked={selected.includes(x.id)} onChange={()=>toggle(x.id)}/><span className="min-w-0 flex-1 truncate">{x.label}</span><span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">{x.type}</span></label>)}{visible.length===0&&<div className="px-2 py-4 text-center text-sm text-slate-500">No matching items</div>}</div></div>{selectedOptions.length>0&&<div className="flex flex-wrap gap-1.5">{selectedOptions.map(x=><button type="button" key={x.id} onClick={()=>toggle(x.id)} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{x.label} ×</button>)}</div>}</div>
}
