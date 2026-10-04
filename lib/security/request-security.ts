import type { NextRequest } from "next/server";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const MUTATION_PREFIXES = ["/api/admin/", "/api/auth/"];

export function isStateChanging(method: string): boolean {
  return !SAFE_METHODS.has(method.toUpperCase());
}

export function requiresCsrfProtection(pathname: string, method: string): boolean {
  if (!isStateChanging(method)) return false;
  if (pathname.startsWith("/api/internal/")) return false;
  return MUTATION_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function normalizedOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

export function expectedRequestOrigin(request: NextRequest): string {
  const host = request.headers.get("host") || request.nextUrl.host;
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto === "http" || forwardedProto === "https" ? forwardedProto : request.nextUrl.protocol.replace(":", "");
  return `${protocol}://${host}`;
}

export function isTrustedSameOriginRequest(request: NextRequest): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;

  const expected = normalizedOrigin(expectedRequestOrigin(request));
  if (!expected) return false;

  const origin = request.headers.get("origin");
  if (origin) return normalizedOrigin(origin) === expected;

  const referer = request.headers.get("referer");
  if (referer) return normalizedOrigin(referer) === expected;

  // Browser same-origin navigations/fetches normally send Origin or Referer for
  // state-changing requests. Requests with neither are denied for protected APIs.
  return false;
}
