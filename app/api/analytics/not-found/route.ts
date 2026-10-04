import { NextRequest, NextResponse } from "next/server";import { z } from "zod";import { notFoundService } from "@/services/seo/not-found.service";
const S=z.object({path:z.string().min(1).max(600)});
export async function POST(req:NextRequest){try{const data=S.parse(await req.json());await notFoundService.record(data.path,req.headers.get("referer"));return NextResponse.json({success:true,data:{recorded:true},error:null})}catch{return NextResponse.json({success:false,data:null,error:{code:"INVALID_404_EVENT",message:"Invalid event."}},{status:400})}}
