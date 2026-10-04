import {prisma} from "@/lib/db/prisma";
export type MediaUsage={type:string;label:string;href:string|null;count:number};
function hasMediaId(value:unknown,id:string):boolean{if(value===id)return true;if(Array.isArray(value))return value.some(v=>hasMediaId(v,id));if(value&&typeof value==="object")return Object.values(value as Record<string,unknown>).some(v=>hasMediaId(v,id));return false}
export const mediaUsageService={async get(mediaId:string){const [featured,og,twitter,categories,logos,toolShots,reviewShots,home]=await prisma.$transaction([
 prisma.post.findMany({where:{featuredImageId:mediaId,deletedAt:null},select:{id:true,title:true,slug:true}}),
 prisma.post.findMany({where:{ogImageId:mediaId,deletedAt:null},select:{id:true,title:true,slug:true}}),
 prisma.post.findMany({where:{twitterImageId:mediaId,deletedAt:null},select:{id:true,title:true,slug:true}}),
 prisma.category.findMany({where:{imageId:mediaId},select:{id:true,name:true,slug:true}}),
 prisma.aiTool.findMany({where:{logoId:mediaId,deletedAt:null},select:{id:true,name:true,slug:true}}),
 prisma.aiToolScreenshot.findMany({where:{mediaId},include:{aiTool:{select:{name:true,slug:true}}}}),
 prisma.reviewScreenshot.findMany({where:{mediaId},include:{review:{select:{title:true,slug:true}}}}),
 prisma.homepageSection.findMany({where:{config:{not:null}},select:{id:true,key:true,heading:true,config:true}})
 ]);
 const uses:MediaUsage[]=[];for(const p of featured)uses.push({type:"Post featured image",label:p.title,href:`/admin/posts/${p.id}/edit`,count:1});for(const p of og)uses.push({type:"Post Open Graph image",label:p.title,href:`/admin/posts/${p.id}/edit`,count:1});for(const p of twitter)uses.push({type:"Post Twitter image",label:p.title,href:`/admin/posts/${p.id}/edit`,count:1});for(const c of categories)uses.push({type:"Category image",label:c.name,href:`/admin/categories`,count:1});for(const t of logos)uses.push({type:"AI Tool logo",label:t.name,href:`/admin/ai-tools/${t.id}/edit`,count:1});for(const x of toolShots)uses.push({type:"AI Tool screenshot",label:x.aiTool.name,href:`/admin/ai-tools`,count:1});for(const x of reviewShots)uses.push({type:"Review screenshot",label:x.review.title,href:`/admin/reviews`,count:1});for(const h of home)if(hasMediaId(h.config,mediaId))uses.push({type:"Homepage section",label:h.heading||h.key,href:"/admin/homepage",count:1});return {items:uses,total:uses.length,summary:uses.reduce<Record<string,number>>((a,u)=>(a[u.type]=(a[u.type]||0)+1,a),{})}}};
