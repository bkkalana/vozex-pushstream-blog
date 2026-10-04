"use client";
import { useTransition } from "react";
import { Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { duplicatePageSectionAction, resetPageSectionAction } from "@/app/admin/(protected)/site-pages/[pageKey]/actions";
export function SectionActions({pageKey,sectionId,sectionKey,canReset=true}:{pageKey:string;sectionId:string;sectionKey:string;canReset?:boolean}){
  const [pending,start]=useTransition();
  return <div className="flex flex-wrap gap-2"><button type="button" disabled={pending} onClick={()=>start(async()=>{try{await duplicatePageSectionAction(pageKey,sectionId);toast.success("Section duplicated")}catch(e){toast.error(e instanceof Error?e.message:"Could not duplicate section")}})} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold disabled:opacity-50"><Copy size={14}/> Duplicate</button>{canReset?<button type="button" disabled={pending} onClick={()=>{if(!confirm(`Reset ${sectionKey} to its default structure? Repeatable items in this section will be removed.`))return;start(async()=>{try{await resetPageSectionAction(pageKey,sectionKey);toast.success("Section reset to default")}catch(e){toast.error(e instanceof Error?e.message:"Could not reset section")}})}} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold text-amber-700 disabled:opacity-50"><RotateCcw size={14}/> Reset</button>:null}</div>
}
