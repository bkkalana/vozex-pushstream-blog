import { NextRequest } from "next/server";
import { passwordResetRequestSchema } from "@/lib/validation/auth";
import { requestPasswordReset } from "@/services/auth/auth.service";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { randomUUID } from "node:crypto";
import { AppError } from "@/lib/errors/app-error";
import { assertRateLimit } from "@/services/engagement/rate-limit";

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  try {
    await assertRateLimit("auth.password_reset.request", request, 5, 30);
    const { email } = passwordResetRequestSchema.parse(await request.json());
    await requestPasswordReset(email);
    return apiSuccess({ message: "If an account exists for that email, a reset link has been sent." });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return apiError(new AppError("RATE_LIMITED", "Too many attempts. Please try again later.", 429), requestId);
    return apiError(error, requestId);
  }
}
