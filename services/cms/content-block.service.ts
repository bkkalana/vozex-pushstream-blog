import { prisma } from "@/lib/db/prisma";
import { uniqueSlug } from "@/lib/cms/slug";
import { contentBlockInputSchema } from "@/lib/validation/content-blocks";
import { auditService } from "@/services/audit/audit.service";
import type { CurrentSession } from "@/lib/auth/session";
export const contentBlockService={
 async list(){return prisma.contentBlock.findMany({include:{_count:{select:{usages:true}},createdBy:{select:{name:true}}},orderBy:{updatedAt:"desc"}})},
 async active(){return prisma.contentBlock.findMany({where:{status:"ACTIVE"},orderBy:{name:"asc"}})},
 async create(raw:unknown,s:CurrentSession){const v=contentBlockInputSchema.parse(raw);const slug=await uniqueSlug(v.slug||v.name,async x=>Boolean(await prisma.contentBlock.findUnique({where:{slug:x},select:{id:true}})));const row=await prisma.contentBlock.create({data:{...v,slug,content:v.content as never,createdById:s.user.id}});await auditService.record({userId:s.user.id,action:"contentBlock.create",entityType:"ContentBlock",entityId:row.id});return row},
 async update(id:string,raw:unknown,s:CurrentSession){const v=contentBlockInputSchema.parse(raw);const current=await prisma.contentBlock.findUnique({where:{id}});if(!current)return null;const slug=await uniqueSlug(v.slug||v.name,async x=>Boolean(await prisma.contentBlock.findFirst({where:{slug:x,NOT:{id}},select:{id:true}})),current.slug);const row=await prisma.contentBlock.update({where:{id},data:{...v,slug,content:v.content as never}});await auditService.record({userId:s.user.id,action:"contentBlock.update",entityType:"ContentBlock",entityId:id});return row},
 async remove(id:string,s:CurrentSession){const c=await prisma.contentBlock.findUnique({where:{id},include:{_count:{select:{usages:true}}}});if(!c)return null;if(c._count.usages>0)return prisma.contentBlock.update({where:{id},data:{status:"ARCHIVED"}});await prisma.contentBlock.delete({where:{id}});await auditService.record({userId:s.user.id,action:"contentBlock.delete",entityType:"ContentBlock",entityId:id});return c},
 async recordUsage(blockId:string,postId:string,mode:"SHARED"|"STATIC"){await prisma.contentBlockUsage.upsert({where:{blockId_postId_mode:{blockId,postId,mode}},update:{},create:{blockId,postId,mode}})}
};
