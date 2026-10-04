export const revalidate = 300;

import { TopicLandingPage, type TopicPreset } from "@/components/site/v2/pages/topic-landing-page";

const preset: TopicPreset = {
  pageKey: "wordpress", rootCategorySlug: "wordpress", eyebrow: "WORDPRESS HELP, WITHOUT THE GUESSWORK", heading: "WordPress Fixes", accentText: "Solve Problems Faster.", description: "Troubleshoot WordPress errors, improve performance, fix plugin and theme issues, strengthen security and manage your site with confidence.", searchPlaceholder: "Search WordPress fixes...", primaryCta: "Browse WordPress Fixes", secondaryCta: { label: "Latest Articles", href: "/latest" }, fallbackTopics: ["Error Fixes","Performance & Speed","Plugin Issues","Themes","Security","Database","Site Management","WordPress Updates"], heroTheme: "wordpress"
};

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <TopicLandingPage preset={preset} searchParams={searchParams} />;
}
