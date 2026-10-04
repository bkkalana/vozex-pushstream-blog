import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors/app-error";
import { assertOwnerOrPermission, type CurrentSession } from "@/lib/auth/session";
import { getSettingsMap } from "@/services/system/settings.service";
import { aiGenerateSchema, type AiAction } from "@/lib/validation/ai";
import { AI_EDITORIAL_SYSTEM, buildAiPrompt } from "./prompts";
import { getAiProvider, providerConfigurationStatus, type AiProviderId } from "./provider";
import { auditService } from "@/services/audit/audit.service";

function todayUtc(){const d=new Date();return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));}
function n(v:unknown,d:number){const x=Number(v);return Number.isFinite(x)?x:d}
function b(v:unknown,d:boolean){return typeof v === "boolean" ? v : d}
function featureFor(action:AiAction){
 if(["rewrite","simplify","grammar","clarity","expand","shorten","summary","social"].includes(action))return "rewrite";
 if(["title_suggestions","seo_title","meta_description","excerpt","alt_text","comparison_criteria","related_articles"].includes(action))return "metadata";
 if(["outline","headings"].includes(action))return "outline";
 if(action==="faq")return "faq";
 return "links";
}

export async function getAiConfig(){
 const s=await getSettingsMap();
 return {
  enabled:b(s.get("ai.enabled"),false), provider:String(s.get("ai.provider")||"OPENAI") as AiProviderId,
  model:String(s.get("ai.model")||"gpt-5.6-luna"), maxTokens:n(s.get("ai.maxTokens"),1800),
  dailyLimit:n(s.get("ai.dailyLimit"),500), perUserDailyLimit:n(s.get("ai.perUserDailyLimit"),75),
  features:{rewrite:b(s.get("ai.feature.rewrite"),true),metadata:b(s.get("ai.feature.metadata"),true),outline:b(s.get("ai.feature.outline"),true),faq:b(s.get("ai.feature.faq"),true),links:b(s.get("ai.feature.links"),true)},
  providerConfigured:providerConfigurationStatus(),
 };
}

async function assertPostAccess(postId:string|undefined,session:CurrentSession){if(!postId)return;const post=await prisma.post.findUnique({where:{id:postId},select:{authorId:true,deletedAt:true}});if(!post||post.deletedAt)throw new AppError("NOT_FOUND","Post not found.",404);assertOwnerOrPermission(session,post.authorId,"posts.edit");}

