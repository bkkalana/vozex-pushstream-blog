export const revalidate = 300;

import { TopicLandingPage, type TopicPreset } from "@/components/site/v2/pages/topic-landing-page";

const preset: TopicPreset = {
  pageKey: "online-business", rootCategorySlug: "online-business", eyebrow: "BUILD. GROW. MONETIZE.", heading: "Online Business", accentText: "Grow Smarter.", description: "Practical guides for blogging, SEO, affiliate marketing, display ads, digital products, automation and sustainable online growth.", searchPlaceholder: "Search online business guides...", primaryCta: "Browse Growth Guides", secondaryCta: { label: "Explore AI Tools", href: "/ai-tools" }, fallbackTopics: ["Blogging","SEO","Affiliate Marketing","Display Ads","Digital Products","Automation","Email Marketing","Hosting"], heroTheme: "business"
};

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <TopicLandingPage preset={preset} searchParams={searchParams} />;
}
