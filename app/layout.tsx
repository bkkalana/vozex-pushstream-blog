import type { Metadata } from "next";
import { Inter, Manrope, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import Script from "next/script";
import { env } from "@/lib/env";
import { getSeoSiteConfig } from "@/lib/seo/site";
import { appearanceVariablesFromSettings, getSettingsMap } from "@/services/system/settings.service";
import "./globals.css";

export const revalidate = 300;

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets:["latin"], variable:"--font-manrope", display:"swap", preload:false });
const jakarta = Plus_Jakarta_Sans({ subsets:["latin"], variable:"--font-jakarta", display:"swap", preload:false });

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
    ...(seo.favicon?{icons:{icon:[{url:"/branding/favicon-512.png",type:"image/png",sizes:"512x512"},{url:seo.favicon,type:"image/x-icon"}],apple:"/branding/apple-touch-icon.png"}}:{}),
    ...((seo.googleSiteVerification || seo.bingSiteVerification)?{verification:{...(seo.googleSiteVerification?{google:seo.googleSiteVerification}:{}),...(seo.bingSiteVerification?{other:{"msvalidate.01":seo.bingSiteVerification}}:{})}}:{}),
    category:"technology",
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [settings, integrations] = await Promise.all([
    getSettingsMap("appearance").catch(() => new Map<string,unknown>()),
    getSettingsMap("integrations").catch(() => new Map<string,unknown>()),
  ]);
  const appearance = appearanceVariablesFromSettings(settings);
  const font = String(settings.get("appearance.fontFamily") ?? "Inter");
  const fontVar = font === "Manrope" ? "var(--font-manrope)" : font === "Plus Jakarta Sans" ? "var(--font-jakarta)" : "var(--font-inter)";
  const googleAnalyticsId = String(integrations.get("analytics.googleAnalyticsId") ?? "G-CT25S0HK0Y").trim();
  const validGoogleAnalyticsId = /^G-[A-Z0-9]+$/i.test(googleAnalyticsId) ? googleAnalyticsId : "";
  return <html lang="en"><body className={`${inter.variable} ${manrope.variable} ${jakarta.variable}`} style={{...appearance,"--site-font":fontVar} as React.CSSProperties}>{children}<Toaster richColors closeButton position="top-right" />{validGoogleAnalyticsId ? <><Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(validGoogleAnalyticsId)}`} strategy="afterInteractive"/><Script id="google-analytics" strategy="afterInteractive">{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${validGoogleAnalyticsId}');`}</Script></> : null}</body></html>;
}
