import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";
import { activityService } from "@/services/activity/activity.service";

type AuditInput = { userId?: string | null; action: string; entityType?: string | null; entityId?: string | null; metadata?: Record<string, unknown>; ipAddress?: string | null; outcome?: "SUCCESS"|"FAILURE" };
const SECRET_KEY=/(password|passwd|token|secret|authorization|cookie|session|database_url|smtp_password|api[_-]?key)/i;
function scrub(value:unknown,depth=0):unknown{if(depth>5)return"[truncated]";if(Array.isArray(value))return value.slice(0,50).map(x=>scrub(x,depth+1));if(!value||typeof value!=="object")return value;const out:Record<string,unknown>={};for(const[k,v]of Object.entries(value as Record<string,unknown>))out[k]=SECRET_KEY.test(k)?"[redacted]":scrub(v,depth+1);return out}
export const auditService = {
  async record(input: AuditInput) {
    try { const row=await prisma.auditLog.create({ data: { userId: input.userId ?? null, action: input.action.slice(0,120), entityType: input.entityType?.slice(0,120) ?? null, entityId: input.entityId?.slice(0,191) ?? null, metadata: input.metadata ? scrub(input.metadata) as any : undefined, ipAddress: input.ipAddress?.slice(0,64) ?? null, outcome: input.outcome ?? "SUCCESS" } }); if((input.outcome??"SUCCESS")==="SUCCESS")void activityService.record({userId:input.userId,action:input.action,entityType:input.entityType,entityId:input.entityId,summary:`${input.action}${input.entityType?` · ${input.entityType}`:""}`,metadata:input.metadata}); return row; }
    catch (error) { logger.error("Audit log write failed", { action: input.action, entityType: input.entityType, entityId: input.entityId, error: error instanceof Error ? error.message : "unknown" }); return null; }
  },
};
