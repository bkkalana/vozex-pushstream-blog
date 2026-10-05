import { env } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";
import { canonicalUrl } from "@/lib/seo/site";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const KEY_LOCATION_PATH = "/indexnow-key.txt";

function scalar(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function getIndexNowKey(): Promise<string> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "seo.indexNowKey" }, select: { value: true } });
    return scalar(row?.value);
  } catch {
    return "";
  }
}

export async function submitIndexNowUrls(pathsOrUrls: string[]): Promise<{ submitted: number; skipped: boolean }> {
  const key = await getIndexNowKey();
  if (!key || env.NODE_ENV !== "production") return { submitted: 0, skipped: true };

  const site = new URL(env.SITE_URL);
  const urls = [...new Set(pathsOrUrls.map((value) => canonicalUrl(value)))].filter((value) => {
    try { return new URL(value).host === site.host; } catch { return false; }
  }).slice(0, 10000);
  if (!urls.length) return { submitted: 0, skipped: true };

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: site.host,
      key,
      keyLocation: canonicalUrl(KEY_LOCATION_PATH),
      urlList: urls,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok && response.status !== 202) throw new Error(`IndexNow submission failed with HTTP ${response.status}`);
  return { submitted: urls.length, skipped: false };
}
