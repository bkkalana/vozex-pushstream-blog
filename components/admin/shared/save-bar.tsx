"use client";
import { useEffect, type ReactNode } from "react";
export function DirtyFormGuard({ dirty, children }: { dirty:boolean; children?:ReactNode }) {
  useEffect(()=>{const handler=(event:BeforeUnloadEvent)=>{if(!dirty)return;event.preventDefault();event.returnValue="";};window.addEventListener("beforeunload",handler);return()=>window.removeEventListener("beforeunload",handler);},[dirty]);
  return <>{children}</>;
}
export function SaveBar({ dirty, saving, onSave, onDiscard }: { dirty:boolean; saving:boolean; onSave:()=>void; onDiscard:()=>void }) {
  if(!dirty)return null;
  return <div className="sticky bottom-4 z-20 mt-6 flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-white p-3 shadow-xl"><span className="text-sm font-semibold">You have unsaved changes.</span><div className="flex gap-2"><button type="button" onClick={onDiscard} className="min-h-10 rounded-xl px-4 text-sm font-semibold hover:bg-[var(--background-soft)]">Discard</button><button type="button" disabled={saving} onClick={onSave} className="min-h-10 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving?"Saving…":"Save changes"}</button></div></div>;
}
