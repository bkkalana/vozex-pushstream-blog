export const revalidate = 300;

import { TopicLandingPage, type TopicPreset } from "@/components/site/v2/pages/topic-landing-page";

const preset: TopicPreset = {
  pageKey: "how-to", rootCategorySlug: "how-to", eyebrow: "CLEAR, STEP-BY-STEP GUIDES", heading: "How-To Guides", accentText: "Learn By Doing.", description: "Follow practical tutorials for setup, troubleshooting and optimization, written to be useful for beginners and experienced builders alike.", searchPlaceholder: "Search how-to guides...", primaryCta: "Browse How-To Guides", secondaryCta: { label: "Latest Articles", href: "/latest" }, fallbackTopics: ["Beginner","Intermediate","Advanced","Troubleshooting","Setup","Optimization"], heroTheme: "how-to"
};

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <TopicLandingPage preset={preset} searchParams={searchParams} />;
}
