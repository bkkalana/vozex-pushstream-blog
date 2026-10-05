import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors/app-error";
import { logger } from "@/lib/logging/logger";

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data, error: null }, init);
}

function isZodError(error: unknown): error is { name?: string; issues: unknown[]; flatten?: () => unknown } {
  return Boolean(error && typeof error === "object" && Array.isArray((error as { issues?: unknown }).issues));
}

export function apiError(error: unknown, requestId?: string) {
  if (isZodError(error)) {
    const details = typeof error.flatten === "function" ? error.flatten() : { issues: error.issues };
    return NextResponse.json({ success: false, data: null, error: { code: "VALIDATION_ERROR", message: "Please check the submitted fields.", details, requestId } }, { status: 422 });
  }
  if (error instanceof AppError) {
    const appError = error as AppError;
    return NextResponse.json({ success: false, data: null, error: { code: appError.code, message: appError.message, requestId } }, { status: appError.status });
  }
  logger.error("Unhandled API error", { requestId, error: error instanceof Error ? error.message : "unknown" });
  return NextResponse.json({ success: false, data: null, error: { code: "INTERNAL_ERROR", message: "Something went wrong.", requestId } }, { status: 500 });
}
