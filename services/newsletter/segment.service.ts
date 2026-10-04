import{prisma}from"@/lib/db/prisma";
const slug=(v:string)=>v.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80);
export const newsletterSegmentService={
 async save(input:{id?:string;name:string;description?:string;active:boolean}){const data={name:input.name.trim().slice(0,120),slug:slug(input.name),description:input.description?.trim().slice(0,2000)||null,active:input.active};if(!data.name||!data.slug)throw new Error("INVALID_SEGMENT");return input.id?prisma.newsletterSegment.update({where:{id:input.id},data}):prisma.newsletterSegment.create({data})},
 async assign(subscriberId:string,segmentIds:string[]){await prisma.$transaction(async tx=>{await tx.newsletterSubscriberSegment.deleteMany({where:{subscriberId}});if(segmentIds.length)await tx.newsletterSubscriberSegment.createMany({data:[...new Set(segmentIds)].map(segmentId=>({subscriberId,segmentId}))})})}
};
