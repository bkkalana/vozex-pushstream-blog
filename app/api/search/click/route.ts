import {NextRequest,NextResponse} from "next/server";import {prisma} from "@/lib/db/prisma";import {z} from "zod";
const S=z.object({logId:z.string().min(1),url:z.string().min(1).max(600),type:z.string().max(40)});
export async function POST(r:NextRequest){const b=S.safeParse(await r.json().catch(()=>null));if(!b.success)return NextResponse.json({ok:false},{status:400});await prisma.searchLog.updateMany({where:{id:b.data.logId,clickedAt:null},data:{clickedResult:b.data.url,clickedType:b.data.type,clickedAt:new Date()}});return NextResponse.json({ok:true})}
