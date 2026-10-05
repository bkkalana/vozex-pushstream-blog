import {z} from "zod";
import {PUBLIC_PAGE_KEYS,PUBLIC_SECTION_TYPES} from "@/lib/site/page-section-registry";
const safeUrl=z.string().trim().max(1000).refine(v=>!v||v.startsWith("/")||/^https?:\/\//i.test(v),"Use an internal /path or an http(s) URL.");
export const publicPageSectionInput=z.object({
  pageKey:z.enum(PUBLIC_PAGE_KEYS),sectionKey:z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/),sectionType:z.enum(PUBLIC_SECTION_TYPES),
  enabled:z.boolean(),heading:z.string().trim().max(255).nullable(),description:z.string().trim().max(10000).nullable(),
  sortOrder:z.number().int().min(0).max(100000),dataSource:z.string().trim().max(80).nullable(),itemCount:z.number().int().min(1).max(50).nullable(),imageId:z.string().trim().max(191).nullable(),
  config:z.object({eyebrow:z.string().max(160).optional(),accentText:z.string().max(255).optional(),primaryCtaLabel:z.string().max(120).optional(),primaryCtaUrl:safeUrl.optional(),secondaryCtaLabel:z.string().max(120).optional(),secondaryCtaUrl:safeUrl.optional(),stylePreset:z.enum(["white","soft","navy","gradient"]).optional(),mobileImageId:z.string().trim().max(191).optional(),heroImageAlt:z.string().trim().max(255).optional(),heroImagePosition:z.enum(["center","top","bottom","left","right"]).optional(),heroMobileImagePosition:z.enum(["center","top","bottom","left","right"]).optional(),heroOverlay:z.number().min(0).max(80).optional(),manualSelection:z.array(z.string().max(191)).max(50).optional()}).passthrough(),
});
export const publicPageSectionItemInput=z.object({sectionId:z.string().min(1),itemKey:z.string().trim().max(100).nullable(),title:z.string().trim().max(255).nullable(),subtitle:z.string().trim().max(255).nullable(),body:z.string().trim().max(10000).nullable(),icon:z.string().trim().max(80).nullable(),imageId:z.string().trim().max(191).nullable(),url:safeUrl.nullable(),sortOrder:z.number().int().min(0).max(100000),enabled:z.boolean(),config:z.record(z.string(),z.unknown())});
