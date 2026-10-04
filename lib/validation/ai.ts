import { z } from "zod";

export const aiActionSchema = z.enum([
  "title_suggestions", "seo_title", "meta_description", "outline", "headings", "faq",
  "internal_links", "excerpt", "social", "summary", "rewrite", "simplify", "grammar",
  "clarity", "expand", "shorten", "comparison_criteria", "related_articles", "alt_text",
]);

export type AiAction = z.infer<typeof aiActionSchema>;

export const aiGenerateSchema = z.object({
  action: aiActionSchema,
  postId: z.string().cuid().optional(),
  context: z.string().trim().min(1).max(40000),
  instruction: z.string().trim().max(2000).optional(),
});

export const aiSettingsSchema = z.object({
  enabled: z.boolean(),
  provider: z.enum(["OPENAI", "ANTHROPIC", "GEMINI", "LOCAL"]),
  model: z.string().trim().min(1).max(160),
  maxTokens: z.number().int().min(128).max(16000),
  dailyLimit: z.number().int().min(1).max(100000),
  perUserDailyLimit: z.number().int().min(1).max(10000),
  featureRewrite: z.boolean(),
  featureMetadata: z.boolean(),
  featureOutline: z.boolean(),
  featureFaq: z.boolean(),
  featureLinks: z.boolean(),
});
