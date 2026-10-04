import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/security/password";
import { auditService } from "@/services/audit/audit.service";

export async function listUsers() {
  return prisma.user.findMany({ where: { deletedAt: null }, include: { roles: { include: { role: true } } }, orderBy: { createdAt: "desc" } });
}
export async function listRoles() {
  return prisma.role.findMany({ include: { permissions: { include: { permission: true } }, _count: { select: { users: true } } }, orderBy: { name: "asc" } });
}
export async function createAdminUser(input:{name:string;email:string;password:string;roleIds:string[];actorId:string}) {
  const passwordHash=await hashPassword(input.password);
  const user=await prisma.user.create({data:{name:input.name,email:input.email.toLowerCase(),passwordHash,roles:{create:input.roleIds.map(roleId=>({roleId}))}}});
  await auditService.record({userId:input.actorId,action:"user.create",entityType:"User",entityId:user.id,metadata:{email:user.email,roleCount:input.roleIds.length}});
  return user;
}
export async function updateAdminUser(input:{id:string;name:string;email:string;status:"ACTIVE"|"SUSPENDED"|"DISABLED";roleIds:string[];password?:string;actorId:string}) {
  const current=await prisma.user.findUniqueOrThrow({where:{id:input.id},include:{roles:{include:{role:true}}}});
  const isSuper=current.roles.some(x=>x.role.name==="SUPER_ADMIN");
  const targetRoles=await prisma.role.findMany({where:{id:{in:input.roleIds}},select:{name:true}});
  const keepsSuper=targetRoles.some(x=>x.name==="SUPER_ADMIN");
  if(isSuper&&(!keepsSuper||input.status!=="ACTIVE")){const activeSupers=await prisma.user.count({where:{deletedAt:null,status:"ACTIVE",roles:{some:{role:{name:"SUPER_ADMIN"}}}}});if(activeSupers<=1)throw new Error("The last active SUPER_ADMIN cannot be demoted or disabled.");}
  const data:{name:string;email:string;status:"ACTIVE"|"SUSPENDED"|"DISABLED";passwordHash?:string}={name:input.name,email:input.email.toLowerCase(),status:input.status};
  if(input.password) data.passwordHash=await hashPassword(input.password);
  const user=await prisma.$transaction(async tx=>{await tx.userRole.deleteMany({where:{userId:input.id}});return tx.user.update({where:{id:input.id},data:{...data,roles:{create:input.roleIds.map(roleId=>({roleId}))}}});});
  if(input.status!=="ACTIVE") await prisma.session.updateMany({where:{userId:input.id,revokedAt:null},data:{revokedAt:new Date()}});
  await auditService.record({userId:input.actorId,action:"user.update",entityType:"User",entityId:input.id,metadata:{status:input.status,roleCount:input.roleIds.length,passwordChanged:Boolean(input.password)}});
  return user;
}
export async function softDeleteUser(id:string,actorId:string){const current=await prisma.user.findUniqueOrThrow({where:{id},include:{roles:{include:{role:true}}}});if(current.roles.some(x=>x.role.name==="SUPER_ADMIN")){const activeSupers=await prisma.user.count({where:{deletedAt:null,status:"ACTIVE",roles:{some:{role:{name:"SUPER_ADMIN"}}}}});if(activeSupers<=1)throw new Error("The last active SUPER_ADMIN cannot be deleted.");}await prisma.$transaction([prisma.session.updateMany({where:{userId:id,revokedAt:null},data:{revokedAt:new Date()}}),prisma.user.update({where:{id},data:{deletedAt:new Date(),status:"DISABLED"}})]);await auditService.record({userId:actorId,action:"user.delete",entityType:"User",entityId:id});}
export async function updateRolePermissions(input:{roleId:string;permissionIds:string[];actorId:string}){const role=await prisma.role.findUniqueOrThrow({where:{id:input.roleId}});if(role.name==="SUPER_ADMIN") throw new Error("SUPER_ADMIN permissions are immutable.");await prisma.$transaction(async tx=>{await tx.rolePermission.deleteMany({where:{roleId:input.roleId}});if(input.permissionIds.length) await tx.rolePermission.createMany({data:input.permissionIds.map(permissionId=>({roleId:input.roleId,permissionId})),skipDuplicates:true});});await auditService.record({userId:input.actorId,action:"role.permissions.update",entityType:"Role",entityId:input.roleId,metadata:{permissionCount:input.permissionIds.length}});}
