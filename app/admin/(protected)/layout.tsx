import { AdminShell } from "@/components/admin/shell/admin-shell";
import { requireAdminPageSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
export default async function ProtectedAdminLayout({children}: Readonly<{children:React.ReactNode}>) {
  const session=await requireAdminPageSession();
  const unread=await prisma.notification.count({where:{readAt:null,OR:[{userId:session.user.id},{userId:null}]}});
  return <AdminShell user={session.user} unreadNotifications={unread}>{children}</AdminShell>;
}
