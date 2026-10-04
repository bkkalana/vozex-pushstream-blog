import { z } from "zod";

const nullableUrl = z.union([z.string().url(), z.literal(""), z.null()]).optional();
const stringList = z.array(z.string().trim().min(1).max(160)).max(50).default([]);

export const aiToolCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().max(120).optional().default(""),
  description: z.string().trim().max(1000).optional().default(""),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const aiToolSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(180).optional().default(""),
  logoId: z.string().cuid().nullable().optional(),
  websiteUrl: z.string().url(),
  affiliateUrl: nullableUrl,
  shortDescription: z.string().trim().min(20).max(600),
  fullDescriptionText: z.string().trim().min(20).max(30000),
  categoryId: z.string().cuid(),
  pricingModel: z.enum(["FREE","FREEMIUM","PAID","FREE_TRIAL","ENTERPRISE"]),
  startingPrice: z.union([z.coerce.number().min(0).max(9999999), z.null()]).optional(),
  currency: z.union([z.string().trim().length(3).transform(v=>v.toUpperCase()), z.literal(""), z.null()]).optional(),
  rating: z.union([z.coerce.number().min(0).max(5), z.null()]).optional(),
  reviewCount: z.coerce.number().int().min(0).max(100000000).default(0),
  pros: stringList,
  cons: stringList,
  platforms: stringList,
  integrations: stringList,
  useCases: stringList,
  features: z.array(z.object({name:z.string().trim().min(1).max(160),description:z.string().trim().max(800).optional().default("")})).max(50).default([]),
  screenshotIds: z.array(z.string().cuid()).max(12).default([]),
  apiAvailable: z.boolean().default(false),
  freeTrial: z.boolean().default(false),
  featured: z.boolean().default(false),
  verified: z.boolean().default(false),
  status: z.enum(["DRAFT","PUBLISHED","ARCHIVED"]).default("DRAFT"),
  lastReviewedAt: z.union([z.string().datetime(), z.literal(""), z.null()]).optional(),
  pricingVerifiedAt: z.union([z.string().datetime(), z.literal(""), z.null()]).optional(),
  officialUrlVerifiedAt: z.union([z.string().datetime(), z.literal(""), z.null()]).optional(),
  featuresVerifiedAt: z.union([z.string().datetime(), z.literal(""), z.null()]).optional(),
  alternativeIds: z.array(z.string().cuid()).max(12).default([]),
});

export const aiToolListQuerySchema=z.object({
  q:z.string().trim().max(120).optional().default(""),
  category:z.string().trim().max(120).optional().default(""),
  pricing:z.enum(["","FREE","FREEMIUM","PAID","FREE_TRIAL","ENTERPRISE"]).optional().default(""),
  minRating:z.coerce.number().min(0).max(5).optional(),
  platform:z.string().trim().max(80).optional().default(""),
  useCase:z.string().trim().max(100).optional().default(""),
  freeTrial:z.enum(["","yes"]).optional().default(""),
  sort:z.enum(["top-rated","most-popular","newest","recently-updated","price-low","price-high"]).optional().default("top-rated"),
  page:z.coerce.number().int().min(1).default(1),
  limit:z.coerce.number().int().min(1).max(48).default(12),
});
