import { prisma } from "@/lib/db/prisma";
import { getPageDefinition, type PublicPageKey } from "@/lib/site/page-section-registry";
import { isPublicSectionVisible } from "@/lib/site/section-visibility";

export type TopicLandingSection = {
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
  items: Array<{
    title: string | null;
    subtitle: string | null;
    body: string | null;
    icon: string | null;
    url: string | null;
    sortOrder: number;
  }>;
};

function toConfig(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function defaultSections(pageKey: PublicPageKey): TopicLandingSection[] {
  const definition = getPageDefinition(pageKey);
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

function manualIds(section: TopicLandingSection | undefined) {
  const selection = section?.config.manualSelection;
  return Array.isArray(selection)
    ? selection.filter((value): value is string => typeof value === "string")
    : [];
}

export async function getTopicLandingV2Data({
  pageKey,
  rootCategorySlug,
  page,
  query,
  topic,
}: {
  pageKey: PublicPageKey;
  rootCategorySlug: string;
  page: number;
  query?: string;
  topic?: string;
}) {
  const now = new Date();

  const rows = await prisma.publicPageSection.findMany({
    where: { pageKey, enabled: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      items: {
        where: { enabled: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  const visibleRows = rows.filter((row) => isPublicSectionVisible(row.config, now));
  const sections: TopicLandingSection[] = rows.length
    ? visibleRows.map((row) => ({
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
      }))
    : defaultSections(pageKey);

  const byKey = new Map(sections.map((section) => [section.sectionKey, section]));
  const hero = byKey.get("hero");
  const articlesSection = byKey.get("articles");
  const featuredGuideSection = byKey.get("featured-guide");

  const rootCategory = await prisma.category.findFirst({
    where: { slug: rootCategorySlug, archivedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      children: {
        where: { archivedAt: null },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { id: true, name: true, slug: true, description: true, icon: true },
      },
    },
  });

  const scopedCategories = rootCategory ? [rootCategory, ...rootCategory.children] : [];
  const scopedCategoryIds = scopedCategories.map((category) => category.id);
  const topicCategory = topic
    ? scopedCategories.find((category) => category.slug === topic)
    : undefined;

  const perPage = Math.min(24, Math.max(6, articlesSection?.itemCount ?? 12));
  const categoryIds = topicCategory ? [topicCategory.id] : scopedCategoryIds;

  const baseWhere = {
    status: "PUBLISHED" as const,
    deletedAt: null,
    publishedAt: { lte: now },
    ...(categoryIds.length
      ? { categoryId: { in: categoryIds } }
      : { category: { slug: rootCategorySlug } }),
    ...(query ? {
      OR: [
        { title: { contains: query } },
        { excerpt: { contains: query } },
        { subtitle: { contains: query } },
      ],
    } : {}),
  };

  const include = {
    category: true,
    author: { include: { authorProfile: true } },
    featuredImage: true,
  };

  const selectedFeaturedIds = manualIds(featuredGuideSection);

  const [items,total,trending,heroImage,selectedFeaturedRows,featuredFallback,publishedCount,categoryCounts] = await Promise.all([
    prisma.post.findMany({ where: baseWhere, include, orderBy: { publishedAt: "desc" }, skip: (page - 1) * perPage, take: perPage }),
    prisma.post.count({ where: baseWhere }),
    prisma.post.findMany({
      where: {
        status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now },
        ...(scopedCategoryIds.length ? { categoryId: { in: scopedCategoryIds } } : { category: { slug: rootCategorySlug } }),
      },
      include,
      orderBy: [{ isTrending: "desc" }, { views: "desc" }, { publishedAt: "desc" }],
      take: 5,
    }),
    hero?.imageId ? prisma.media.findFirst({ where: { id: hero.imageId, deletedAt: null } }) : Promise.resolve(null),
    selectedFeaturedIds.length ? prisma.post.findMany({
      where: {
        id: { in: selectedFeaturedIds }, status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now },
        ...(scopedCategoryIds.length ? { categoryId: { in: scopedCategoryIds } } : {}),
      }, include,
    }) : Promise.resolve([]),
    prisma.post.findFirst({
      where: {
        status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now }, isFeatured: true,
        ...(scopedCategoryIds.length ? { categoryId: { in: scopedCategoryIds } } : { category: { slug: rootCategorySlug } }),
      }, include, orderBy: { publishedAt: "desc" },
    }),
    prisma.post.count({
      where: {
        status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now },
        ...(scopedCategoryIds.length ? { categoryId: { in: scopedCategoryIds } } : { category: { slug: rootCategorySlug } }),
      },
    }),
    rootCategory ? prisma.category.findMany({
      where: { id: { in: scopedCategoryIds } },
      select: {
        id: true, slug: true, name: true, description: true, icon: true,
        _count: { select: { posts: { where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now } } } } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }) : Promise.resolve([]),
  ]);

  const selectedFeaturedMap = new Map(selectedFeaturedRows.map((row) => [row.id, row]));
  const featured = selectedFeaturedIds.map((id) => selectedFeaturedMap.get(id)).find(Boolean)
    ?? featuredFallback ?? items[0] ?? trending[0] ?? null;

  return {
    sections,
    section: (key: string) => byKey.get(key),
    heroImage,
    rootCategory,
    categories: categoryCounts,
    items,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / perPage)),
    trending,
    featured,
    stats: { articles: publishedCount, topics: Math.max(1, rootCategory?.children.length ?? 0) },
  };
}
