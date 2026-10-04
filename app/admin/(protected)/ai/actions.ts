"use server";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { aiSettingsSchema } from "@/lib/validation/ai";
import { upsertSettings } from "@/services/system/settings.service";
import { auditService } from "@/services/audit/audit.service";

export async function saveAiSettings(formData:FormData){
 const session=await requirePermission("ai.manage");
 const parsed=aiSettingsSchema.parse({
  enabled:formData.get("enabled")==="on",provider:String(formData.get("provider")||"OPENAI"),model:String(formData.get("model")||""),
  maxTokens:Number(formData.get("maxTokens")||1800),dailyLimit:Number(formData.get("dailyLimit")||500),perUserDailyLimit:Number(formData.get("perUserDailyLimit")||75),
  featureRewrite:formData.get("featureRewrite")==="on",featureMetadata:formData.get("featureMetadata")==="on",featureOutline:formData.get("featureOutline")==="on",featureFaq:formData.get("featureFaq")==="on",featureLinks:formData.get("featureLinks")==="on",
 });
 await upsertSettings("ai",{
  "ai.enabled":parsed.enabled,"ai.provider":parsed.provider,"ai.model":parsed.model,"ai.maxTokens":parsed.maxTokens,"ai.dailyLimit":parsed.dailyLimit,"ai.perUserDailyLimit":parsed.perUserDailyLimit,
  "ai.feature.rewrite":parsed.featureRewrite,"ai.feature.metadata":parsed.featureMetadata,"ai.feature.outline":parsed.featureOutline,"ai.feature.faq":parsed.featureFaq,"ai.feature.links":parsed.featureLinks,
 });
 await auditService.record({userId:session.user.id,action:"ai.settings.update",entityType:"SiteSetting",metadata:{provider:parsed.provider,model:parsed.model,enabled:parsed.enabled}});
 revalidatePath("/admin/ai");
}
