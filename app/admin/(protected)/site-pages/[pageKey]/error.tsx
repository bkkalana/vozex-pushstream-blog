"use client";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function SitePageEditorError({error,reset}:{error:Error & {digest?:string};reset:()=>void}){
  return <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600"><AlertTriangle size={20}/></div><div><h2 className="text-lg font-bold text-slate-950">Could not complete that page edit</h2><p className="mt-1 text-sm text-slate-600">{error.message || "The section data could not be saved. Check the fields and try again."}</p><p className="mt-2 text-xs text-slate-400">Your published page data is not automatically reset when this editor error appears.</p><Button className="mt-4" type="button" onClick={reset}>Try again</Button></div></div></div>
}
