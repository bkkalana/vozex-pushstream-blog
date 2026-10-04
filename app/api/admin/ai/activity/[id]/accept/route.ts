import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/session";
import { aiService } from "@/services/ai/ai.service";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { getRequestId } from "@/lib/http/request-id";
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){const rid=getRequestId(request.headers);try{const session=await requirePermission("ai.use");return apiSuccess(await aiService.accept((await params).id,session));}catch(e){return apiError(e,rid)}}
