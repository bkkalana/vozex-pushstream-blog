"use client";
import { useState, useTransition } from "react";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import { reorderPageSectionItemsAction } from "@/app/admin/(protected)/site-pages/[pageKey]/actions";

type Item={id:string;title:string|null;subtitle:string|null;url:string|null;body:string|null};
export function ItemOrderEditor({pageKey,sectionId,initial}:{pageKey:string;sectionId:string;initial:Item[]}){
  const [items,setItems]=useState(initial),[drag,setDrag]=useState<string|null>(null),[pending,start]=useTransition();
  function drop(target:string){if(!drag||drag===target)return;const next=[...items],from=next.findIndex(x=>x.id===drag),to=next.findIndex(x=>x.id===target);const [m]=next.splice(from,1);next.splice(to,0,m);setItems(next);setDrag(null);start(async()=>{try{await reorderPageSectionItemsAction(pageKey,sectionId,next.map(x=>x.id));toast.success("Item order saved")}catch{toast.error("Could not save item order")}})}
  if(!items.length)return null;
  return <div className="mb-4 grid gap-2">{items.map((item,index)=><button key={item.id} type="button" draggable onDragStart={()=>setDrag(item.id)} onDragOver={e=>e.preventDefault()} onDrop={()=>drop(item.id)} className="flex min-h-12 items-center gap-3 rounded-xl border bg-slate-50 px-3 text-left"><GripVertical size={16} className="shrink-0 text-slate-400"/><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-[10px] font-bold text-slate-500">{index+1}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{item.title??"Untitled item"}</span><span className="block truncate text-xs text-slate-500">{item.subtitle??item.url??item.body??""}</span></span>{pending?<span className="text-[10px] text-blue-600">Saving…</span>:null}</button>)}</div>
}
