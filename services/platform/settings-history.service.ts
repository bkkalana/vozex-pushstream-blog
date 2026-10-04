import {prisma} from "@/lib/db/prisma";
export async function recordSettingChanges(userId:string|undefined,group:string,changes:Array<{key:string;oldValue:unknown;newValue:unknown}>){if(!changes.length)return;await prisma.settingHistory.createMany({data:changes.map(x=>({userId:userId??null,group,key:x.key,oldValue:x.oldValue as never,newValue:x.newValue as never}))})}
