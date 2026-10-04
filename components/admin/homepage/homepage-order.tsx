
"use client";
import { useState,useTransition } from "react";
import { reorderHomepageSections } from "@/app/admin/(protected)/homepage/actions";
export function HomepageOrder({initial}:{initial:{id:string;key:string;heading:string|null;sortOrder:number}[]}){
 const [items,setItems]=useState([...initial].sort((a,b)=>a.sortOrder-b.sortOrder)),[pending,start]=useTransition();
 function move(id:string,target:string){if(id===target)return;setItems(prev=>{const a=[...prev],from=a.findIndex(x=>x.id===id),to=a.findIndex(x=>x.id===target);const [m]=a.splice(from,1);a.splice(to,0,m);return a})}
 return <section className="rounded-2xl border bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Homepage order</h2><p className="text-sm text-[var(--text-muted)]">Drag sections to reorder the public homepage.</p></div><button disabled={pending} onClick={()=>start(()=>reorderHomepageSections(items.map((x,i)=>({id:x.id,sortOrder:i*10+10}))))} className="min-h-11 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-white disabled:opacity-50">{pending?"Saving…":"Save order"}</button></div><div className="mt-4 space-y-2">{items.map(x=><div key={x.id} draggable onDragStart={e=>e.dataTransfer.setData("text/section",x.id)} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();move(e.dataTransfer.getData("text/section"),x.id)}} className="cursor-grab rounded-xl border p-3"><span className="font-semibold">{x.heading||x.key}</span><span className="ml-2 text-xs text-[var(--text-muted)]">{x.key}</span></div>)}</div></section>
}
