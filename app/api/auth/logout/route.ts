import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { clearSessionCookie } from "@/lib/auth/cookies";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { logout } from "@/services/auth/auth.service";
import { randomUUID } from "node:crypto";

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  try {
    await logout(request.cookies.get(SESSION_COOKIE)?.value);
    const response = apiSuccess({ loggedOut: true });
    clearSessionCookie(response);
    return response;
  } catch (error) { return apiError(error, requestId); }
}
