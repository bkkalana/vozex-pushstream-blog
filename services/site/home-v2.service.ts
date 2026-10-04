import { prisma } from "@/lib/db/prisma";
import { getPageDefinition } from "@/lib/site/page-section-registry";
import { isPublicSectionVisible } from "@/lib/site/section-visibility";

export type PublicHomeSection = {
  id?: string;
  pageKey: "home";
  sectionKey: string;
  sectionType: string;
  enabled: boolean;
  heading: string | null;
  description: string | null;
  sortOrder: number;
  dataSource: string | null;
  itemCount: number | null;
  imageId: string | null;
  config: Record<string, unknown>;
  items: Array<{
    id?: string;
    itemKey: string | null;
    title: string | null;
    subtitle: string | null;
    body: string | null;
    icon: string | null;
    imageId: string | null;
    url: string | null;
    sortOrder: number;
    enabled: boolean;
    config: Record<string, unknown>;
  }>;
};

function toConfig(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function manualIds(section: PublicHomeSection | undefined) {
  const value = section?.config.manualSelection;
  return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
}

function defaultSections(): PublicHomeSection[] {
  const definition = getPageDefinition("home");
  if (!definition) return [];
  return definition.defaults.map((item, index) => ({
    pageKey: "home",
    sectionKey: item.sectionKey,
    sectionType: item.sectionType,
    enabled: true,
    heading: item.heading ?? null,
    description: item.description ?? null,
    sortOrder: (index + 1) * 10,
    dataSource: item.dataSource ?? null,
    itemCount: item.itemCount ?? null,
    imageId: null,
    config: {},
    items: [],
  }));
}

export async function getHomePageV2Data() {
  const now = new Date();
  const sectionRows = await prisma.publicPageSection.findMany({
    where: { pageKey: "home", enabled: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      items: {
        where: { enabled: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  const visibleSectionRows = sectionRows.filter((row) => isPublicSectionVisible(row.config, now));
  const sections: PublicHomeSection[] = sectionRows.length
    ? visibleSectionRows.map((row) => ({
        ...row,
        pageKey: "home" as const,
        config: toConfig(row.config),
        items: row.items.map((item) => ({ ...item, config: toConfig(item.config) })),
      }))
    : defaultSections();

  const byKey = new Map(sections.map((section) => [section.sectionKey, section]));
  const hero = byKey.get("hero");
  const categoriesSection = byKey.get("categories");
  const trendingSection = byKey.get("trending");
  const latestSection = byKey.get("latest");
  const toolsSection = byKey.get("tools");
  const reviewsSection = byKey.get("reviews");

  const postInclude = {
    category: true,
    author: { include: { authorProfile: true } },
    featuredImage: true,
  } as const;

  const [
    featuredCategories,
    allCategories,
    trendingPosts,
    popularPosts,
    latestPosts,
    featuredTools,
    topTools,
    latestReviews,
    latestComparisons,
  ] = await Promise.all([
    prisma.category.findMany({
      where: { featured: true, archivedAt: null },
      include: { _count: { select: { posts: { where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now } } } } } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: Math.max(6, categoriesSection?.itemCount ?? 6),
    }),
    prisma.category.findMany({
      where: { archivedAt: null },
      include: { _count: { select: { posts: { where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now } } } } } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: Math.max(6, categoriesSection?.itemCount ?? 6),
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now }, isTrending: true },
      include: postInclude,
      orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
      take: Math.max(4, trendingSection?.itemCount ?? 4),
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now } },
      include: postInclude,
      orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
      take: Math.max(4, trendingSection?.itemCount ?? 4),
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now } },
      include: postInclude,
      orderBy: [{ publishedAt: "desc" }],
      take: Math.max(8, latestSection?.itemCount ?? 4),
    }),
    prisma.aiTool.findMany({
      where: { status: "PUBLISHED", deletedAt: null, featured: true },
      include: { category: true, logo: true },
      orderBy: [{ rating: "desc" }, { updatedAt: "desc" }],
      take: Math.max(6, toolsSection?.itemCount ?? 6),
    }),
    prisma.aiTool.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      include: { category: true, logo: true },
      orderBy: [{ rating: "desc" }, { views: "desc" }, { updatedAt: "desc" }],
      take: Math.max(6, toolsSection?.itemCount ?? 6),
    }),
    prisma.review.findMany({
      where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now } },
      include: { aiTool: { include: { logo: true, category: true } } },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: Math.max(4, reviewsSection?.itemCount ?? 4),
    }),
    prisma.comparison.findMany({
      where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now } },
      include: { items: { orderBy: { sortOrder: "asc" }, take: 3 } },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: 4,
    }),
  ]);

  const categoryIds = manualIds(categoriesSection);
  const trendingIds = manualIds(trendingSection);
  const latestIds = manualIds(latestSection);
  const toolIds = manualIds(toolsSection);
  const reviewIds = manualIds(reviewsSection);
  const allManualIds = [...new Set([...categoryIds, ...trendingIds, ...latestIds, ...toolIds, ...reviewIds])];

  const [manualCategories, manualPosts, manualTools, manualReviews, heroImage] = await Promise.all([
    categoryIds.length ? prisma.category.findMany({
      where: { id: { in: categoryIds }, archivedAt: null },
      include: { _count: { select: { posts: { where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now } } } } } },
    }) : Promise.resolve([]),
    allManualIds.length ? prisma.post.findMany({
      where: { id: { in: allManualIds }, status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now } },
      include: postInclude,
    }) : Promise.resolve([]),
    toolIds.length ? prisma.aiTool.findMany({
      where: { id: { in: toolIds }, status: "PUBLISHED", deletedAt: null },
      include: { category: true, logo: true },
    }) : Promise.resolve([]),
    reviewIds.length ? prisma.review.findMany({
      where: { id: { in: reviewIds }, status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now } },
      include: { aiTool: { include: { logo: true, category: true } } },
    }) : Promise.resolve([]),
    hero?.imageId ? prisma.media.findFirst({ where: { id: hero.imageId, deletedAt: null } }) : Promise.resolve(null),
  ]);

  const ordered = <T extends { id: string }>(ids: string[], rows: T[]) => {
    const map = new Map(rows.map((row) => [row.id, row]));
    return ids.map((id) => map.get(id)).filter((row): row is T => Boolean(row));
  };

  const categories = categoryIds.length
    ? ordered(categoryIds, manualCategories)
    : (featuredCategories.length ? featuredCategories : allCategories).slice(0, categoriesSection?.itemCount ?? 6);

  const trending = trendingIds.length
    ? ordered(trendingIds, manualPosts).slice(0, trendingSection?.itemCount ?? 4)
    : (trendingPosts.length ? trendingPosts : popularPosts).slice(0, trendingSection?.itemCount ?? 4);

  const latest = latestIds.length
    ? ordered(latestIds, manualPosts).slice(0, latestSection?.itemCount ?? 4)
    : latestPosts.slice(0, latestSection?.itemCount ?? 4);

  const tools = toolIds.length
    ? ordered(toolIds, manualTools).slice(0, toolsSection?.itemCount ?? 6)
    : (featuredTools.length ? featuredTools : topTools).slice(0, toolsSection?.itemCount ?? 6);

  const reviews = reviewIds.length
    ? ordered(reviewIds, manualReviews).slice(0, reviewsSection?.itemCount ?? 4)
    : latestReviews.slice(0, Math.max(1, (reviewsSection?.itemCount ?? 4) - Math.min(2, latestComparisons.length)));

  return {
    sections,
    section: (key: string) => byKey.get(key),
    heroImage,
    categories,
    trending,
    latest,
    tools,
    reviews,
    comparisons: latestComparisons.slice(0, Math.max(0, (reviewsSection?.itemCount ?? 4) - reviews.length)),
  };
}
