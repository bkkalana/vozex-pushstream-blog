import { revalidateToolSurfaces } from "@/lib/cache/invalidation";
import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { getRequestId } from "@/lib/http/request-id";
import { requirePermission } from "@/lib/auth/session";
import { aiToolService } from "@/services/ai-tools/ai-tool.service";
export async function GET(r:NextRequest){const id=getRequestId(r.headers);try{await requirePermission("tools.view");const p=r.nextUrl.searchParams;return apiSuccess(await aiToolService.adminList({q:p.get("q")||"",status:p.get("status")||"",categoryId:p.get("categoryId")||"",page:Number(p.get("page")||1),limit:Number(p.get("limit")||20)}));}catch(e){return apiError(e,id)}}
export async function POST(r:NextRequest){const id=getRequestId(r.headers);try{const s=await requirePermission("tools.create");const row=await aiToolService.create(await r.json(),s);revalidateToolSurfaces();return apiSuccess(row,{status:201});}catch(e){return apiError(e,id)}}
