
import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/session";
import { serializeExport } from "@/services/import-export/import-export.service";
export async function GET(req:NextRequest,{params}:{params:Promise<{type:string}>}){
  await requirePermission("imports.view"); const {type}=await params;
  const format=req.nextUrl.searchParams.get("format")==="json"?"json":"csv";
  try{
    const body=await serializeExport(type,format);
    return new NextResponse(body,{headers:{"content-type":format==="json"?"application/json; charset=utf-8":"text/csv; charset=utf-8","content-disposition":`attachment; filename="${type}.${format}"`}});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Export failed"},{status:400})}
}
