import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/session";
import { aiService } from "@/services/ai/ai.service";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { getRequestId } from "@/lib/http/request-id";
import {isFeatureEnabled} from "@/services/platform/feature-flags.service";
export async function POST(request:NextRequest){const id=getRequestId(request.headers);try{if(!(await isFeatureEnabled("ai-assistant",false)))throw new Error("AI assistant is disabled.");const session=await requirePermission("ai.use");return apiSuccess(await aiService.generate(await request.json(),session));}catch(e){return apiError(e,id)}}
