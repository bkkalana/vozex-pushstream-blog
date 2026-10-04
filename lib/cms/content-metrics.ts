export function extractPlainText(content: unknown): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map(extractPlainText).join(" ");
  if (typeof content === "object") return Object.values(content as Record<string, unknown>).map(extractPlainText).join(" ");
  return "";
}
export function contentMetrics(content: unknown, wordsPerMinute = 220) {
  const words = extractPlainText(content).trim().split(/\s+/).filter(Boolean).length;
  return { wordCount: words, readingTime: words === 0 ? 0 : Math.max(1, Math.ceil(words / wordsPerMinute)) };
}
