import { prisma } from "@/lib/db/prisma";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findFirst({ where: { email, deletedAt: null } });
  },
  findUserById(id: string) {
    return prisma.user.findFirst({ where: { id, deletedAt: null } });
  },
  createSession(data: { userId: string; tokenHash: string; expiresAt: Date; userAgent?: string; ipAddress?: string; deviceDescription?: string }) {
    return prisma.session.create({ data });
  },
  findActiveSession(tokenHash: string) {
    return prisma.session.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() }, user: { status: "ACTIVE", deletedAt: null } },
      include: {
        user: {
          include: {
            roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
          },
        },
      },
    });
  },
  touchSession(id: string) {
    return prisma.session.update({ where: { id }, data: { lastSeenAt: new Date() } });
  },
  revokeSessionByHash(tokenHash: string) {
    return prisma.session.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt: new Date() } });
  },
  revokeUserSessions(userId: string) {
    return prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  },
  countRecentFailures(emailHash: string, ipHash: string, since: Date) {
    return prisma.loginAttempt.count({
      where: { successful: false, createdAt: { gte: since }, OR: [{ emailHash }, { ipHash }] },
    });
  },
  recordLoginAttempt(data: { emailHash: string; ipHash: string; successful: boolean }) {
    return prisma.loginAttempt.create({ data });
  },
};
