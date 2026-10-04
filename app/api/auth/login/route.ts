import { NextRequest } from "next/server";
import { loginSchema } from "@/lib/validation/auth";
import { login } from "@/services/auth/auth.service";
import { getRequestContext } from "@/lib/auth/request";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { setSessionCookie } from "@/lib/auth/cookies";
import { randomUUID } from "node:crypto";

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  try {
    const input = loginSchema.parse(await request.json());
    const result = await login({ email: input.email as string, password: input.password, remember: input.remember, ...getRequestContext(request) });
    if (result.requiresTwoFactor) return apiSuccess({ requiresTwoFactor: true, challenge: result.challenge, user: result.user });
    const response = apiSuccess({ requiresTwoFactor: false, user: result.user });
    setSessionCookie(response, result.token, result.expiresAt);
    return response;
  } catch (error) { return apiError(error, requestId); }
}
