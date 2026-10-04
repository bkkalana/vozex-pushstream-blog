import { prisma } from "@/lib/db/prisma";

const DAY=86_400_000;
export type TrendingWeights={last24h:number;days2to7:number;days8to30:number;manualBoost:number};
export const DEFAULT_TRENDING_WEIGHTS:TrendingWeights={last24h:3,days2to7:1.5,days8to30:.5,manualBoost:100};

function dayStart(value:Date){const d=new Date(value);d.setHours(0,0,0,0);return d;}
async function readWeights():Promise<TrendingWeights>{
  const row=await prisma.siteSetting.findUnique({where:{key:"analytics.trendingWeights"},select:{value:true}});
  const v=row?.value as Partial<TrendingWeights>|null;
  return {last24h:Number(v?.last24h)||3,days2to7:Number(v?.days2to7)||1.5,days8to30:Number(v?.days8to30)||.5,manualBoost:Number(v?.manualBoost)||100};
}
function add(target:Map<string,{h24:number;d7:number;d30:number}>,rows:{entityId:string;_sum:{views:number|null}}[],key:"h24"|"d7"|"d30"){
  for(const row of rows){const bucket=target.get(row.entityId)||{h24:0,d7:0,d30:0};bucket[key]+=row._sum.views||0;target.set(row.entityId,bucket)}
}
export async function calculateTrending(limit=12){
  const safeLimit=Math.min(24,Math.max(1,limit));
  const today=dayStart(new Date());const day2=new Date(today.getTime()-1*DAY);const day8=new Date(today.getTime()-7*DAY);const day31=new Date(today.getTime()-30*DAY);
  const [todayRows,weekRows,monthRows,pinned,weights]=await Promise.all([
    prisma.dailyContentStat.groupBy({by:["entityId"],where:{entityType:"POST",date:{gte:today}},_sum:{views:true}}),
    prisma.dailyContentStat.groupBy({by:["entityId"],where:{entityType:"POST",date:{gte:day8,lt:day2}},_sum:{views:true}}),
    prisma.dailyContentStat.groupBy({by:["entityId"],where:{entityType:"POST",date:{gte:day31,lt:day8}},_sum:{views:true}}),
    prisma.post.findMany({where:{status:"PUBLISHED",deletedAt:null,isTrending:true,publishedAt:{lte:new Date()}},select:{id:true},take:100}),
    readWeights(),
  ]);
  const buckets=new Map<string,{h24:number;d7:number;d30:number}>();add(buckets,todayRows,"h24");add(buckets,weekRows,"d7");add(buckets,monthRows,"d30");
  const ids=new Set<string>([...buckets.keys(),...pinned.map(p=>p.id)]);if(!ids.size)return [];
  const posts=await prisma.post.findMany({where:{id:{in:[...ids]},status:"PUBLISHED",deletedAt:null,publishedAt:{lte:new Date()}},select:{id:true,title:true,slug:true,isTrending:true,publishedAt:true,category:{select:{name:true}}}});
  return posts.map(p=>{const b=buckets.get(p.id)||{h24:0,d7:0,d30:0};const score=b.h24*weights.last24h+b.d7*weights.days2to7+b.d30*weights.days8to30+(p.isTrending?weights.manualBoost:0);return {...p,score,...b}}).sort((a,b)=>b.score-a.score || Number(b.publishedAt)-Number(a.publishedAt)).slice(0,safeLimit);
}
export async function saveTrendingWeights(input:TrendingWeights){return prisma.siteSetting.upsert({where:{key:"analytics.trendingWeights"},create:{key:"analytics.trendingWeights",group:"analytics",value:input},update:{value:input}})}
export {readWeights};
