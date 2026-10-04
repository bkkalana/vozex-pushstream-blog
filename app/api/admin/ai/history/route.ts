import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/session";
import { aiService } from "@/services/ai/ai.service";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { getRequestId } from "@/lib/http/request-id";
export async function GET(request:NextRequest){const id=getRequestId(request.headers);try{const session=await requirePermission("ai.view");return apiSuccess(await aiService.history(session,Number(request.nextUrl.searchParams.get("limit")||50)));}catch(e){return apiError(e,id)}}
