import {prisma} from "@/lib/db/prisma";
export async function isMaintenanceMode(){const row=await prisma.siteSetting.findUnique({where:{key:"system.maintenanceMode"},select:{value:true}});return row?.value===true}
