import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors/app-error";
import { privacyHash, randomToken, sha256 } from "@/lib/security/crypto";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { authRepository } from "@/repositories/auth/auth.repository";
import { sendPasswordResetEmail } from "@/services/email/password-reset-email";
import { describeDevice } from "@/services/security/session-management.service";
import { recordSecurityEvent } from "@/services/security/security-event.service";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 8;

export async function login(input: { email: string; password: string; remember: boolean; ipAddress: string; userAgent?: string }) {
  const emailHash = privacyHash(input.email);
  const ipHash = privacyHash(input.ipAddress);
  const recentFailures = await authRepository.countRecentFailures(emailHash, ipHash, new Date(Date.now() - LOGIN_WINDOW_MS));
  if (recentFailures >= MAX_FAILED_ATTEMPTS) throw new AppError("LOGIN_THROTTLED", "Too many login attempts. Please try again later.", 429);

  const user = await authRepository.findUserByEmail(input.email);
  const valid = Boolean(user && user.status === "ACTIVE" && await verifyPassword(user.passwordHash, input.password));

  await authRepository.recordLoginAttempt({ emailHash, ipHash, successful: valid });

  if (!valid || !user) {
    await prisma.auditLog.create({ data: { action: "auth.login", outcome: "FAILURE", metadata: { emailHash }, ipAddress: ipHash } });
    if (recentFailures >= 3) await recordSecurityEvent({ type: "auth.repeated_failure", severity: "WARNING", summary: "Repeated failed administrator login attempts detected.", metadata: { emailHash }, ipHash });
    throw new AppError("INVALID_CREDENTIALS", "Invalid email or password.", 401);
  }

  const twoFactor = await prisma.twoFactorCredential.findUnique({ where: { userId: user.id } });
  if (twoFactor?.enabled) {
    const challenge = randomToken();
    await prisma.twoFactorChallenge.create({ data: { userId: user.id, tokenHash: sha256(challenge), remember: input.remember, expiresAt: new Date(Date.now()+5*60_000), ipHash, userAgent: input.userAgent?.slice(0,500) } });
    return { requiresTwoFactor: true as const, challenge, user: { id: user.id, name: user.name, email: user.email } };
  }

  const token = randomToken();
  const expiresAt = new Date(Date.now() + (input.remember ? env.REMEMBER_SESSION_DAYS * 86400000 : env.SESSION_TTL_HOURS * 3600000));
  const sessionData = { userId: user.id, tokenHash: sha256(token), expiresAt, ipAddress: ipHash, deviceDescription: describeDevice(input.userAgent), ...(input.userAgent ? { userAgent: input.userAgent.slice(0, 500) } : {}) };

  await prisma.$transaction([
    prisma.session.create({ data: sessionData }),
    prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }),
    prisma.auditLog.create({ data: { userId: user.id, action: "auth.login", outcome: "SUCCESS", ipAddress: ipHash } }),
  ]);

  return { requiresTwoFactor: false as const, token, expiresAt, user: { id: user.id, name: user.name, email: user.email } };
}

export async function logout(token: string | undefined): Promise<void> {
  if (!token) return;
  await authRepository.revokeSessionByHash(sha256(token));
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await authRepository.findUserByEmail(email);
  if (!user || user.status !== "ACTIVE") return;

  const token = randomToken(32);
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TTL_MINUTES * 60000);
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
    prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } }),
    prisma.auditLog.create({ data: { userId: user.id, action: "auth.password_reset.request", outcome: "SUCCESS" } }),
  ]);
  await sendPasswordResetEmail(user.email, token);
}

export async function confirmPasswordReset(token: string, password: string): Promise<void> {
  const tokenHash = sha256(token);
  const reset = await prisma.passwordResetToken.findFirst({
    where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() }, user: { status: "ACTIVE", deletedAt: null } },
  });
  if (!reset) throw new AppError("RESET_TOKEN_INVALID", "This password reset link is invalid or has expired.", 400);

  const passwordHash = await hashPassword(password);
  const now = new Date();
  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: now } }),
    prisma.passwordResetToken.updateMany({ where: { userId: reset.userId, usedAt: null, id: { not: reset.id } }, data: { usedAt: now } }),
    prisma.session.updateMany({ where: { userId: reset.userId, revokedAt: null }, data: { revokedAt: now } }),
    prisma.auditLog.create({ data: { userId: reset.userId, action: "auth.password_reset.complete", outcome: "SUCCESS" } }),
  ]);
}
