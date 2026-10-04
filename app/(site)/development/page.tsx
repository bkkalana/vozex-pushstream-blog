export const revalidate = 300;

import { TopicLandingPage, type TopicPreset } from "@/components/site/v2/pages/topic-landing-page";

const preset: TopicPreset = {
  pageKey: "development", rootCategorySlug: "development", eyebrow: "CODE. DEBUG. DEPLOY.", heading: "Web Development", accentText: "Build With Confidence.", description: "Practical JavaScript, TypeScript, React, Next.js, Node.js, APIs, databases, debugging and deployment tutorials for real projects.", searchPlaceholder: "Search development guides...", primaryCta: "Browse Development Guides", secondaryCta: { label: "Explore Resources", href: "/resources" }, fallbackTopics: ["JavaScript","TypeScript","React","Next.js","Node.js","APIs","MySQL","Debugging"], heroTheme: "development"
};

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <TopicLandingPage preset={preset} searchParams={searchParams} />;
}
