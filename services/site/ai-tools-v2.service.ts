import { prisma } from "@/lib/db/prisma";
import { aiToolService } from "@/services/ai-tools/ai-tool.service";
import { isPublicSectionVisible } from "@/lib/site/section-visibility";

type Section = {
  sectionKey: string;
  sectionType: string;
  enabled: boolean;
  heading: string | null;
  description: string | null;
  sortOrder: number;
  imageId: string | null;
  itemCount: number | null;
  config: Record<string, unknown>;
  items: Array<{ title: string | null; subtitle: string | null; body: string | null; icon: string | null; url: string | null; sortOrder: number }>;
};

function config(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function manualSelection(section: Section | undefined) {
  const value = section?.config.manualSelection;
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
}

export async function getAiToolsV2Page(raw: Record<string, string | undefined>) {
  const now = new Date();
  const [list, sectionRows, publishedTotal, freeTotal, categories, latestReviews] = await Promise.all([
    aiToolService.publicList(raw),
    prisma.publicPageSection.findMany({
      where: { pageKey: "ai-tools", enabled: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { items: { where: { enabled: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
    }),
    prisma.aiTool.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    prisma.aiTool.count({ where: { status: "PUBLISHED", deletedAt: null, OR: [{ pricingModel: "FREE" }, { pricingModel: "FREEMIUM" }, { freeTrial: true }] } }),
    prisma.aiToolCategory.findMany({
      where: { tools: { some: { status: "PUBLISHED", deletedAt: null } } },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: { select: { tools: { where: { status: "PUBLISHED", deletedAt: null } } } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.review.findMany({
      where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now }, aiToolId: { not: null } },
      include: { aiTool: { include: { category: true, logo: true } } },
      orderBy: { publishedAt: "desc" },
      take: 8,
    }),
  ]);

  const visibleSectionRows = sectionRows.filter((row) => isPublicSectionVisible(row.config, now));
  const sections: Section[] = visibleSectionRows.map((row) => ({
    ...row,
    config: config(row.config),
    items: row.items.map((item) => ({
      title: item.title,
      subtitle: item.subtitle,
      body: item.body,
      icon: item.icon,
      url: item.url,
      sortOrder: item.sortOrder,
    })),
  }));
  const byKey = new Map(sections.map((section) => [section.sectionKey, section]));

  const topSection = byKey.get("top-tools");
  const selectedFeaturedIds = manualSelection(topSection);
  const selectedRows = selectedFeaturedIds.length ? await prisma.aiTool.findMany({
    where: { id: { in: selectedFeaturedIds }, status: "PUBLISHED", deletedAt: null },
    include: { category: true, logo: true, features: { take: 3, orderBy: { sortOrder: "asc" } }, useCases: { take: 3, orderBy: { sortOrder: "asc" } } },
  }) : [];
  const selectedMap = new Map(selectedRows.map((tool) => [tool.id, tool]));
  const manualTop = selectedFeaturedIds.map((id) => selectedMap.get(id)).filter((tool): tool is (typeof selectedRows)[number] => tool != null);
  const topTools = manualTop.length ? manualTop : await aiToolService.featured();

  const hero = byKey.get("hero");
  const heroImage = hero?.imageId
    ? await prisma.media.findFirst({ where: { id: hero.imageId, deletedAt: null } })
    : null;

  return {
    list,
    sections,
    section: (key: string) => byKey.get(key),
    heroImage,
    topTools,
    categories,
    latestReviews,
    stats: {
      tools: publishedTotal,
      categories: categories.length,
      free: freeTotal,
      verified: await prisma.aiTool.count({ where: { status: "PUBLISHED", deletedAt: null, verified: true } }),
    },
  };
}
