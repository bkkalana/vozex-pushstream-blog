import {prisma} from "@/lib/db/prisma";
export async function getActiveAnnouncement(now=new Date()){return prisma.announcement.findFirst({where:{enabled:true,AND:[{OR:[{startAt:null},{startAt:{lte:now}}]},{OR:[{endAt:null},{endAt:{gte:now}}]}]},orderBy:{updatedAt:"desc"}})}
