import type { NextRequest } from "next/server";

export function getRequestContext(request: NextRequest): { ipAddress: string; userAgent?: string } {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ipAddress = forwarded || request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || undefined;
  return userAgent ? { ipAddress, userAgent } : { ipAddress };
}
