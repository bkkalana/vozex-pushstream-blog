import { AnnouncementBar } from "@/components/site/announcement-bar";
import { JsonLd } from "@/components/site/json-ld";import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getActiveAnnouncement } from "@/services/platform/announcement.service";
import { isFeatureEnabled } from "@/services/platform/feature-flags.service";
import { getSeoSiteConfig } from "@/lib/seo/site";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [site,announcementEnabled,announcement]=await Promise.all([getSeoSiteConfig(),isFeatureEnabled("announcement-bar",false),getActiveAnnouncement()]);
  const schemas=[organizationSchema({name:site.siteName,logo:site.logo}),websiteSchema(site.siteName,site.alternateName)];
  return <>{schemas.map((schema,i)=><JsonLd key={i} value={schema}/>)}<a href="#main-content" className="skip-link">Skip to main content</a>{announcementEnabled&&announcement?<AnnouncementBar id={announcement.id} message={announcement.message} linkUrl={announcement.linkUrl} linkLabel={announcement.linkLabel} dismissible={announcement.dismissible}/>:null}<SiteHeader /><main id="main-content" tabIndex={-1}>{children}</main><SiteFooter /></>;
}
