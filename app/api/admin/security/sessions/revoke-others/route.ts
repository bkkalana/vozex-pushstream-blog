import {requireSession} from "@/lib/auth/session";import {apiError,apiSuccess} from "@/lib/http/api-response";import {revokeOtherSessions} from "@/services/security/session-management.service";
export async function POST(){try{const s=await requireSession();const result=await revokeOtherSessions(s.user.id,s.id);return apiSuccess({revoked:result.count});}catch(e){return apiError(e)}}
