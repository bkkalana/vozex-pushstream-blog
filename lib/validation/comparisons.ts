import { z } from "zod";
const url=z.union([z.string().url(),z.literal(""),z.null()]).optional();
export const comparisonSchema=z.object({
  title:z.string().trim().min(3).max(220),slug:z.string().trim().max(240).optional().default(""),introduction:z.string().trim().max(5000).optional().default(""),
  status:z.enum(["DRAFT","REVIEW","SCHEDULED","PUBLISHED","ARCHIVED"]).default("DRAFT"),publishedAt:z.union([z.string().datetime(),z.literal(""),z.null()]).optional(),
  items:z.array(z.object({label:z.string().trim().min(1).max(80),productName:z.string().trim().min(1).max(160),productUrl:url,affiliateUrl:url})).min(2).max(3),
  features:z.array(z.object({feature:z.string().trim().min(1).max(160),valueType:z.enum(["TEXT","BOOLEAN","PRICING","RATING","BADGE"]).default("TEXT"),valueA:z.string().trim().max(2000).optional().default(""),valueB:z.string().trim().max(2000).optional().default(""),valueC:z.string().trim().max(2000).optional().default("")})).min(1).max(100)
});
