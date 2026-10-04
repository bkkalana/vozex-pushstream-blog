import { prisma } from "@/lib/db/prisma";
import { getPageDefinition } from "@/lib/site/page-section-registry";
import { isPublicSectionVisible } from "@/lib/site/section-visibility";

export type LatestSection = {
  id?: string;
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
  items: Array<{ title: string | null; subtitle: string | null; body: string | null; icon: string | null; url: string | null; sortOrder: number }>;
};

function toConfig(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function defaultSections(): LatestSection[] {
  const definition = getPageDefinition("latest");
  if (!definition) return [];
  return definition.defaults.map((item, index) => ({
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

export async function getLatestPageV2Data({
  page,
  query,
  category,
  sort,
}: {
  page: number;
  query?: string;
  category?: string;
  sort?: "latest" | "popular" | "oldest";
}) {
  const now = new Date();
  const rows = await prisma.publicPageSection.findMany({
    where: { pageKey: "latest", enabled: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { items: { where: { enabled: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
  });

  const visibleRows = rows.filter((row) => isPublicSectionVisible(row.config, now));
  const sections: LatestSection[] = rows.length ? visibleRows.map((row) => ({
    ...row,
    config: toConfig(row.config),
    items: row.items.map((item) => ({
      title: item.title,
      subtitle: item.subtitle,
      body: item.body,
      icon: item.icon,
      url: item.url,
      sortOrder: item.sortOrder,
    })),
  })) : defaultSections();
  const byKey = new Map(sections.map((section) => [section.sectionKey, section]));
  const hero = byKey.get("hero");
  const featuredSection = byKey.get("featured");
  const articlesSection = byKey.get("articles");
  const perPage = Math.min(24, Math.max(6, articlesSection?.itemCount ?? 12));

  const baseWhere = {
    status: "PUBLISHED" as const,
    deletedAt: null,
    publishedAt: { lte: now },
    ...(category ? { category: { slug: category } } : {}),
    ...(query ? { OR: [
      { title: { contains: query } },
      { excerpt: { contains: query } },
      { subtitle: { contains: query } },
    ] } : {}),
  };
  const orderBy = sort === "popular"
    ? [{ views: "desc" as const }, { publishedAt: "desc" as const }]
    : [{ publishedAt: sort === "oldest" ? "asc" as const : "desc" as const }];
  const include = {
    category: true,
    author: { include: { authorProfile: true } },
    featuredImage: true,
  };

  const manualFeatured = Array.isArray(featuredSection?.config.manualSelection)
    ? featuredSection?.config.manualSelection.filter((id): id is string => typeof id === "string")
    : [];

  const [items, total, categories, trending, tools, heroImage, manualFeaturedRows, featuredFallback, postCount, categoryCount, authorCount] = await Promise.all([
    prisma.post.findMany({ where: baseWhere, include, orderBy, skip: (page - 1) * perPage, take: perPage }),
    prisma.post.count({ where: baseWhere }),
    prisma.category.findMany({
      where: { archivedAt: null },
      include: { _count: { select: { posts: { where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now } } } } } },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      take: 14,
    }),
    prisma.post.findMany({
      where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now } },
      include,
      orderBy: [{ isTrending: "desc" }, { views: "desc" }, { publishedAt: "desc" }],
      take: 5,
    }),
    prisma.aiTool.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      include: { category: true, logo: true },
      orderBy: [{ featured: "desc" }, { rating: "desc" }, { updatedAt: "desc" }],
      take: 3,
    }),
    hero?.imageId ? prisma.media.findFirst({ where: { id: hero.imageId, deletedAt: null } }) : Promise.resolve(null),
    manualFeatured.length ? prisma.post.findMany({ where: { id: { in: manualFeatured }, status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now } }, include }) : Promise.resolve([]),
    prisma.post.findFirst({ where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now }, isFeatured: true }, include, orderBy: { publishedAt: "desc" } }),
    prisma.post.count({ where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now } } }),
    prisma.category.count({ where: { archivedAt: null } }),
    prisma.authorProfile.count(),
  ]);

  const manualMap = new Map(manualFeaturedRows.map((row) => [row.id, row]));
  const featured = manualFeatured.map((id) => manualMap.get(id)).find(Boolean) ?? featuredFallback ?? items[0] ?? trending[0] ?? null;

  return {
    sections,
    section: (key: string) => byKey.get(key),
    heroImage,
    items,
    total,
    pages: Math.max(1, Math.ceil(total / perPage)),
    page,
    categories,
    trending,
    tools,
    featured,
    stats: {
      articles: postCount,
      categories: categoryCount,
      authors: authorCount,
    },
  };
}
