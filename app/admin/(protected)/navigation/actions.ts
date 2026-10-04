
"use server";
import { revalidatePath } from "next/cache";
import { CACHE_TAGS,revalidatePublicContent } from "@/lib/cache/invalidation";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/session";
import { validateMenuStructure } from "@/lib/navigation/menu-structure";

function refresh(){revalidatePublicContent([CACHE_TAGS.chrome],["/"]);revalidatePath("/admin/navigation");}
function safeUrl(value:string){const v=value.trim();if(v.startsWith("/"))return v;const u=new URL(v);if(!["http:","https:"].includes(u.protocol))throw new Error("Only internal paths or HTTP/HTTPS URLs are allowed");return u.toString()}
export async function addMenuItem(formData:FormData){
  const session=await requirePermission("navigation.manage");
  const menuKey=String(formData.get("menuKey")??"header"),label=String(formData.get("label")??"").trim(),url=safeUrl(String(formData.get("url")??""));
  const parentId=String(formData.get("parentId")??"")||null;if(!label||!url)throw new Error("Label and URL are required");
  const menu=await prisma.menu.upsert({where:{key:menuKey},update:{},create:{key:menuKey,name:menuKey.charAt(0).toUpperCase()+menuKey.slice(1)}});
  const max=await prisma.menuItem.aggregate({where:{menuId:menu.id,parentId},_max:{sortOrder:true}});
  await prisma.menuItem.create({data:{menuId:menu.id,label,url,parentId,external:formData.get("external")==="on",openInNewTab:formData.get("openInNewTab")==="on",nofollow:formData.get("nofollow")==="on",sponsored:formData.get("sponsored")==="on",cssIdentifier:String(formData.get("cssIdentifier")??"").trim()||null,itemType:String(formData.get("itemType")??"custom").trim()||"custom",referenceId:String(formData.get("referenceId")??"").trim()||null,sortOrder:(max._max.sortOrder??-1)+1}});
  await prisma.settingHistory.create({data:{userId:session.user.id,group:"navigation",key:`navigation.${menuKey}`,newValue:{action:"add",label,url} as never}});
  refresh();
}
export async function updateMenuItem(formData:FormData){
  const session=await requirePermission("navigation.manage");const id=String(formData.get("id")??"");if(!id)return;
  await prisma.menuItem.update({where:{id},data:{label:String(formData.get("label")??"").trim(),url:safeUrl(String(formData.get("url")??"")),external:formData.get("external")==="on",openInNewTab:formData.get("openInNewTab")==="on",nofollow:formData.get("nofollow")==="on",sponsored:formData.get("sponsored")==="on",cssIdentifier:String(formData.get("cssIdentifier")??"").trim()||null}});
  await prisma.settingHistory.create({data:{userId:session.user.id,group:"navigation",key:"navigation.item",newValue:{action:"update",id} as never}});
  refresh();
}
export async function deleteMenuItem(formData:FormData){const session=await requirePermission("navigation.manage");const id=String(formData.get("id")??"");if(id)await prisma.menuItem.delete({where:{id}});if(id)await prisma.settingHistory.create({data:{userId:session.user.id,group:"navigation",key:"navigation.item",newValue:{action:"delete",id} as never}});refresh();}
export async function moveMenuItem(formData:FormData){await requirePermission("navigation.manage");const id=String(formData.get("id")??"");const direction=String(formData.get("direction")??"up");const item=await prisma.menuItem.findUnique({where:{id}});if(!item)return;const sibling=await prisma.menuItem.findFirst({where:{menuId:item.menuId,parentId:item.parentId,...(direction==="up"?{sortOrder:{lt:item.sortOrder}}:{sortOrder:{gt:item.sortOrder}})},orderBy:{sortOrder:direction==="up"?"desc":"asc"}});if(!sibling)return;await prisma.$transaction([prisma.menuItem.update({where:{id:item.id},data:{sortOrder:sibling.sortOrder}}),prisma.menuItem.update({where:{id:sibling.id},data:{sortOrder:item.sortOrder}})]);refresh();}
export async function saveMenuStructure(menuKey:string,nodes:{id:string;parentId:string|null;sortOrder:number}[]){
  await requirePermission("navigation.manage");const menu=await prisma.menu.findUniqueOrThrow({where:{key:menuKey},select:{id:true}});
  validateMenuStructure(nodes);
  const ids=new Set(nodes.map(x=>x.id));
  const rows=await prisma.menuItem.findMany({where:{menuId:menu.id,id:{in:[...ids]}},select:{id:true}});if(rows.length!==ids.size)throw new Error("Menu payload contains invalid items");
  await prisma.$transaction(nodes.map(n=>prisma.menuItem.update({where:{id:n.id},data:{parentId:n.parentId,sortOrder:Math.max(0,n.sortOrder)}})));refresh();
}
