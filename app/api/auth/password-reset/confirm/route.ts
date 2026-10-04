import { NextRequest } from "next/server";
import { passwordResetConfirmSchema } from "@/lib/validation/auth";
import { confirmPasswordReset } from "@/services/auth/auth.service";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { randomUUID } from "node:crypto";
import { AppError } from "@/lib/errors/app-error";
import { assertRateLimit } from "@/services/engagement/rate-limit";

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  try {
    await assertRateLimit("auth.password_reset.confirm", request, 10, 30);
    const { token, password } = passwordResetConfirmSchema.parse(await request.json());
    await confirmPasswordReset(token, password);
    return apiSuccess({ message: "Password updated. Sign in with your new password." });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") return apiError(new AppError("RATE_LIMITED", "Too many attempts. Please try again later.", 429), requestId);
    return apiError(error, requestId);
  }
}
