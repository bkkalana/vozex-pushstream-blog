import { prisma } from "@/lib/db/prisma";

function normalizePath(value:string){
  const v=value.trim();
  if(!v.startsWith("/")) throw new Error("Old path must start with /");
  if(v.startsWith("//")) throw new Error("Protocol-relative paths are not allowed");
  const withoutQuery=(v.split("?")[0]??v).split("#")[0]??v;
  return withoutQuery.length>1?withoutQuery.replace(/\/+$/,""):withoutQuery;
}
function normalizeDestination(value:string){
  const v=value.trim();
  if(v.startsWith("/")){ if(v.startsWith("//")) throw new Error("Protocol-relative destinations are not allowed"); return v; }
  const u=new URL(v); if(!["http:","https:"].includes(u.protocol))throw new Error("Only HTTP(S) destinations are allowed"); return u.toString();
}
export const redirectService={
  async list(q="",page=1){const take=30,where=q?{OR:[{oldPath:{contains:q}},{newPath:{contains:q}}]}:{};const [items,total]=await Promise.all([prisma.redirect.findMany({where,orderBy:{updatedAt:"desc"},skip:(page-1)*take,take}),prisma.redirect.count({where})]);return{items,total,pages:Math.max(1,Math.ceil(total/take))}},
  async save(input:{id?:string;oldPath:string;newPath:string;type:"PERMANENT"|"TEMPORARY";active:boolean}){const oldPath=normalizePath(input.oldPath),newPath=normalizeDestination(input.newPath);if(oldPath===newPath)throw new Error("Redirect cannot point to itself");if(newPath.startsWith("/")){let cursor=normalizePath(newPath);const seen=new Set<string>([oldPath]);for(let i=0;i<20;i++){if(seen.has(cursor))throw new Error("Redirect cycle detected");seen.add(cursor);const next=await prisma.redirect.findFirst({where:{oldPath:cursor,active:true,...(input.id?{id:{not:input.id}}:{})},select:{newPath:true}});if(!next||!next.newPath.startsWith("/"))break;cursor=normalizePath(next.newPath);}}return input.id?prisma.redirect.update({where:{id:input.id},data:{oldPath,newPath,type:input.type,active:input.active}}):prisma.redirect.create({data:{oldPath,newPath,type:input.type,active:input.active}})},
  remove(id:string){return prisma.redirect.delete({where:{id}})},
  async resolve(pathname:string){const oldPath=normalizePath(pathname);return prisma.redirect.findFirst({where:{oldPath,active:true}})},
  async recordHit(id:string){await prisma.redirect.update({where:{id},data:{hits:{increment:1},lastHitAt:new Date()}}).catch(()=>undefined)},
};
