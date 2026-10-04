import Link from "next/link";
import { ExternalLink, LayoutTemplate } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { PUBLIC_PAGE_DEFINITIONS } from "@/lib/site/page-section-registry";
import { prisma } from "@/lib/db/prisma";
import { AdminPageHeader } from "@/components/admin/shared/page-header";

export default async function SitePagesAdmin(){
  await requirePermission("sitePages.view");
  const rows=await prisma.publicPageSection.findMany({select:{pageKey:true,enabled:true,updatedAt:true},orderBy:{updatedAt:"desc"}}).catch(()=>[]);
  const summary=new Map<string,{count:number;enabled:number;updatedAt:Date|null}>();
  for(const row of rows){const current=summary.get(row.pageKey)??{count:0,enabled:0,updatedAt:null};current.count+=1;if(row.enabled)current.enabled+=1;if(!current.updatedAt||row.updatedAt>current.updatedAt)current.updatedAt=row.updatedAt;summary.set(row.pageKey,current)}
  return <div className="space-y-6">
    <AdminPageHeader eyebrow="Frontend" title="Site Pages" description="Manage screenshot-style public pages, section visibility, content sources, images and reusable section items without editing source code."/>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{PUBLIC_PAGE_DEFINITIONS.map(page=>{const stats=summary.get(page.key)??{count:0,enabled:0,updatedAt:null};return <article key={page.key} className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><LayoutTemplate size={20}/></div><div className="flex-1"><div className="flex items-start justify-between gap-3"><h2 className="text-lg font-bold">{page.label}</h2><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${stats.count?"bg-emerald-50 text-emerald-700":"bg-amber-50 text-amber-700"}`}>{stats.count?"Configured":"Needs setup"}</span></div><p className="mt-1 text-sm text-slate-500">{page.description}</p></div></div>
      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center"><div><strong className="block text-sm">{stats.count}</strong><span className="text-[10px] text-slate-500">Sections</span></div><div><strong className="block text-sm">{stats.enabled}</strong><span className="text-[10px] text-slate-500">Visible</span></div><div><strong className="block truncate text-xs">{stats.updatedAt?stats.updatedAt.toLocaleDateString():"—"}</strong><span className="text-[10px] text-slate-500">Updated</span></div></div>
      <div className="mt-5 flex gap-2"><Link href={`/admin/site-pages/${page.key}`} className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white">Manage sections</Link><Link href={page.href} target="_blank" className="inline-flex items-center gap-1 rounded-xl border px-4 py-2 text-sm font-semibold">Preview <ExternalLink size={14}/></Link></div>
    </article>})}</div>
  </div>
}
