"use server";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { seoAdminService } from "@/services/seo/seo.service";
import { redirectService } from "@/services/seo/redirect.service";
import { auditService } from "@/services/audit/audit.service";
import { submitIndexNowUrls } from "@/lib/seo/indexnow";

export async function saveSeoSettings(fd:FormData){
  const s=await requirePermission("seo.edit");
  const value=(k:string)=>String(fd.get(k)||"").trim();
  await seoAdminService.saveSettings({
    "seo.defaultTitle":value("defaultTitle")||"PushStream",
    "seo.metaDescription":value("metaDescription")||"Smarter Tech. Better Solutions.",
    "seo.ogImage":value("ogImage")||"",
    "seo.twitterCard":value("twitterCard")==="summary"?"summary":"summary_large_image",
    "seo.siteAlternateName":value("siteAlternateName")||"",
    "seo.googleSiteVerification":value("googleSiteVerification")||"",
    "seo.bingSiteVerification":value("bingSiteVerification")||"",
    "seo.indexNowKey":value("indexNowKey")||"",
    "seo.robotsIndex":fd.get("robotsIndex")==="on",
    "seo.robotsFollow":fd.get("robotsFollow")==="on",
  });
  await auditService.record({userId:s.user.id,action:"seo.settings.update",entityType:"SiteSetting",entityId:"seo"});
  revalidatePath("/","layout"); revalidatePath("/robots.txt"); revalidatePath("/sitemap.xml"); revalidatePath("/manifest.webmanifest"); revalidatePath("/indexnow-key.txt");
}

export async function submitIndexNow(fd:FormData){
  const s=await requirePermission("seo.edit");
  const raw=String(fd.get("indexNowUrl")||"/").trim()||"/";
  const result=await submitIndexNowUrls([raw]);
  await auditService.record({userId:s.user.id,action:"seo.indexnow.submit",entityType:"SiteSetting",entityId:"indexnow",metadata:{url:raw,submitted:result.submitted,skipped:result.skipped}});
  revalidatePath("/admin/seo");
}

export async function saveRedirect(fd:FormData){
  const s=await requirePermission("seo.edit");
  const id=String(fd.get("id")||"").trim()||undefined;
  const rule=await redirectService.save({id,oldPath:String(fd.get("oldPath")||""),newPath:String(fd.get("newPath")||""),type:String(fd.get("type"))==="TEMPORARY"?"TEMPORARY":"PERMANENT",active:fd.get("active")==="on"});
  await auditService.record({userId:s.user.id,action:id?"redirect.update":"redirect.create",entityType:"Redirect",entityId:rule.id,metadata:{oldPath:rule.oldPath,newPath:rule.newPath,type:rule.type}});
  revalidatePath("/admin/seo");
}

export async function deleteRedirect(fd:FormData){
  const s=await requirePermission("seo.edit");
  const id=String(fd.get("id")||""); if(!id)return;
  const row=await redirectService.remove(id);
  await auditService.record({userId:s.user.id,action:"redirect.delete",entityType:"Redirect",entityId:id,metadata:{oldPath:row.oldPath,newPath:row.newPath}});
  revalidatePath("/admin/seo");
}

export async function saveEntitySeo(fd:FormData){
  const s=await requirePermission("seo.edit");
  const entityType=String(fd.get("entityType")||""); const entityId=String(fd.get("entityId")||"");
  if(!["PAGE","CATEGORY","TAG","AUTHOR","AI_TOOL","REVIEW","COMPARISON"].includes(entityType)||!entityId)throw new Error("Invalid SEO entity");
  const clean=(k:string)=>String(fd.get(k)||"").trim()||null;
  const data={title:clean("title"),description:clean("description"),canonicalUrl:clean("canonicalUrl"),robotsIndex:fd.get("robotsIndex")==="on",robotsFollow:fd.get("robotsFollow")==="on",ogTitle:clean("ogTitle"),ogDescription:clean("ogDescription"),ogImageUrl:clean("ogImageUrl"),twitterTitle:clean("twitterTitle"),twitterDescription:clean("twitterDescription"),twitterImageUrl:clean("twitterImageUrl")};
  const {prisma}=await import("@/lib/db/prisma");
  const type=entityType as "PAGE"|"CATEGORY"|"TAG"|"AUTHOR"|"AI_TOOL"|"REVIEW"|"COMPARISON";
  await prisma.seoMeta.upsert({where:{entityType_entityId:{entityType:type,entityId}},update:data,create:{entityType:type,entityId,...data}});
  await auditService.record({userId:s.user.id,action:"seo.entity.update",entityType,entityId});
  revalidatePath("/admin/seo/content"); revalidatePath("/","layout");
}
