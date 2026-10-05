"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CACHE_TAGS, revalidatePublicContent } from "@/lib/cache/invalidation";
import { requirePermission } from "@/lib/auth/session";
import { AppError } from "@/lib/errors/app-error";
import { logger } from "@/lib/logging/logger";
import { auditService } from "@/services/audit/audit.service";
import { upsertSettings } from "@/services/system/settings.service";

const text = (formData: FormData, key: string, max = 500) =>
  String(formData.get(key) ?? "").trim().slice(0, max);

function resultUrl(kind: "saved" | "error", section: string, requestId?: string, message?: string) {
  const params = new URLSearchParams();
  params.set(kind, section);
  if (requestId) params.set("request", requestId);
  if (message) params.set("message", message);
  return `/admin/settings?${params.toString()}`;
}

function publicErrorMessage(error: unknown) {
  if (error instanceof AppError) return error.message;
  if (!(error instanceof Error)) return "Settings could not be saved. Please try again.";

  const safeMessages = new Set([
    "Invalid email setting.",
    "Social profile URLs must use HTTP or HTTPS.",
    "Logo and favicon URLs must be an HTTP/HTTPS URL or a site-relative path beginning with /.",
    "Only HTTP/HTTPS URLs are allowed.",
    "Invalid Google Analytics ID.",
    "Invalid Google Tag Manager ID.",
    "Reading speed must be 100–600 words/minute.",
  ]);

  return safeMessages.has(error.message)
    ? error.message
    : "Settings could not be saved. Please try again.";
}

function safeRefreshSettings() {
  try {
    revalidatePublicContent([CACHE_TAGS.settings, CACHE_TAGS.chrome], ["/"]);
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
  } catch (error) {
    // Cache invalidation is secondary. A successful database write must not be
    // turned into a failed admin save because revalidation failed.
    logger.error("Settings cache revalidation failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
  }
}

async function safeAudit(
  userId: string,
  action: string,
  metadata?: Record<string, unknown>,
) {
  try {
    await auditService.record({
      userId,
      action,
      entityType: "SiteSetting",
      metadata,
    });
  } catch (error) {
    logger.error("Settings audit write failed", {
      action,
      error: error instanceof Error ? error.message : "unknown",
    });
  }
}

function logSaveFailure(section: string, requestId: string, error: unknown) {
  const details: Record<string, unknown> = {
    section,
    requestId,
    error: error instanceof Error ? error.message : "unknown",
  };

  if (error && typeof error === "object" && "code" in error) {
    details.code = String((error as { code?: unknown }).code ?? "");
  }

  logger.error("Admin settings save failed", details);
}

export async function saveGeneralSettings(formData: FormData) {
  const requestId = randomUUID();
  let userId = "";

  try {
    const session = await requirePermission("settings.edit");
    userId = session.user.id;

    const values = {
      "general.siteName": text(formData, "siteName", 120),
      "general.tagline": text(formData, "tagline", 200),
      "general.adminEmail": text(formData, "adminEmail", 255),
      "general.timezone": text(formData, "timezone", 80),
      "general.logoUrl": text(formData, "logoUrl", 1000),
      "general.faviconUrl": text(formData, "faviconUrl", 1000),
      "general.defaultAuthorId": text(formData, "defaultAuthorId", 100),
      "general.footerBrandCardTitle": text(formData, "footerBrandCardTitle", 180),
      "general.footerBrandCardBody": text(formData, "footerBrandCardBody", 500),
      "general.footerCommunityMessage": text(formData, "footerCommunityMessage", 180),
    };

    await upsertSettings("general", values, userId);
    await safeAudit(userId, "settings.general.update", { keys: Object.keys(values) });
    safeRefreshSettings();
  } catch (error) {
    logSaveFailure("general", requestId, error);
    redirect(resultUrl("error", "general", requestId, publicErrorMessage(error)));
  }

  redirect(resultUrl("saved", "general"));
}

export async function saveSocialSettings(formData: FormData) {
  const requestId = randomUUID();
  let userId = "";

  try {
    const session = await requirePermission("settings.edit");
    userId = session.user.id;

    const values = {
      "social.facebook": text(formData, "facebook", 1000),
      "social.twitter": text(formData, "twitter", 1000),
      "social.linkedin": text(formData, "linkedin", 1000),
      "social.youtube": text(formData, "youtube", 1000),
      "social.instagram": text(formData, "instagram", 1000),
    };

    await upsertSettings("social", values, userId);
    await safeAudit(userId, "settings.social.update");
    safeRefreshSettings();
  } catch (error) {
    logSaveFailure("social", requestId, error);
    redirect(resultUrl("error", "social", requestId, publicErrorMessage(error)));
  }

  redirect(resultUrl("saved", "social"));
}

export async function saveIntegrationSettings(formData: FormData) {
  const requestId = randomUUID();
  let userId = "";

  try {
    const session = await requirePermission("settings.edit");
    userId = session.user.id;

    const rawWpm = Number(formData.get("wpm") || 225);
    const wpm = Number.isFinite(rawWpm) ? Math.min(600, Math.max(100, rawWpm)) : 225;

    const values = {
      "analytics.googleAnalyticsId": text(formData, "ga", 100),
      "analytics.googleTagManagerId": text(formData, "gtm", 100),
      "comments.enabled": formData.get("commentsEnabled") === "on",
      "comments.requireModeration": formData.get("moderation") === "on",
      "newsletter.confirmationRequired": formData.get("confirmation") === "on",
      "performance.readingWordsPerMinute": wpm,
    };

    await upsertSettings("integrations", values, userId);
    await safeAudit(userId, "settings.integrations.update");
    safeRefreshSettings();
  } catch (error) {
    logSaveFailure("integrations", requestId, error);
    redirect(resultUrl("error", "integrations", requestId, publicErrorMessage(error)));
  }

  redirect(resultUrl("saved", "integrations"));
}
