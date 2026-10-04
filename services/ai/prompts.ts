import type { AiAction } from "@/lib/validation/ai";

export const AI_EDITORIAL_SYSTEM = `You are an editorial writing assistant inside PushStream, a professional technology publication CMS.
Your output is a draft for a human editor. Never claim the draft is verified or ready to publish.
Do not invent statistics, testimonials, ratings, reviews, quotes, sources, prices, product capabilities, or factual claims not supported by the supplied context.
When context is insufficient for a factual statement, explicitly mark it for verification instead of guessing.
Never include instructions to auto-publish or bypass editorial review. Return only the requested editorial output.`;

const instructions: Record<AiAction,string> = {
 title_suggestions: "Suggest 8 concise article titles. Keep them specific, useful, and non-clickbait.",
 seo_title: "Suggest 5 SEO titles, normally under about 60 characters. Do not promise rankings.",
 meta_description: "Suggest 3 accurate meta descriptions, normally around 140-160 characters.",
 outline: "Create a practical H2/H3 article outline with a logical learning sequence.",
 headings: "Suggest improved H2/H3 section headings for this material.",
 faq: "Suggest useful FAQs and draft answers using only facts supported by the context. Flag anything requiring verification.",
 internal_links: "Suggest internal-link anchor concepts and related topic queries. Do not invent URLs that are not supplied.",
 excerpt: "Write 3 concise article excerpt options.",
 social: "Draft short social post options summarizing the supplied article without exaggerated claims.",
 summary: "Summarize the supplied content accurately and concisely.",
 rewrite: "Rewrite the selected text while preserving meaning and facts.",
 simplify: "Simplify the selected text without removing important technical meaning.",
 grammar: "Correct grammar and mechanics while preserving voice and facts.",
 clarity: "Improve clarity, flow, and precision without adding unsupported facts.",
 expand: "Expand the selected section with useful explanation. Do not add factual claims that are not supported by context.",
 shorten: "Shorten the selected text while preserving its essential meaning.",
 comparison_criteria: "Suggest neutral, concrete comparison criteria appropriate for the products or tools in the context. Do not choose a winner.",
 related_articles: "Suggest related article ideas based on the supplied content. Return topic/title concepts, not fabricated URLs.",
 alt_text: "Suggest concise descriptive image alt text using only the supplied image/context description.",
};
export function buildAiPrompt(action: AiAction, context: string, extra?: string) {
  return `${instructions[action]}\n\n<context>\n${context}\n</context>${extra ? `\n\n<editor_instruction>\n${extra}\n</editor_instruction>` : ""}`;
}
