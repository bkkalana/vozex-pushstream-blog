
import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/session";
import { importTypes, commitImport, type ImportType, type PreviewRow } from "@/services/import-export/import-export.service";
import { auditService } from "@/services/audit/audit.service";
export async function POST(req:NextRequest){
  const session=await requirePermission("imports.manage");
  try{
    const body=await req.json() as {type:ImportType;rows:PreviewRow[]};
    if(!importTypes.includes(body.type)||!Array.isArray(body.rows))return NextResponse.json({error:"Invalid import payload"},{status:400});
    const result=await commitImport(body.type,body.rows);
    await auditService.record({userId:session.user.id,action:"import.commit",entityType:body.type,entityId:null,metadata:result});
    return NextResponse.json({ok:true,...result});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Import failed"},{status:400})}
}