export const aiService={
 async generate(raw:unknown, session:CurrentSession){
  const input=aiGenerateSchema.parse(raw);await assertPostAccess(input.postId,session);
  const cfg=await getAiConfig();if(!cfg.enabled)throw new AppError("AI_DISABLED","AI assistance is disabled by an administrator.",403);
  const feature=featureFor(input.action);if(!cfg.features[feature])throw new AppError("AI_FEATURE_DISABLED",`AI ${feature} assistance is disabled.`,403);
  const provider=getAiProvider(cfg.provider);if(!provider.configured())throw new AppError("AI_PROVIDER_UNAVAILABLE",`${cfg.provider} credentials are not configured on the server.`,503);
  const date=todayUtc();
  const [userUsage,global]=await Promise.all([
   prisma.aiUsageDaily.findUnique({where:{userId_date_provider:{userId:session.user.id,date,provider:cfg.provider as any}}}),
   prisma.aiUsageDaily.aggregate({where:{date},_sum:{requestCount:true}}),
  ]);
  if((userUsage?.requestCount||0)>=cfg.perUserDailyLimit)throw new AppError("AI_USER_LIMIT","Your daily AI usage limit has been reached.",429);
  if((global._sum.requestCount||0)>=cfg.dailyLimit)throw new AppError("AI_DAILY_LIMIT","The site's daily AI usage limit has been reached.",429);
  let enrichedContext=input.context;
  if(input.postId && ["internal_links","related_articles"].includes(input.action)){
   const current=await prisma.post.findUnique({where:{id:input.postId},select:{categoryId:true,tags:{select:{tagId:true}}}});
   const candidates=await prisma.post.findMany({where:{id:{not:input.postId},status:"PUBLISHED",deletedAt:null,OR:[...(current?.categoryId?[{categoryId:current.categoryId}]:[]),...(current?.tags.length?[{tags:{some:{tagId:{in:current.tags.map(t=>t.tagId)}}}}]:[])]},take:12,orderBy:{publishedAt:"desc"},select:{title:true,slug:true,category:{select:{name:true}}}});
   if(candidates.length)enrichedContext+=`\n\n<verified_internal_candidates>\n${candidates.map(c=>`- ${c.title} | /article/${c.slug} | ${c.category?.name||"Uncategorized"}`).join("\n")}\n</verified_internal_candidates>`;
  }
  const prompt=buildAiPrompt(input.action,enrichedContext,input.instruction);
  const method=input.action==="summary"?"summarize":input.action==="rewrite"?"rewrite":["seo_title","meta_description","excerpt","alt_text"].includes(input.action)?"generateMetadata":input.action==="faq"?"generateFaq":input.action==="outline"?"generateOutline":"generateText";
  const result=await provider[method]({model:cfg.model,system:AI_EDITORIAL_SYSTEM,prompt,maxTokens:cfg.maxTokens});
  const summary=`${input.action}; context=${input.context.length} chars${input.instruction?`; instruction=${input.instruction.slice(0,120)}`:""}`.slice(0,500);
  const activity=await prisma.$transaction(async tx=>{
   const row=await tx.aiActivity.create({data:{userId:session.user.id,postId:input.postId,actionType:input.action,promptSummary:summary,provider:cfg.provider as any,model:cfg.model,inputChars:input.context.length,outputChars:result.text.length,outputTokens:result.outputTokens}});
   await tx.aiUsageDaily.upsert({where:{userId_date_provider:{userId:session.user.id,date,provider:cfg.provider as any}},create:{userId:session.user.id,date,provider:cfg.provider as any,requestCount:1,outputTokens:result.outputTokens||0},update:{requestCount:{increment:1},outputTokens:{increment:result.outputTokens||0}}});
   return row;
  });
  await auditService.record({userId:session.user.id,action:"ai.generate",entityType:"AiActivity",entityId:activity.id,metadata:{actionType:input.action,provider:cfg.provider,model:cfg.model,postId:input.postId||null}});
  return {activityId:activity.id,text:result.text,provider:cfg.provider,model:cfg.model,warning:"AI-generated content should be reviewed before publishing."};
 },
 async accept(id:string,session:CurrentSession){const row=await prisma.aiActivity.findUnique({where:{id}});if(!row)throw new AppError("NOT_FOUND","AI activity not found.",404);if(row.userId!==session.user.id&&!session.user.permissions.includes("*")&&!session.user.permissions.includes("ai.manage"))throw new AppError("FORBIDDEN","You cannot update this AI activity.",403);return prisma.aiActivity.update({where:{id},data:{acceptedAt:new Date()}})},
 async history(session:CurrentSession,limit=50){return prisma.aiActivity.findMany({where:session.user.permissions.includes("*")||session.user.permissions.includes("ai.manage")?{}:{userId:session.user.id},take:Math.min(100,Math.max(1,limit)),orderBy:{createdAt:"desc"},include:{user:{select:{name:true,email:true}},post:{select:{id:true,title:true}}}})},
 async usage(session:CurrentSession){const date=todayUtc();const cfg=await getAiConfig();const user=await prisma.aiUsageDaily.findMany({where:{userId:session.user.id,date}});const global=await prisma.aiUsageDaily.aggregate({where:{date},_sum:{requestCount:true,outputTokens:true}});return {date,config:cfg,userRequests:user.reduce((a,x)=>a+x.requestCount,0),userOutputTokens:user.reduce((a,x)=>a+x.outputTokens,0),globalRequests:global._sum.requestCount||0,globalOutputTokens:global._sum.outputTokens||0};}
};
