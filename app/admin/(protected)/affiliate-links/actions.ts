"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/session";
import { affiliateService, assertHttpUrl, normalizeAffiliateSlug } from "@/services/monetization/affiliate.service";
import { auditService } from "@/services/audit/audit.service";
export async function saveAffiliateLink(fd:FormData){const s=await requirePermission("affiliate.manage");const id=String(fd.get("id")||"");const data={name:String(fd.get("name")||"").trim(),slug:normalizeAffiliateSlug(String(fd.get("slug")||fd.get("name")||"")),destinationUrl:assertHttpUrl(String(fd.get("destinationUrl")||"")),affiliateUrl:assertHttpUrl(String(fd.get("affiliateUrl")||"")),campaign:String(fd.get("campaign")||"").trim()||null,active:fd.get("active")==="on"};if(!data.name)throw new Error("Name is required.");const row=id?await prisma.affiliateLink.update({where:{id},data}):await prisma.affiliateLink.create({data});await auditService.record({userId:s.user.id,action:id?"affiliate.update":"affiliate.create",entityType:"AffiliateLink",entityId:row.id});revalidatePath("/admin/affiliate-links")}
export async function deleteAffiliateLink(fd:FormData){const s=await requirePermission("affiliate.manage");const id=String(fd.get("id")||"");if(!id)return;await prisma.affiliateLink.delete({where:{id}});await auditService.record({userId:s.user.id,action:"affiliate.delete",entityType:"AffiliateLink",entityId:id});revalidatePath("/admin/affiliate-links")}
