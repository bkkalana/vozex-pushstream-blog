import { prisma } from "@/lib/db/prisma";
function cleanPath(value:string){const path=value.split(/[?#]/)[0].trim();if(!path.startsWith("/")||path.length>600)return null;return path}
function cleanRef(value?:string|null){if(!value)return null;try{const u=new URL(value);return `${u.origin}${u.pathname}`.slice(0,600)}catch{return null}}
export const notFoundService={
 async record(pathValue:string,referrer?:string|null){const path=cleanPath(pathValue);if(!path||path.startsWith("/admin")||path.startsWith("/api/"))return;await prisma.notFoundStat.upsert({where:{path},update:{count:{increment:1},lastSeenAt:new Date(),...(cleanRef(referrer)?{referrer:cleanRef(referrer)}:{})},create:{path,referrer:cleanRef(referrer)}})},
 list(){return prisma.notFoundStat.findMany({orderBy:[{count:"desc"},{lastSeenAt:"desc"}],take:500})},
 remove(id:string){return prisma.notFoundStat.delete({where:{id}})}
};
