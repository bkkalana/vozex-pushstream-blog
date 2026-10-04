import type { ContentEntityType } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
export async function getEntitySeo(entityType:ContentEntityType,entityId:string){return prisma.seoMeta.findUnique({where:{entityType_entityId:{entityType,entityId}}})}
