import { prisma } from "@/lib/db/prisma";

const GLOBAL_KEYS=["seo.defaultTitle","seo.metaDescription","seo.ogImage","seo.twitterCard","seo.robotsIndex","seo.robotsFollow"] as const;
export const seoAdminService={
 async settings(){const rows=await prisma.siteSetting.findMany({where:{key:{in:[...GLOBAL_KEYS]}}});return Object.fromEntries(rows.map(x=>[x.key,x.value])) as Record<string,unknown>},
 async saveSettings(input:Record<string,unknown>){await prisma.$transaction(Object.entries(input).map(([key,value])=>prisma.siteSetting.upsert({where:{key},update:{value:value as any,group:"seo"},create:{key,value:value as any,group:"seo"}})))},
};
