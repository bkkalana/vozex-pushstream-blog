
import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/session";
import { importTypes, parseImportFile, type ImportType } from "@/services/import-export/import-export.service";
export async function POST(req:NextRequest){
  await requirePermission("imports.manage");
  const form=await req.formData(); const type=String(form.get("type")??"") as ImportType;
  if(!importTypes.includes(type))return NextResponse.json({error:"Unsupported import type"},{status:400});
  const file=form.get("file"); if(!(file instanceof File))return NextResponse.json({error:"File is required"},{status:400});
  if(file.size>5*1024*1024)return NextResponse.json({error:"Import file too large"},{status:413});
  try{
    const rows=parseImportFile(type,file.name,await file.text());
    return NextResponse.json({rows,summary:{total:rows.length,valid:rows.filter(r=>r.valid).length,invalid:rows.filter(r=>!r.valid).length,warnings:rows.reduce((n,r)=>n+r.warnings.length,0)}});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Preview failed"},{status:400})}
}
