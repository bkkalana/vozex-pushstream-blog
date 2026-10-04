import { prisma } from "@/lib/db/prisma";
const DAY=86_400_000;
function dayStart(d:Date){const x=new Date(d);x.setUTCHours(0,0,0,0);return x}
function dayEnd(d:Date){return new Date(dayStart(d).getTime()+DAY)}
export async function aggregateDay(input?:Date){const date=dayStart(input??new Date(Date.now()-DAY));const end=dayEnd(date);
 const views=await prisma.postView.groupBy({by:["postId"],where:{viewedAt:{gte:date,lt:end}},_count:{_all:true}});
 const affiliates=await prisma.affiliateClick.groupBy({by:["sourcePostId"],where:{createdAt:{gte:date,lt:end},sourcePostId:{not:null}},_count:{_all:true}});
 const clicked=await prisma.searchLog.findMany({where:{clickedAt:{gte:date,lt:end},clickedType:"post",clickedResult:{not:null}},select:{clickedResult:true}});
 const slugs=[...new Set(clicked.map(x=>x.clickedResult?.match(/^\/article\/([^/?#]+)/)?.[1]).filter(Boolean) as string[])];
 const posts=slugs.length?await prisma.post.findMany({where:{slug:{in:slugs}},select:{id:true,slug:true}}):[];const bySlug=new Map(posts.map(p=>[p.slug,p.id]));const search=new Map<string,number>();for(const row of clicked){const slug=row.clickedResult?.match(/^\/article\/([^/?#]+)/)?.[1];const id=slug?bySlug.get(slug):undefined;if(id)search.set(id,(search.get(id)||0)+1)}
 const ids=new Set<string>([...views.map(x=>x.postId),...affiliates.map(x=>x.sourcePostId!).filter(Boolean),...search.keys()]);
 await prisma.$transaction([...ids].map(id=>{const v=views.find(x=>x.postId===id)?._count._all||0;const a=affiliates.find(x=>x.sourcePostId===id)?._count._all||0;const sc=search.get(id)||0;return prisma.dailyContentStat.upsert({where:{entityType_entityId_date:{entityType:"POST",entityId:id,date}},create:{entityType:"POST",entityId:id,date,views:v,affiliateClicks:a,searchClicks:sc,clicks:a+sc},update:{views:v,affiliateClicks:a,searchClicks:sc,clicks:a+sc}})}));
 return {date:date.toISOString().slice(0,10),entities:ids.size};}
