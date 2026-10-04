import { prisma } from "@/lib/db/prisma";
export const cmsRepository = {
  postSlugExists: (slug:string, excludeId?:string) => prisma.post.count({where:{slug, ...(excludeId?{id:{not:excludeId}}:{})}}).then(Boolean),
  pageSlugExists: (slug:string, excludeId?:string) => prisma.page.count({where:{slug, ...(excludeId?{id:{not:excludeId}}:{})}}).then(Boolean),
  categorySlugExists: (slug:string, excludeId?:string) => prisma.category.count({where:{slug, ...(excludeId?{id:{not:excludeId}}:{})}}).then(Boolean),
  tagSlugExists: (slug:string, excludeId?:string) => prisma.tag.count({where:{slug, ...(excludeId?{id:{not:excludeId}}:{})}}).then(Boolean),
  authorSlugExists: (slug:string, excludeId?:string) => prisma.authorProfile.count({where:{slug, ...(excludeId?{id:{not:excludeId}}:{})}}).then(Boolean),
};
