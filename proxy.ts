import { NextRequest, NextResponse } from "next/server";
import { redirectService } from "@/services/seo/redirect.service";
import { SECURITY_HEADERS } from "@/lib/security/headers";
import { isTrustedSameOriginRequest, requiresCsrfProtection } from "@/lib/security/request-security";
import {isMaintenanceMode} from "@/services/platform/maintenance.service";

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [name, value] of SECURITY_HEADERS) response.headers.set(name, value);
  return response;
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (requiresCsrfProtection(path, request.method) && !isTrustedSameOriginRequest(request)) {
    return applySecurityHeaders(NextResponse.json({ success: false, data: null, error: { code: "CSRF_REJECTED", message: "Request origin could not be verified." } }, { status: 403 }));
  }

  const maintenanceBypass = path==="/maintenance" || path==="/api/health" || path.startsWith("/admin") || path.startsWith("/api/internal/");
  if (!maintenanceBypass && !request.cookies.has("__Host-pushstream_admin_session") && !request.cookies.has("pushstream_admin_session")) {
    const maintenance = await isMaintenanceMode().catch(()=>false);
    if (maintenance) return applySecurityHeaders(NextResponse.redirect(new URL("/maintenance", request.url), 307));
  }

  const isPublicPage = !path.startsWith("/admin") && !path.startsWith("/api/") && path!=="/maintenance";
  if (isPublicPage) {
    const rule = await redirectService.resolve(path).catch(() => null);
    if (rule) {
      void redirectService.recordHit(rule.id);
      const target = rule.newPath.startsWith("/") ? new URL(rule.newPath, request.url) : new URL(rule.newPath);
      return applySecurityHeaders(new NextResponse(null, { status: rule.type === "PERMANENT" ? 301 : 302, headers: { Location: target.toString(), "Cache-Control": "no-store" } }));
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|css|js|map|woff2?)$).*)"],
};
