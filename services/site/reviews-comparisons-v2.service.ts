import { prisma } from "@/lib/db/prisma";
import { pageSectionsService } from "@/services/site/page-sections.service";

export async function getReviewsLandingData({ q = "", page = 1, limit = 12 }: { q?: string; page?: number; limit?: number }) {
  const now = new Date();
  const where = {
    status: "PUBLISHED" as const,
    deletedAt: null,
    publishedAt: { lte: now },
    ...(q ? { OR: [{ title: { contains: q } }, { bestFor: { contains: q } }] } : {}),
  };
  const [sections, reviews, total, comparisons, categories] = await Promise.all([
    pageSectionsService.listPublic("reviews"),
    prisma.review.findMany({
      where,
      include: {
        aiTool: { include: { category: true, logo: true } },
        ratings: true,
        products: { orderBy: { sortOrder: "asc" }, take: 3 },
        screenshots: { include: { media: { include: { variants: true } } }, orderBy: { sortOrder: "asc" }, take: 1 },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where }),
    prisma.comparison.findMany({
      where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now } },
      include: { items: { orderBy: { sortOrder: "asc" } } },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
    prisma.aiToolCategory.findMany({
      include: { _count: { select: { tools: { where: { status: "PUBLISHED", deletedAt: null } } } } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: 10,
    }),
  ]);
  return { sections, reviews, total, page, pages: Math.max(1, Math.ceil(total / limit)), comparisons, categories };
}

export async function getComparisonsLandingData({ q = "", page = 1, limit = 12 }: { q?: string; page?: number; limit?: number }) {
  const now = new Date();
  const where = {
    status: "PUBLISHED" as const,
    deletedAt: null,
    publishedAt: { lte: now },
    ...(q ? { title: { contains: q } } : {}),
  };
  const [sections, comparisons, total, reviews] = await Promise.all([
    pageSectionsService.listPublic("comparisons"),
    prisma.comparison.findMany({
      where,
      include: {
        items: { orderBy: { sortOrder: "asc" } },
        features: { orderBy: { sortOrder: "asc" }, take: 6 },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.comparison.count({ where }),
    prisma.review.findMany({
      where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: now } },
      include: { aiTool: true, ratings: true },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
  ]);
  return { sections, comparisons, total, page, pages: Math.max(1, Math.ceil(total / limit)), reviews };
}
