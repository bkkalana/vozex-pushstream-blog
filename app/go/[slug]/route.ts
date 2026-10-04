import { NextRequest, NextResponse } from "next/server";
import { affiliateService } from "@/services/monetization/affiliate.service";
import { assertRateLimit } from "@/services/engagement/rate-limit";
import {isFeatureEnabled} from "@/services/platform/feature-flags.service";
export async function GET(request:NextRequest,{params}:{params:Promise<{slug:string}>}){if(!(await isFeatureEnabled("affiliate-tracking",true)))return NextResponse.redirect(new URL("/",request.url),302);const {slug}=await params;let track=true;try{await assertRateLimit("affiliate.click",request,120,60)}catch(error){if(error instanceof Error&&error.message==="RATE_LIMITED")track=false;else throw error}const destination=await affiliateService.resolve(slug,request.headers.get("referer"),track);if(!destination)return NextResponse.redirect(new URL("/",request.url),302);const response=NextResponse.redirect(destination,302);response.headers.set("Cache-Control","no-store");return response}
