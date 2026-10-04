import {requireSession} from "@/lib/auth/session";import {apiError,apiSuccess} from "@/lib/http/api-response";import {beginTwoFactorSetup} from "@/services/security/totp.service";
export async function POST(){try{const s=await requireSession();return apiSuccess(await beginTwoFactorSetup(s.user.id,s.user.email));}catch(e){return apiError(e)}}
