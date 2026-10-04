import { z } from "zod";
const url=z.union([z.string().url(),z.literal(""),z.null()]).optional();
const rating=z.union([z.coerce.number().min(0).max(5),z.null()]).optional();
export const reviewSchema=z.object({
 title:z.string().trim().min(3).max(220),slug:z.string().trim().max(240).optional().default(""),aiToolId:z.union([z.string().cuid(),z.literal(""),z.null()]).optional(),
 contentText:z.string().trim().min(20).max(50000),bestFor:z.string().trim().max(2000).optional().default(""),pricing:z.string().trim().max(4000).optional().default(""),officialUrl:url,affiliateUrl:url,
 verdict:z.string().trim().max(8000).optional().default(""),disclosureType:z.enum(["AFFILIATE","SPONSORED","FREE_REVIEW_COPY","INDEPENDENT_EDITORIAL"]).default("INDEPENDENT_EDITORIAL"),disclosureText:z.string().trim().max(2000).optional().default(""),status:z.enum(["DRAFT","REVIEW","SCHEDULED","PUBLISHED","ARCHIVED"]).default("DRAFT"),publishedAt:z.union([z.string().datetime(),z.literal(""),z.null()]).optional(),
 ratings:z.object({OVERALL:rating,EASE_OF_USE:rating,FEATURES:rating,PERFORMANCE:rating,SUPPORT:rating,VALUE_FOR_MONEY:rating}),
 pros:z.array(z.string().trim().min(1).max(400)).max(30).default([]),cons:z.array(z.string().trim().min(1).max(400)).max(30).default([]),
 faq:z.array(z.object({question:z.string().trim().min(3).max(500),answer:z.string().trim().min(3).max(4000)})).max(30).default([]),screenshotIds:z.array(z.string().cuid()).max(12).default([]),
 alternatives:z.array(z.object({aiToolId:z.union([z.string().cuid(),z.literal(""),z.null()]).optional(),name:z.string().trim().min(1).max(160),url,affiliateUrl:url,note:z.string().trim().max(1200).optional().default("")})).max(20).default([]),
 products:z.array(z.object({
   name:z.string().trim().min(1).max(160),
   label:z.string().trim().max(120).optional().default(""),
   description:z.string().trim().max(3000).optional().default(""),
   bestFor:z.string().trim().max(1000).optional().default(""),
   pricing:z.string().trim().max(1000).optional().default(""),
   rating:z.union([z.coerce.number().min(0).max(5),z.null()]).optional(),
   pros:z.array(z.string().trim().min(1).max(400)).max(20).default([]),
   cons:z.array(z.string().trim().min(1).max(400)).max(20).default([]),
   productUrl:url,affiliateUrl:url,
   mediaId:z.union([z.string().cuid(),z.literal(""),z.null()]).optional()
 })).max(30).default([])
});
