import {prisma} from "@/lib/db/prisma";
import {getPageDefinition,isPublicPageKey} from "@/lib/site/page-section-registry";
import {publicPageSectionInput,publicPageSectionItemInput} from "@/lib/validation/public-page-sections";
import {isPublicSectionVisible} from "@/lib/site/section-visibility";

export const pageSectionsService={
  async ensureDefaults(pageKey:string){
    if(!isPublicPageKey(pageKey))throw new Error("Unknown public page.");
    const def=getPageDefinition(pageKey)!;
    for(const [index,item] of def.defaults.entries())await prisma.publicPageSection.upsert({where:{pageKey_sectionKey:{pageKey,sectionKey:item.sectionKey}},update:{},create:{pageKey,sectionKey:item.sectionKey,sectionType:item.sectionType,heading:item.heading??null,description:item.description??null,sortOrder:(index+1)*10,dataSource:item.dataSource??null,itemCount:item.itemCount??null,config:{stylePreset:"white"}}});
    return this.listAdmin(pageKey);
  },
  listAdmin(pageKey:string){return prisma.publicPageSection.findMany({where:{pageKey},orderBy:[{sortOrder:"asc"},{createdAt:"asc"}],include:{items:{orderBy:[{sortOrder:"asc"},{createdAt:"asc"}]}}})},
  async listPublic(pageKey:string){const rows=await prisma.publicPageSection.findMany({where:{pageKey,enabled:true},orderBy:[{sortOrder:"asc"},{createdAt:"asc"}],include:{items:{where:{enabled:true},orderBy:[{sortOrder:"asc"},{createdAt:"asc"}]}}});const now=new Date();return rows.filter(row=>isPublicSectionVisible(row.config,now))},
  async save(raw:unknown){const d=publicPageSectionInput.parse(raw);return prisma.publicPageSection.upsert({where:{pageKey_sectionKey:{pageKey:d.pageKey,sectionKey:d.sectionKey}},update:{sectionType:d.sectionType,enabled:d.enabled,heading:d.heading,description:d.description,sortOrder:d.sortOrder,dataSource:d.dataSource,itemCount:d.itemCount,imageId:d.imageId,config:d.config as never},create:{...d,config:d.config as never}})},
  async reorder(pageKey:string,ids:string[]){if(!isPublicPageKey(pageKey))throw new Error("Invalid page.");const unique=[...new Set(ids)];if(unique.length!==ids.length)throw new Error("Duplicate section IDs.");const rows=await prisma.publicPageSection.findMany({where:{pageKey,id:{in:ids}},select:{id:true}});if(rows.length!==ids.length)throw new Error("One or more sections do not belong to this page.");await prisma.$transaction(ids.map((id,index)=>prisma.publicPageSection.update({where:{id},data:{sortOrder:(index+1)*10}})));},
  async duplicate(pageKey:string,sectionId:string){
    if(!isPublicPageKey(pageKey))throw new Error("Invalid page.");
    const source=await prisma.publicPageSection.findFirst({where:{id:sectionId,pageKey},include:{items:{orderBy:[{sortOrder:"asc"},{createdAt:"asc"}]}}});
    if(!source)throw new Error("Section not found.");
    const siblings=await prisma.publicPageSection.findMany({where:{pageKey},select:{sectionKey:true,sortOrder:true}});
    const used=new Set(siblings.map(x=>x.sectionKey));
    const base=`${source.sectionKey}-copy`.slice(0,90);let sectionKey=base,n=2;while(used.has(sectionKey)){sectionKey=`${base}-${n++}`.slice(0,100)}
    const maxOrder=Math.max(0,...siblings.map(x=>x.sortOrder));
    return prisma.publicPageSection.create({data:{pageKey,sectionKey,sectionType:source.sectionType,enabled:false,heading:source.heading?`${source.heading} Copy`:null,description:source.description,sortOrder:maxOrder+10,dataSource:source.dataSource,itemCount:source.itemCount,imageId:source.imageId,config:source.config as never,items:{create:source.items.map(item=>({itemKey:item.itemKey,title:item.title,subtitle:item.subtitle,body:item.body,icon:item.icon,imageId:item.imageId,url:item.url,sortOrder:item.sortOrder,enabled:item.enabled,config:item.config as never}))}},include:{items:true}});
  },
  async resetToDefault(pageKey:string,sectionKey:string){
    if(!isPublicPageKey(pageKey))throw new Error("Invalid page.");const def=getPageDefinition(pageKey);const item=def?.defaults.find(x=>x.sectionKey===sectionKey);if(!item)throw new Error("This duplicated/custom section has no registry default.");
    const section=await prisma.publicPageSection.findUnique({where:{pageKey_sectionKey:{pageKey,sectionKey}}});if(!section)throw new Error("Section not found.");
    await prisma.$transaction([prisma.publicPageSectionItem.deleteMany({where:{sectionId:section.id}}),prisma.publicPageSection.update({where:{id:section.id},data:{sectionType:item.sectionType,enabled:true,heading:item.heading??null,description:item.description??null,dataSource:item.dataSource??null,itemCount:item.itemCount??null,imageId:null,config:{stylePreset:"white"}}})]);
  },
  async addItem(raw:unknown){const d=publicPageSectionItemInput.parse(raw);return prisma.publicPageSectionItem.create({data:{...d,config:d.config as never}})},
  async reorderItems(sectionId:string,ids:string[]){const unique=[...new Set(ids)];if(unique.length!==ids.length)throw new Error("Duplicate item IDs.");const rows=await prisma.publicPageSectionItem.findMany({where:{sectionId,id:{in:ids}},select:{id:true}});if(rows.length!==ids.length)throw new Error("One or more items do not belong to this section.");await prisma.$transaction(ids.map((id,index)=>prisma.publicPageSectionItem.update({where:{id},data:{sortOrder:(index+1)*10}})));},
  async updateItem(id:string,raw:unknown){const d=publicPageSectionItemInput.parse(raw);return prisma.publicPageSectionItem.update({where:{id},data:{itemKey:d.itemKey,title:d.title,subtitle:d.subtitle,body:d.body,icon:d.icon,imageId:d.imageId,url:d.url,sortOrder:d.sortOrder,enabled:d.enabled,config:d.config as never}})},
  removeItem(id:string){return prisma.publicPageSectionItem.delete({where:{id}})},
  async resolveData(section:{dataSource:string|null;itemCount:number|null;config:unknown}){
    const source=section.dataSource??"manual",take=Math.min(50,Math.max(1,section.itemCount??6));
    const config=(section.config&&typeof section.config==="object"?section.config:{}) as {manualSelection?:string[]};
    if(source==="latest_posts")return prisma.post.findMany({where:{status:"PUBLISHED",deletedAt:null},include:{category:true,author:{include:{authorProfile:true}},featuredImage:true},orderBy:{publishedAt:"desc"},take});
    if(source==="trending_posts")return prisma.post.findMany({where:{status:"PUBLISHED",deletedAt:null,isTrending:true},include:{category:true,author:{include:{authorProfile:true}},featuredImage:true},orderBy:[{views:"desc"},{publishedAt:"desc"}],take});
    if(source==="featured_posts")return prisma.post.findMany({where:{status:"PUBLISHED",deletedAt:null,isFeatured:true},include:{category:true,author:{include:{authorProfile:true}},featuredImage:true},orderBy:{publishedAt:"desc"},take});
    if(source.startsWith("category:")){const slug=source.slice(9);return prisma.post.findMany({where:{status:"PUBLISHED",deletedAt:null,category:{slug}},include:{category:true,author:{include:{authorProfile:true}},featuredImage:true},orderBy:{publishedAt:"desc"},take})}
    if(source==="featured_categories")return prisma.category.findMany({where:{featured:true},orderBy:[{sortOrder:"asc"},{name:"asc"}],take});
    if(source==="featured_tools")return prisma.aiTool.findMany({where:{status:"PUBLISHED",deletedAt:null,featured:true},include:{category:true,logo:true},orderBy:[{rating:"desc"},{name:"asc"}],take});
    if(source==="all_tools")return prisma.aiTool.findMany({where:{status:"PUBLISHED",deletedAt:null},include:{category:true,logo:true},orderBy:[{featured:"desc"},{rating:"desc"},{name:"asc"}],take});
    if(source==="latest_reviews")return prisma.review.findMany({where:{status:"PUBLISHED",deletedAt:null},include:{aiTool:{include:{logo:true}}},orderBy:{publishedAt:"desc"},take});
    if(source==="authors")return prisma.authorProfile.findMany({include:{user:true},orderBy:{createdAt:"asc"},take});
    if(source==="resources")return prisma.resource.findMany({where:{status:"PUBLISHED"},include:{category:true,logo:true},orderBy:[{featured:"desc"},{name:"asc"}],take});
    if(source==="manual"&&Array.isArray(config.manualSelection)&&config.manualSelection.length)return {manualSelection:config.manualSelection.slice(0,take)};
    return [];
  },
  async dataOptions(){const [posts,tools,reviews,authors,categories,media]=await Promise.all([
    prisma.post.findMany({where:{status:"PUBLISHED",deletedAt:null},select:{id:true,title:true},orderBy:{publishedAt:"desc"},take:150}),
    prisma.aiTool.findMany({where:{status:"PUBLISHED",deletedAt:null},select:{id:true,name:true},orderBy:{name:"asc"},take:150}),
    prisma.review.findMany({where:{status:"PUBLISHED",deletedAt:null},select:{id:true,title:true},orderBy:{publishedAt:"desc"},take:150}),
    prisma.authorProfile.findMany({select:{id:true,user:{select:{name:true}}},orderBy:{user:{name:"asc"}},take:100}),
    prisma.category.findMany({select:{id:true,name:true},orderBy:{name:"asc"},take:100}),
    prisma.media.findMany({where:{deletedAt:null,mimeType:{startsWith:"image/"}},select:{id:true,title:true,filename:true,path:true,altText:true},orderBy:{createdAt:"desc"},take:150}),
  ]);return{posts,tools,reviews,authors,categories,media}},
};
