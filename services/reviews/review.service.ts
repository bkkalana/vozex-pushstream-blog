import { Prisma, ReviewDimension } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { uniqueSlug } from "@/lib/cms/slug";
import { reviewSchema } from "@/lib/validation/reviews";
import { auditService } from "@/services/audit/audit.service";
import type { CurrentSession } from "@/lib/auth/session";

const dims: ReviewDimension[] = ["OVERALL","EASE_OF_USE","FEATURES","PERFORMANCE","SUPPORT","VALUE_FOR_MONEY"];
const doc = (text: string): Prisma.InputJsonValue => ({
  type: "doc",
  content: text.split(/\n\n+/).filter(Boolean).map((value) => ({
    type: "paragraph",
    content: [{ type: "text", text: value.trim() }],
  })),
});

async function exists(slug: string, except?: string) {
  return !!await prisma.review.findFirst({
    where: { slug, ...(except ? { id: { not: except } } : {}) },
    select: { id: true },
  });
}

function fullInclude() {
  return {
    aiTool: { include: { category: true, logo: true } },
    author: { include: { authorProfile: true } },
    ratings: true,
    screenshots: {
      include: { media: { include: { variants: true } } },
      orderBy: { sortOrder: "asc" as const },
    },
    alternatives: {
      include: { aiTool: true },
      orderBy: { sortOrder: "asc" as const },
    },
    products: {
      include: { media: true },
      orderBy: { sortOrder: "asc" as const },
    },
  };
}

function productRows(reviewId: string, products: ReturnType<typeof reviewSchema.parse>["products"]) {
  return products.map((product, sortOrder) => ({
    reviewId,
    name: product.name,
    label: product.label || null,
    description: product.description || null,
    bestFor: product.bestFor || null,
    pricing: product.pricing || null,
    rating: product.rating ?? null,
    pros: product.pros,
    cons: product.cons,
    productUrl: product.productUrl || null,
    affiliateUrl: product.affiliateUrl || null,
    mediaId: product.mediaId || null,
    sortOrder,
  }));
}

