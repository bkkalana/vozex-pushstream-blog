import { env } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";

export type SeoSiteConfig = {
  siteName: string;
  tagline: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage?: string;
  twitterCard: "summary" | "summary_large_image";
  robotsIndex: boolean;
  robotsFollow: boolean;
  favicon?: string;
  logo?: string;
  alternateName?: string;
  googleSiteVerification?: string;
  bingSiteVerification?: string;
};

function scalar(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export async function getSeoSiteConfig(): Promise<SeoSiteConfig> {
  const fallback = {
    siteName: "PushStream",
    tagline: "Smarter Tech. Better Solutions.",
  };
  let rows: Awaited<ReturnType<typeof prisma.siteSetting.findMany>> = [];
  try {
    rows = await prisma.siteSetting.findMany({
      where: { key: { in: [
        "general.siteName", "general.tagline", "general.faviconUrl", "seo.defaultTitle", "seo.metaDescription", "seo.defaultDescription",
        "seo.ogImage", "seo.twitterCard", "seo.robotsIndex", "seo.robotsFollow",
        "seo.siteAlternateName", "seo.googleSiteVerification", "seo.bingSiteVerification", "general.logoUrl",
      ] } },
    });
  } catch {
    rows = [];
  }
  const map = new Map(rows.map((row) => [row.key, row.value]));
  const siteName = scalar(map.get("general.siteName")) || fallback.siteName;
  const tagline = scalar(map.get("general.tagline")) || fallback.tagline;
  return {
    siteName,
    tagline,
    defaultTitle: scalar(map.get("seo.defaultTitle")) || siteName,
    defaultDescription: scalar(map.get("seo.metaDescription")) || scalar(map.get("seo.defaultDescription")) || tagline,
    defaultOgImage: scalar(map.get("seo.ogImage")) || "/branding/default-og.png",
    twitterCard: scalar(map.get("seo.twitterCard")) === "summary" ? "summary" : "summary_large_image",
    robotsIndex: bool(map.get("seo.robotsIndex"), true),
    robotsFollow: bool(map.get("seo.robotsFollow"), true),
    favicon: scalar(map.get("general.faviconUrl")) || "/branding/favicon.ico",
    logo: scalar(map.get("general.logoUrl")) || "/branding/pushstream-logo.png",
    alternateName: scalar(map.get("seo.siteAlternateName")) || undefined,
    googleSiteVerification: scalar(map.get("seo.googleSiteVerification")) || undefined,
    bingSiteVerification: scalar(map.get("seo.bingSiteVerification")) || undefined,
  };
}

export function absoluteUrl(pathOrUrl?: string | null): string | undefined {
  if (!pathOrUrl) return undefined;
  try { return new URL(pathOrUrl).toString(); } catch { return new URL(pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`, env.SITE_URL).toString(); }
}

export function canonicalUrl(pathOrUrl: string): string {
  return absoluteUrl(pathOrUrl) || env.SITE_URL;
}
