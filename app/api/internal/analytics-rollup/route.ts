import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";
export async function POST(req:NextRequest){if(!env.CRON_SECRET||req.headers.get("authorization")!==`Bearer ${env.CRON_SECRET}`)return NextResponse.json({error:{code:"UNAUTHORIZED",message:"Unauthorized"}},{status:401});const cutoff=new Date(Date.now()-120*86400000);const [views,clicks]=await prisma.$transaction([prisma.postView.deleteMany({where:{viewedAt:{lt:cutoff}}}),prisma.affiliateClick.deleteMany({where:{createdAt:{lt:new Date(Date.now()-365*86400000)}}})]);return NextResponse.json({success:true,data:{oldPostViewEventsDeleted:views.count,oldAffiliateClicksDeleted:clicks.count}})}
