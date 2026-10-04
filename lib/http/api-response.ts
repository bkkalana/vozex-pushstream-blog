import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors/app-error";
import { logger } from "@/lib/logging/logger";

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data, error: null }, init);
}

export function apiError(error: unknown, requestId?: string) {
  if (error instanceof ZodError) {
    return NextResponse.json({ success: false, data: null, error: { code: "VALIDATION_ERROR", message: "Please check the submitted fields.", details: (error as ZodError).flatten(), requestId } }, { status: 422 });
  }
  if (error instanceof AppError) {
    const appError = error as AppError;
    return NextResponse.json({ success: false, data: null, error: { code: appError.code, message: appError.message, requestId } }, { status: appError.status });
  }
  logger.error("Unhandled API error", { requestId, error: error instanceof Error ? error.message : "unknown" });
  return NextResponse.json({ success: false, data: null, error: { code: "INTERNAL_ERROR", message: "Something went wrong.", requestId } }, { status: 500 });
}