export const reviewService = {
  async list({ q = "", status = "", page = 1, limit = 20 }: { q?: string; status?: string; page?: number; limit?: number }) {
    const where: Prisma.ReviewWhereInput = {
      deletedAt: null,
      ...(q ? { OR: [{ title: { contains: q } }, { bestFor: { contains: q } }] } : {}),
      ...(status ? { status: status as any } : {}),
    };
    const [items, total] = await prisma.$transaction([
      prisma.review.findMany({
        where,
        include: { aiTool: true, ratings: true, _count: { select: { products: true } } },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);
    return { items, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
  },

  get: (id: string) => prisma.review.findUnique({ where: { id }, include: fullInclude() }),

  async create(raw: unknown, session: CurrentSession) {
    const value = reviewSchema.parse(raw);
    const slug = await uniqueSlug(value.slug || value.title, (candidate) => exists(candidate));
    const row = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          title: value.title,
          slug,
          aiToolId: value.aiToolId || null,
          authorId: session.user.id,
          content: doc(value.contentText),
          bestFor: value.bestFor || null,
          pricing: value.pricing || null,
          pros: value.pros,
          cons: value.cons,
          officialUrl: value.officialUrl || null,
          affiliateUrl: value.affiliateUrl || null,
          faq: value.faq,
          verdict: value.verdict || null,
          disclosureType: value.disclosureType,
          disclosureText: value.disclosureText || null,
          status: value.status,
          publishedAt: value.status === "PUBLISHED"
            ? (value.publishedAt ? new Date(value.publishedAt) : new Date())
            : value.publishedAt ? new Date(value.publishedAt) : null,
        },
      });

      const ratings = dims.flatMap((dimension) => value.ratings[dimension] != null
        ? [{ reviewId: review.id, dimension, score: value.ratings[dimension]! }]
        : []);
      if (ratings.length) await tx.reviewRating.createMany({ data: ratings });
      if (value.screenshotIds.length) {
        await tx.reviewScreenshot.createMany({
          data: value.screenshotIds.map((mediaId, sortOrder) => ({ reviewId: review.id, mediaId, sortOrder })),
        });
      }
      if (value.alternatives.length) {
        await tx.reviewAlternative.createMany({
          data: value.alternatives.map((alternative, sortOrder) => ({
            reviewId: review.id,
            aiToolId: alternative.aiToolId || null,
            name: alternative.name,
            url: alternative.url || null,
            affiliateUrl: alternative.affiliateUrl || null,
            note: alternative.note || null,
            sortOrder,
          })),
        });
      }
      if (value.products.length) {
        await tx.reviewProduct.createMany({ data: productRows(review.id, value.products) });
      }
      return review;
    });
    await auditService.record({ userId: session.user.id, action: "review.create", entityType: "Review", entityId: row.id });
    return row;
  },

  async update(id: string, raw: unknown, session: CurrentSession) {
    const value = reviewSchema.parse(raw);
    const current = await prisma.review.findUnique({ where: { id } });
    if (!current) return null;
    const slug = await uniqueSlug(value.slug || value.title, (candidate) => exists(candidate, id), current.slug);

    const row = await prisma.$transaction(async (tx) => {
      await Promise.all([
        tx.reviewRating.deleteMany({ where: { reviewId: id } }),
        tx.reviewScreenshot.deleteMany({ where: { reviewId: id } }),
        tx.reviewAlternative.deleteMany({ where: { reviewId: id } }),
        tx.reviewProduct.deleteMany({ where: { reviewId: id } }),
      ]);

      const review = await tx.review.update({
        where: { id },
        data: {
          title: value.title,
          slug,
          aiToolId: value.aiToolId || null,
          authorId: current.authorId || session.user.id,
          content: doc(value.contentText),
          bestFor: value.bestFor || null,
          pricing: value.pricing || null,
          pros: value.pros,
          cons: value.cons,
          officialUrl: value.officialUrl || null,
          affiliateUrl: value.affiliateUrl || null,
          faq: value.faq,
          verdict: value.verdict || null,
          disclosureType: value.disclosureType,
          disclosureText: value.disclosureText || null,
          status: value.status,
          publishedAt: value.status === "PUBLISHED"
            ? (value.publishedAt ? new Date(value.publishedAt) : current.publishedAt || new Date())
            : value.publishedAt ? new Date(value.publishedAt) : null,
        },
      });

      const ratings = dims.flatMap((dimension) => value.ratings[dimension] != null
        ? [{ reviewId: id, dimension, score: value.ratings[dimension]! }]
        : []);
      if (ratings.length) await tx.reviewRating.createMany({ data: ratings });
      if (value.screenshotIds.length) {
        await tx.reviewScreenshot.createMany({
          data: value.screenshotIds.map((mediaId, sortOrder) => ({ reviewId: id, mediaId, sortOrder })),
        });
      }
      if (value.alternatives.length) {
        await tx.reviewAlternative.createMany({
          data: value.alternatives.map((alternative, sortOrder) => ({
            reviewId: id,
            aiToolId: alternative.aiToolId || null,
            name: alternative.name,
            url: alternative.url || null,
            affiliateUrl: alternative.affiliateUrl || null,
            note: alternative.note || null,
            sortOrder,
          })),
        });
      }
      if (value.products.length) {
        await tx.reviewProduct.createMany({ data: productRows(id, value.products) });
      }
      return review;
    });

    await auditService.record({ userId: session.user.id, action: "review.update", entityType: "Review", entityId: id });
    return row;
  },

  async remove(id: string, session: CurrentSession) {
    const review = await prisma.review.update({ where: { id }, data: { status: "ARCHIVED" } });
    await auditService.record({ userId: session.user.id, action: "review.archive", entityType: "Review", entityId: id });
    return review;
  },

  publicList: () => prisma.review.findMany({
    where: { status: "PUBLISHED", deletedAt: null, publishedAt: { lte: new Date() } },
    include: {
      aiTool: { include: { category: true, logo: true } },
      author: { include: { authorProfile: true } },
      ratings: true,
      products: { orderBy: { sortOrder: "asc" }, take: 3 },
    },
    orderBy: { publishedAt: "desc" },
  }),

  publicGet: (slug: string) => prisma.review.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null, publishedAt: { lte: new Date() } },
    include: fullInclude(),
  }),
};
