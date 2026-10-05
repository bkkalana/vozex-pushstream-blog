import { prisma } from "@/lib/db/prisma";

type HeroSectionLike = { imageId?: string | null; config?: unknown } | null | undefined;

type HeroMediaRow = { id: string; path: string; altText: string | null; title: string | null };

function configObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function position(value: unknown): "center" | "top" | "bottom" | "left" | "right" {
  return value === "top" || value === "bottom" || value === "left" || value === "right" ? value : "center";
}

export async function resolveHeroMedia(section: HeroSectionLike) {
  const config = configObject(section?.config);
  const desktopId = section?.imageId || null;
  const mobileId = typeof config.mobileImageId === "string" && config.mobileImageId.trim() ? config.mobileImageId.trim() : null;
  const ids = [...new Set([desktopId, mobileId].filter((value): value is string => Boolean(value)))];
  const rows: HeroMediaRow[] = ids.length ? await prisma.media.findMany({
    where: { id: { in: ids }, deletedAt: null },
    select: { id: true, path: true, altText: true, title: true },
  }) : [];
  const map = new Map(rows.map((row) => [row.id, row]));
  const desktop = desktopId ? map.get(desktopId) ?? null : null;
  const mobile = mobileId ? map.get(mobileId) ?? null : null;
  const configuredAlt = typeof config.heroImageAlt === "string" && config.heroImageAlt.trim() ? config.heroImageAlt.trim() : null;
  const overlayRaw = typeof config.heroOverlay === "number" ? config.heroOverlay : Number(config.heroOverlay ?? 0);
  const overlay = Number.isFinite(overlayRaw) ? Math.min(80, Math.max(0, overlayRaw)) : 0;
  return {
    desktop,
    mobile,
    alt: configuredAlt || desktop?.altText || mobile?.altText || "",
    desktopPosition: position(config.heroImagePosition),
    mobilePosition: position(config.heroMobileImagePosition ?? config.heroImagePosition),
    overlay,
  };
}
