import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { getRequestId } from "@/lib/http/request-id";
import { requireSession } from "@/lib/auth/session";
export async function GET(request: NextRequest){const requestId=getRequestId(request.headers);try{const session=await requireSession();return apiSuccess({message:"Admin API foundation is active.",userId:session.user.id,requestId});}catch(error){return apiError(error,requestId);}}
