import type { Metadata } from "next";
import { absoluteUrl, canonicalUrl, getSeoSiteConfig } from "@/lib/seo/site";

export type SeoInput = {
  title: string;
  description?: string | null;
  canonicalPath?: string;
  canonicalUrl?: string | null;
  index?: boolean;
  follow?: boolean;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

export async function buildMetadata(input: SeoInput): Promise<Metadata> {
  const site = await getSeoSiteConfig();
  const description = input.description || site.defaultDescription;
  const canonical = input.canonicalUrl ? canonicalUrl(input.canonicalUrl) : canonicalUrl(input.canonicalPath || "/");
  const ogImage = absoluteUrl(input.ogImage || site.defaultOgImage);
  const twitterImage = absoluteUrl(input.twitterImage || input.ogImage || site.defaultOgImage);
  return {
    title: input.title,
    description,
    alternates: { canonical },
    robots: {
      index: input.index ?? site.robotsIndex,
      follow: input.follow ?? site.robotsFollow,
      googleBot: { index: input.index ?? site.robotsIndex, follow: input.follow ?? site.robotsFollow },
    },
    openGraph: {
      title: input.ogTitle || input.title,
      description: input.ogDescription || description,
      url: canonical,
      siteName: site.siteName,
      type: input.type || "website",
      ...(input.type === "article" ? { publishedTime: input.publishedTime, modifiedTime: input.modifiedTime } : {}),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: site.twitterCard,
      title: input.twitterTitle || input.ogTitle || input.title,
      description: input.twitterDescription || input.ogDescription || description,
      ...(twitterImage ? { images: [twitterImage] } : {}),
    },
  };
}
