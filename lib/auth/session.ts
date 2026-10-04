import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppError } from "@/lib/errors/app-error";
import { sha256 } from "@/lib/security/crypto";
import { authRepository } from "@/repositories/auth/auth.repository";
import { hasPermission } from "@/lib/auth/permissions";
import { env } from "@/lib/env";

export const SESSION_COOKIE = env.NODE_ENV === "production" ? "__Host-pushstream_admin_session" : "pushstream_admin_session";

export type CurrentSession = {
  id: string;
  expiresAt: Date;
  user: { id: string; name: string; email: string; roles: string[]; permissions: string[] };
};

export async function getCurrentSession(): Promise<CurrentSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await authRepository.findActiveSession(sha256(token));
  if (!session) return null;

  if (Date.now() - session.lastSeenAt.getTime() > 5 * 60 * 1000) {
    void authRepository.touchSession(session.id).catch(() => undefined);
  }

  const roles = session.user.roles.map(({ role }) => role.name);
  const permissions = new Set<string>();
  for (const { role } of session.user.roles) {
    if (role.name === "SUPER_ADMIN") permissions.add("*");
    for (const { permission } of role.permissions) permissions.add(permission.key);
  }

  return {
    id: session.id,
    expiresAt: session.expiresAt,
    user: { id: session.user.id, name: session.user.name, email: session.user.email, roles, permissions: [...permissions] },
  };
}

export async function requireSession(): Promise<CurrentSession> {
  const session = await getCurrentSession();
  if (!session) throw new AppError("UNAUTHORIZED", "Authentication required.", 401);
  return session;
}

export async function requireAdminPageSession(): Promise<CurrentSession> {
  const session = await getCurrentSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function requirePermission(permission: string): Promise<CurrentSession> {
  const session = await requireSession();
  if (!hasPermission(session.user.permissions, permission)) throw new AppError("FORBIDDEN", "You do not have permission to perform this action.", 403);
  return session;
}

export async function requireAnyPermission(permissions: readonly string[]): Promise<CurrentSession> {
  const session = await requireSession();
  if (!permissions.some((permission) => hasPermission(session.user.permissions, permission))) {
    throw new AppError("FORBIDDEN", "You do not have permission to perform this action.", 403);
  }
  return session;
}

export function assertOwnerOrPermission(session: CurrentSession, ownerUserId: string, permission: string): void {
  if (session.user.id === ownerUserId) return;
  if (!hasPermission(session.user.permissions, permission)) throw new AppError("FORBIDDEN", "You can only modify your own content.", 403);
}
