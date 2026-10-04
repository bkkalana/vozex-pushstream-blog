import type { Metadata } from "next";
import { Inter, Manrope, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { env } from "@/lib/env";
import { getSeoSiteConfig } from "@/lib/seo/site";
import { appearanceVariablesFromSettings, getSettingsMap } from "@/services/system/settings.service";
import "./globals.css";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets:["latin"], variable:"--font-manrope", display:"swap" });
const jakarta = Plus_Jakarta_Sans({ subsets:["latin"], variable:"--font-jakarta", display:"swap" });

export async function generateMetadata():Promise<Metadata>{
  const seo=await getSeoSiteConfig();
  return {
    metadataBase:new URL(env.SITE_URL),
    title:{default:seo.defaultTitle,template:`%s | ${seo.siteName}`},
    description:seo.defaultDescription,
    alternates:{types:{"application/rss+xml":"/rss.xml"}},
    robots:{index:seo.robotsIndex,follow:seo.robotsFollow},
    openGraph:{type:"website",siteName:seo.siteName,title:seo.defaultTitle,description:seo.defaultDescription,url:env.SITE_URL,...(seo.defaultOgImage?{images:[seo.defaultOgImage]}:{})},
    twitter:{card:seo.twitterCard,title:seo.defaultTitle,description:seo.defaultDescription,...(seo.defaultOgImage?{images:[seo.defaultOgImage]}:{})},
    ...(seo.favicon?{icons:{icon:seo.favicon}}:{}),
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettingsMap("appearance").catch(() => new Map<string,unknown>());
  const appearance = appearanceVariablesFromSettings(settings);
  const font = String(settings.get("appearance.fontFamily") ?? "Inter");
  const fontVar = font === "Manrope" ? "var(--font-manrope)" : font === "Plus Jakarta Sans" ? "var(--font-jakarta)" : "var(--font-inter)";
  return <html lang="en"><body className={`${inter.variable} ${manrope.variable} ${jakarta.variable}`} style={{...appearance,"--site-font":fontVar} as React.CSSProperties}>{children}<Toaster richColors closeButton position="top-right" /></body></html>;
}
