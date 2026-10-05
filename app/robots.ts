import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getSeoSiteConfig } from "@/lib/seo/site";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeoSiteConfig();
  const production = env.NODE_ENV === "production";

  if (!production || !seo.robotsIndex) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
      sitemap: new URL("/sitemap.xml", env.SITE_URL).toString(),
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/branding/", "/uploads/"],
        disallow: [
          "/admin/",
          "/api/",
          "/preview/",
          "/go/",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/branding/", "/uploads/"],
      },
      {
        userAgent: "Bingbot",
        allow: ["/", "/branding/", "/uploads/"],
        disallow: ["/admin/", "/api/", "/preview/", "/go/"],
      },
    ],
    sitemap: new URL("/sitemap.xml", env.SITE_URL).toString(),
    host: env.SITE_URL,
  };
}
