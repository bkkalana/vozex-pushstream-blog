import type { MetadataRoute } from "next";
import { getSeoSiteConfig } from "@/lib/seo/site";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const seo = await getSeoSiteConfig();
  return {
    name: seo.siteName,
    short_name: seo.alternateName || seo.siteName,
    description: seo.defaultDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#087cff",
    icons: [
      { src: "/branding/favicon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/branding/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
