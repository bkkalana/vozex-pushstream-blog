"use client";
import { useFormStatus } from "react-dom";
export function SectionSaveButton(){const {pending}=useFormStatus();return <button disabled={pending} className="min-h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-50">{pending?"Saving…":"Save section"}</button>}
export function ItemSaveButton({label="Save item"}:{label?:string}){const {pending}=useFormStatus();return <button disabled={pending} className="min-h-9 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white disabled:opacity-50">{pending?"Saving…":label}</button>}
