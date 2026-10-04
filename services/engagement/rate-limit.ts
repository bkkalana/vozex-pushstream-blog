import { prisma } from "@/lib/db/prisma";
import { privacyHash } from "@/lib/security/crypto";

export function requestIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || "unknown";
}

export async function assertRateLimit(scope: string, req: Request, limit: number, minutes: number) {
  const ipHash = privacyHash(requestIp(req));
  const since = new Date(Date.now() - minutes * 60_000);
  const count = await prisma.engagementAttempt.count({ where: { scope, ipHash, createdAt: { gte: since } } });
  if (count >= limit) throw new Error("RATE_LIMITED");
  await prisma.engagementAttempt.create({ data: { scope, ipHash } });
  return ipHash;
}
