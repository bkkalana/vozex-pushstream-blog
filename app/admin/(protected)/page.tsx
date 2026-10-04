import { Bot, CalendarClock, FileText, Mail, MessageSquare, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/shared/page-header";
import { requireAdminPageSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { analyticsService } from "@/services/analytics/analytics.service";
import { calculateTrending } from "@/services/analytics/trending.service";

export default async function AdminPage(){
  const session=await requireAdminPageSession();
  const [published,drafts,scheduled,subscribers,tools,messages,traffic,trending,activity]=await Promise.all([
    prisma.post.count({where:{status:"PUBLISHED",deletedAt:null}}),
    prisma.post.count({where:{status:"DRAFT",deletedAt:null}}),
    prisma.post.count({where:{status:"SCHEDULED",deletedAt:null}}),
    prisma.newsletterSubscriber.count({where:{status:"ACTIVE"}}),
    prisma.aiTool.count({where:{status:"PUBLISHED",deletedAt:null}}),
    prisma.contactMessage.count({where:{status:"NEW"}}),
    analyticsService.overview(30),
    calculateTrending(5),
    prisma.activityLog.findMany({include:{user:{select:{name:true,email:true}}},orderBy:{createdAt:"desc"},take:8}),
  ]);
  const cards=[["Published Articles",published,FileText],["Draft Articles",drafts,FileText],["Scheduled Articles",scheduled,CalendarClock],["Views · 30 days",traffic.totalViews,TrendingUp],["Subscribers",subscribers,Mail],["AI Tools",tools,Bot],["New Messages",messages,MessageSquare]] as const;
  const max=Math.max(1,...traffic.series.map(x=>x.views));
  return <div>
    <AdminPageHeader eyebrow="Workspace" title={`Welcome back, ${session.user.name}`} description="Live publishing, audience and engagement overview."/>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label,value,Icon])=><Card key={label} className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm text-[var(--text-muted)]">{label}</p><strong className="mt-2 block text-2xl">{value}</strong></div><span className="grid size-10 place-items-center rounded-xl bg-[var(--background-blue)] text-[var(--primary)]"><Icon size={19}/></span></div></Card>)}</div>
    <div className="mt-6 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <Card className="p-5"><h2 className="font-bold">Views · last 30 days</h2><div className="mt-8 flex h-52 items-end gap-1">{traffic.series.map(x=><div key={x.date} title={`${x.date}: ${x.views}`} className="min-w-1 flex-1 rounded-t bg-[var(--primary)]" style={{height:`${Math.max(2,x.views/max*100)}%`}}/>)}</div></Card>
      <Card className="p-5"><h2 className="font-bold">Trending now</h2><div className="mt-4 space-y-3">{trending.map((x,i)=><div key={x.id} className="flex gap-3 border-b pb-3"><span className="font-extrabold text-[var(--primary)]">{i+1}</span><div><p className="text-sm font-semibold">{x.title}</p><p className="text-xs text-[var(--text-muted)]">Score {x.score.toFixed(1)}</p></div></div>)}</div><p className="mt-4 text-xs text-[var(--text-muted)]">Roles: {session.user.roles.join(", ")}</p></Card>
    </div>
    <Card className="mt-6 p-5"><div className="flex items-center justify-between"><h2 className="font-bold">Recent activity</h2><a href="/admin/activity" className="text-sm font-semibold text-[var(--primary)]">View all</a></div><div className="mt-4 divide-y">{activity.map(x=><div key={x.id} className="py-3"><div className="text-sm font-semibold">{x.summary}</div><div className="mt-1 text-xs text-[var(--text-muted)]">{x.user?.email||"System"} · {x.createdAt.toLocaleString()}</div></div>)}</div></Card>
  </div>
}
