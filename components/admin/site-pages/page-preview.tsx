"use client";
import { useState } from "react";
import { ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react";

type Device="desktop"|"tablet"|"mobile";
const widths:Record<Device,string>={desktop:"100%",tablet:"768px",mobile:"390px"};
export function PagePreview({href}:{href:string}){
  const [device,setDevice]=useState<Device>("desktop");
  return <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3"><div><h2 className="font-bold">Live page preview</h2><p className="text-xs text-slate-500">Preview current saved content. Unsaved form changes are not shown until saved.</p></div><div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">{([['desktop',Monitor],['tablet',Tablet],['mobile',Smartphone]] as const).map(([key,Icon])=><button key={key} type="button" onClick={()=>setDevice(key)} className={`grid h-9 w-10 place-items-center rounded-lg ${device===key?"bg-white text-blue-600 shadow-sm":"text-slate-500"}`} title={key}><Icon size={17}/></button>)}<a href={href} target="_blank" rel="noreferrer" className="grid h-9 w-10 place-items-center rounded-lg text-slate-500 hover:bg-white" title="Open in new tab"><ExternalLink size={17}/></a></div></div>
    <div className="overflow-auto bg-slate-100 p-4"><div className="mx-auto overflow-hidden rounded-xl border bg-white shadow" style={{width:widths[device],maxWidth:"100%"}}><iframe title="Public page preview" src={href} className="h-[650px] w-full bg-white"/></div></div>
  </section>
}
