"use server";
import { revalidatePath } from "next/cache";
import { CACHE_TAGS,revalidatePublicContent } from "@/lib/cache/invalidation";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/session";

export async function saveHomepageSection(formData:FormData){await requirePermission("homepage.manage");const key=String(formData.get("key")??"");if(!key)throw new Error("Missing section key");const heading=String(formData.get("heading")??"").trim()||null;const description=String(formData.get("description")??"").trim()||null;const enabled=formData.get("enabled")==="on";const sortOrder=Math.max(0,Number(formData.get("sortOrder")??0)||0);const itemCount=Math.min(24,Math.max(1,Number(formData.get("itemCount")??4)||4));const dataSource=String(formData.get("dataSource")??"").trim()||null;const existing=await prisma.homepageSection.findUnique({where:{key}});const config=(existing?.config as Record<string,unknown>|null)??{};if(key==="hero"){config.heroImageId=String(formData.get("heroImageId")??"")||null;config.badge=String(formData.get("badge")??"").trim()||"TECH GUIDES FOR A SMARTER WEB";config.primaryCtaLabel=String(formData.get("primaryCtaLabel")??"").trim()||"Explore Guides";config.primaryCtaUrl=String(formData.get("primaryCtaUrl")??"").trim()||"/how-to";config.secondaryCtaLabel=String(formData.get("secondaryCtaLabel")??"").trim()||"Latest Articles";config.secondaryCtaUrl=String(formData.get("secondaryCtaUrl")??"").trim()||"/latest";}if(key==="stats"){config.items=[0,1,2,3].map(i=>({value:String(formData.get(`statValue${i}`)??"").trim(),label:String(formData.get(`statLabel${i}`)??"").trim()})).filter(x=>x.value&&x.label);}if(key.startsWith("custom-")){config.custom=true;config.layout=String(formData.get("layout")??config.layout??"card_grid");config.backgroundStyle=String(formData.get("backgroundStyle")??config.backgroundStyle??"white");config.manualSelection=String(formData.get("manualSelection")??"").split(",").map(x=>x.trim()).filter(Boolean).slice(0,24);}await prisma.homepageSection.upsert({where:{key},update:{heading,description,enabled,sortOrder,itemCount,dataSource,config:config as any},create:{key,heading,description,enabled,sortOrder,itemCount,dataSource,config:config as any}});revalidatePublicContent([CACHE_TAGS.homepage],["/"]);revalidatePath("/admin/homepage");}

export async function reorderHomepageSections(items:{id:string;sortOrder:number}[]){
  await requirePermission("homepage.manage");
  const ids=new Set(items.map(x=>x.id)); if(ids.size!==items.length)throw new Error("Duplicate section IDs");
  const rows=await prisma.homepageSection.findMany({where:{id:{in:[...ids]}},select:{id:true}});
  if(rows.length!==ids.size)throw new Error("Invalid homepage sections");
  await prisma.$transaction(items.map((x,i)=>prisma.homepageSection.update({where:{id:x.id},data:{sortOrder:i*10+10}})));
  revalidatePublicContent([CACHE_TAGS.homepage],["/"]);revalidatePath("/admin/homepage");
}
export async function createCustomHomepageSection(formData:FormData){
  await requirePermission("homepage.manage");
  const title=String(formData.get("heading")??"").trim(); if(!title)throw new Error("Heading is required");
  const key=`custom-${Date.now().toString(36)}`;
  const dataSource=String(formData.get("dataSource")??"latest_posts");
  const layout=String(formData.get("layout")??"card_grid");
  const backgroundStyle=String(formData.get("backgroundStyle")??"white");
  const manualSelection=String(formData.get("manualSelection")??"").split(",").map(x=>x.trim()).filter(Boolean).slice(0,24);
  const max=await prisma.homepageSection.aggregate({_max:{sortOrder:true}});
  await prisma.homepageSection.create({data:{key,heading:title,description:String(formData.get("description")??"").trim()||null,enabled:true,sortOrder:(max._max.sortOrder??100)+10,dataSource,itemCount:Math.min(24,Math.max(1,Number(formData.get("itemCount")??4)||4)),config:{custom:true,layout,backgroundStyle,manualSelection}}});
  revalidatePublicContent([CACHE_TAGS.homepage],["/"]);revalidatePath("/admin/homepage");
}
export async function deleteCustomHomepageSection(formData:FormData){
  await requirePermission("homepage.manage");const id=String(formData.get("id")??"");if(!id)return;
  const row=await prisma.homepageSection.findUnique({where:{id},select:{key:true}});if(!row?.key.startsWith("custom-"))throw new Error("Core homepage sections cannot be deleted");
  await prisma.homepageSection.delete({where:{id}});revalidatePublicContent([CACHE_TAGS.homepage],["/"]);revalidatePath("/admin/homepage");
}
