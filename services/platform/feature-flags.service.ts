import { prisma } from "@/lib/db/prisma";
export const FEATURE_FLAGS={comments:"comments",aiAssistant:"ai-assistant",newsletter:"newsletter",internalAnalytics:"internal-analytics",ads:"ads",affiliateTracking:"affiliate-tracking",announcementBar:"announcement-bar"} as const;
export async function isFeatureEnabled(key:string, fallback=true){const row=await prisma.featureFlag.findUnique({where:{key},select:{enabled:true}});return row?.enabled??fallback}
export async function listFeatureFlags(){return prisma.featureFlag.findMany({orderBy:{key:"asc"}})}
export async function setFeatureFlag(key:string,enabled:boolean,description?:string){return prisma.featureFlag.upsert({where:{key},update:{enabled,description},create:{key,enabled,description}})}
