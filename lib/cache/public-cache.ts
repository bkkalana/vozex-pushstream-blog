import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { CACHE_TAGS } from "@/lib/cache/invalidation";

export const getCachedHomepageSections = unstable_cache(
  async () => prisma.homepageSection.findMany({ orderBy: { sortOrder: "asc" } }),
  ["homepage-sections-v1"],
  { tags: [CACHE_TAGS.homepage], revalidate: 300 },
);

export const getCachedSiteChromeRows = unstable_cache(
  async () => Promise.all([
    prisma.siteSetting.findMany({
      where: { key: { in: ["general.siteName", "general.tagline", "general.logoUrl", "social.facebook", "social.twitter", "social.linkedin", "social.youtube", "social.instagram", "general.footerBrandCardTitle", "general.footerBrandCardBody", "general.footerCommunityMessage"] } },
      select: { key: true, value: true },
    }),
    prisma.menu.findMany({
      where: { key: { in: ["header", "footer", "mega"] } },
      select: {
        key: true,
        items: {
          where: { enabled: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, label: true, url: true, external: true, openInNewTab: true, nofollow: true, sponsored: true, cssIdentifier: true, parentId: true, sortOrder: true },
        },
      },
    }),
  ]),
  ["site-chrome-v1"],
  { tags: [CACHE_TAGS.chrome, CACHE_TAGS.settings], revalidate: 600 },
);

export const getCachedPublishedArticle = unstable_cache(
  async (slug: string) => prisma.post.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null, publishedAt: { lte: new Date() } },
    include: {
      author: { include: { authorProfile: true } },
      category: true,
      featuredImage: true,
      ogImage: true,
      twitterImage: true,
      tags: { include: { tag: true } },
      comments: {
        where: { status: "APPROVED", parentId: null },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { replies: { where: { status: "APPROVED" }, orderBy: { createdAt: "asc" }, take: 10 } },
      },
    },
  }),
  ["published-article-v1"],
  { tags: [CACHE_TAGS.posts], revalidate: 300 },
);
