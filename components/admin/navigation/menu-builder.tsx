
"use client";
import { useMemo, useState, useTransition } from "react";
import { saveMenuStructure } from "@/app/admin/(protected)/navigation/actions";

export type MenuNode={
  id:string;label:string;url:string;parentId:string|null;sortOrder:number;enabled:boolean;
  external:boolean;openInNewTab:boolean;nofollow:boolean;sponsored:boolean;cssIdentifier:string|null;itemType:string|null;referenceId:string|null;
};

export function MenuBuilder({menuKey,initial}:{menuKey:string;initial:MenuNode[]}) {
  const [items,setItems]=useState([...initial].sort((a,b)=>a.sortOrder-b.sortOrder));
  const [pending,start]=useTransition();
  const roots=useMemo(()=>items.filter(x=>!x.parentId),[items]);
  function move(id:string,targetId:string,mode:"before"|"after"|"inside"){
    if(id===targetId)return;
    setItems(prev=>{
      const moving=prev.find(x=>x.id===id),target=prev.find(x=>x.id===targetId); if(!moving||!target)return prev;
      let next=prev.filter(x=>x.id!==id);
      const parentId=mode==="inside"?target.id:target.parentId;
      moving.parentId=parentId;
      const siblingIds=next.filter(x=>x.parentId===parentId).map(x=>x.id);
      let idx=siblingIds.indexOf(target.id);
      if(mode==="after")idx++;
      if(mode==="inside")idx=siblingIds.length;
      const orderedSiblingIds=[...siblingIds]; orderedSiblingIds.splice(Math.max(0,idx),0,id);
      const rank=new Map(orderedSiblingIds.map((x,i)=>[x,i]));
      next=[...next,moving].map(x=>x.parentId===parentId?{...x,sortOrder:rank.get(x.id)??x.sortOrder}:x);
      return next.sort((a,b)=>a.parentId===b.parentId?a.sortOrder-b.sortOrder:a.sortOrder-b.sortOrder);
    });
  }
  function save(){start(async()=>{await saveMenuStructure(menuKey,items.map(({id,parentId,sortOrder})=>({id,parentId,sortOrder})))})}
  return <section className="rounded-2xl border bg-white p-5">
    <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold capitalize">{menuKey} menu</h2><p className="text-xs text-[var(--text-muted)]">Drag onto the left/center/right thirds of another item for before / nested / after placement.</p></div><button disabled={pending} onClick={save} className="min-h-11 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-white disabled:opacity-50">{pending?"Saving…":"Save order"}</button></div>
    <div className="mt-4 space-y-2">{items.length?items.map(item=>{
      const depth=item.parentId?1:0;
      return <div key={item.id} draggable onDragStart={e=>e.dataTransfer.setData("text/menu-id",item.id)}
        onDragOver={e=>e.preventDefault()}
        onDrop={e=>{e.preventDefault();const id=e.dataTransfer.getData("text/menu-id");const r=e.currentTarget.getBoundingClientRect();const x=e.clientX-r.left;move(id,item.id,x<r.width*.28?"before":x>r.width*.72?"after":"inside")}}
        style={{marginLeft:depth*24}}
        className="cursor-grab rounded-xl border p-3 active:cursor-grabbing">
        <div className="flex items-center justify-between gap-3"><div className="min-w-0"><div className="font-semibold">{depth?"↳ ":""}{item.label}</div><div className="truncate text-xs text-[var(--text-muted)]">{item.url}</div></div><div className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">{item.openInNewTab?"new tab · ":""}{item.nofollow?"nofollow · ":""}{item.sponsored?"sponsored":""}</div></div>
      </div>
    }):<p className="text-sm text-[var(--text-muted)]">No items yet.</p>}</div>
  </section>
}
