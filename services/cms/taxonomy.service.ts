import { prisma } from "@/lib/db/prisma";
import { uniqueSlug } from "@/lib/cms/slug";
import { categoryInputSchema, tagInputSchema, pageInputSchema, authorInputSchema } from "@/lib/validation/cms";
import { cmsRepository } from "@/repositories/cms/cms.repository";
import type { CurrentSession } from "@/lib/auth/session";
import { auditService } from "@/services/audit/audit.service";

export const categoryService={
 list:()=>prisma.category.findMany({where:{archivedAt:null},include:{parent:true,_count:{select:{posts:true,children:true}}},orderBy:[{sortOrder:"asc"},{name:"asc"}]}),
 async create(raw:unknown,session:CurrentSession){const v=categoryInputSchema.parse(raw); const slug=await uniqueSlug(v.slug||v.name,s=>cmsRepository.categorySlugExists(s)); const row=await prisma.category.create({data:{...v,slug}}); await auditService.record({userId:session.user.id,action:"category.create",entityType:"Category",entityId:row.id}); return row;},
 async update(id:string,raw:unknown,session:CurrentSession){const v=categoryInputSchema.parse(raw); if(v.parentId===id) throw new Error("Category cannot be its own parent."); const current=await prisma.category.findUnique({where:{id}}); if(!current)return null; const slug=await uniqueSlug(v.slug||v.name,s=>cmsRepository.categorySlugExists(s,id),current.slug); return prisma.category.update({where:{id},data:{...v,slug}});},
 async remove(id:string,session:CurrentSession){const row=await prisma.category.findUnique({where:{id},include:{_count:{select:{posts:true,children:true}}}}); if(!row)return null; if(row._count.posts||row._count.children) return prisma.category.update({where:{id},data:{archivedAt:new Date()}}); await prisma.category.delete({where:{id}}); await auditService.record({userId:session.user.id,action:"category.delete",entityType:"Category",entityId:id}); return {id};}
};
export const tagService={
 list:()=>prisma.tag.findMany({include:{_count:{select:{posts:true}}},orderBy:{name:"asc"}}),
 async create(raw:unknown){const v=tagInputSchema.parse(raw); const slug=await uniqueSlug(v.slug||v.name,s=>cmsRepository.tagSlugExists(s)); return prisma.tag.create({data:{...v,slug}});},
 async update(id:string,raw:unknown){const v=tagInputSchema.parse(raw); const current=await prisma.tag.findUnique({where:{id}}); if(!current)return null; const slug=await uniqueSlug(v.slug||v.name,s=>cmsRepository.tagSlugExists(s,id),current.slug); return prisma.tag.update({where:{id},data:{...v,slug}});},
 async remove(id:string){const count=await prisma.postTag.count({where:{tagId:id}}); if(count) await prisma.postTag.deleteMany({where:{tagId:id}}); return prisma.tag.delete({where:{id}});}
};
export const pageService={
 list:(session:CurrentSession)=>prisma.page.findMany({where:{deletedAt:null,...(session.user.roles.includes("AUTHOR")?{editorId:session.user.id}:{})},include:{editor:true},orderBy:{updatedAt:"desc"}}),
 async create(raw:unknown,session:CurrentSession){const v=pageInputSchema.parse(raw); const slug=await uniqueSlug(v.slug||v.title,s=>cmsRepository.pageSlugExists(s)); return prisma.page.create({data:{...v,slug,editorId:session.user.id,publishedAt:v.status==="PUBLISHED"?new Date():null} as any});},
 async update(id:string,raw:unknown,session:CurrentSession){const v=pageInputSchema.parse(raw); const current=await prisma.page.findUnique({where:{id}}); if(!current)return null; const slug=await uniqueSlug(v.slug||v.title,s=>cmsRepository.pageSlugExists(s,id),current.slug); return prisma.$transaction(async tx=>{const updated=await tx.page.update({where:{id},data:{...v,slug,publishedAt:v.status==="PUBLISHED"?(current.publishedAt??new Date()):current.publishedAt} as any});if(slug!==current.slug)await tx.redirect.upsert({where:{oldPath:`/${current.slug}`},update:{newPath:`/${slug}`,type:"PERMANENT",active:true},create:{oldPath:`/${current.slug}`,newPath:`/${slug}`,type:"PERMANENT",active:true}});return updated;});},
 remove:(id:string)=>prisma.page.update({where:{id},data:{status:"TRASH",deletedAt:new Date()}})
};
export const authorService={
 list:()=>prisma.user.findMany({where:{deletedAt:null,status:"ACTIVE"},include:{authorProfile:{include:{expertise:{orderBy:{sortOrder:"asc"}}}},roles:{include:{role:true}},_count:{select:{posts:true}}},orderBy:{name:"asc"}}),
 async upsert(raw:unknown){const v=authorInputSchema.parse(raw); const user=await prisma.user.findUnique({where:{id:v.userId}}); if(!user) throw new Error("User not found."); const current=await prisma.authorProfile.findUnique({where:{userId:v.userId}}); const slug=await uniqueSlug(v.slug||user.name,s=>cmsRepository.authorSlugExists(s,current?.id),current?.slug); const {expertise,...rest}=v; const data={...rest,slug,website:v.website||null,publicEmail:v.publicEmail||null,facebook:v.facebook||null,xTwitter:v.xTwitter||null,linkedin:v.linkedin||null,youtube:v.youtube||null,instagram:v.instagram||null,github:v.github||null}; return prisma.$transaction(async tx=>{const profile=await tx.authorProfile.upsert({where:{userId:v.userId},create:data,update:data});await tx.authorExpertise.deleteMany({where:{authorProfileId:profile.id}});if(expertise.length)await tx.authorExpertise.createMany({data:expertise.map((topic,sortOrder)=>({authorProfileId:profile.id,topic,sortOrder})),skipDuplicates:true});return profile;});}
};
