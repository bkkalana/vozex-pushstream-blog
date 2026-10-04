"use client";
import {useState,useTransition} from "react";
import {GripVertical} from "lucide-react";
import {toast} from "sonner";
import {reorderPageSectionsAction} from "@/app/admin/(protected)/site-pages/[pageKey]/actions";
export function SectionOrder({pageKey,initial}:{pageKey:string;initial:{id:string;label:string;type:string}[]}){
  const [items,setItems]=useState(initial),[drag,setDrag]=useState<string|null>(null),[pending,start]=useTransition();
  function drop(target:string){if(!drag||drag===target)return;const before=[...items];const next=[...items],from=next.findIndex(x=>x.id===drag),to=next.findIndex(x=>x.id===target);const [m]=next.splice(from,1);next.splice(to,0,m);setItems(next);setDrag(null);start(async()=>{try{await reorderPageSectionsAction(pageKey,next.map(x=>x.id));toast.success("Section order saved")}catch{setItems(before);toast.error("Could not save section order")}})}
  return <div className="rounded-2xl border bg-white p-4"><div className="mb-3 flex items-center justify-between"><div><h2 className="font-bold">Section order</h2><p className="text-xs text-slate-500">Drag sections to control the public-page order.</p></div>{pending&&<span className="text-xs text-blue-600">Saving…</span>}</div><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{items.map((x,index)=><button type="button" draggable key={x.id} onDragStart={()=>setDrag(x.id)} onDragOver={e=>e.preventDefault()} onDrop={()=>drop(x.id)} className="flex min-h-12 items-center gap-2 rounded-xl border bg-slate-50 px-3 text-left text-sm transition hover:border-blue-200 hover:bg-blue-50"><GripVertical className="h-4 w-4 text-slate-400"/><span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[10px] font-bold text-slate-500">{index+1}</span><span className="font-semibold">{x.label}</span><span className="ml-auto text-xs text-slate-400">{x.type.replaceAll("_"," ")}</span></button>)}</div></div>
}
