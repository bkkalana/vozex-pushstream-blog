import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";
import { getSeoSiteConfig, canonicalUrl } from "@/lib/seo/site";

export const dynamic = "force-dynamic";
export const revalidate=1800;
const esc=(v:string)=>v.replace(/[<>&'\"]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&apos;",'"':"&quot;"}[c]||c));
export async function GET(){
  const [site,posts]=await Promise.all([getSeoSiteConfig(),prisma.post.findMany({where:{status:"PUBLISHED",deletedAt:null,publishedAt:{lte:new Date()}},orderBy:{publishedAt:"desc"},take:50,include:{author:true,category:true}})]);
  const items=posts.map(p=>`<item><title>${esc(p.title)}</title><link>${esc(canonicalUrl(`/article/${p.slug}`))}</link><guid isPermaLink="true">${esc(canonicalUrl(`/article/${p.slug}`))}</guid>${p.excerpt?`<description>${esc(p.excerpt)}</description>`:""}${p.publishedAt?`<pubDate>${p.publishedAt.toUTCString()}</pubDate>`:""}<author>${esc(p.author.name)}</author>${p.category?`<category>${esc(p.category.name)}</category>`:""}</item>`).join("");
  const xml=`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(site.siteName)}</title><link>${esc(env.SITE_URL)}</link><description>${esc(site.defaultDescription)}</description><language>en</language><atom:link href="${esc(canonicalUrl(`/rss.xml`))}" rel="self" type="application/rss+xml"/><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}</channel></rss>`;
  return new Response(xml,{headers:{"content-type":"application/rss+xml; charset=utf-8","cache-control":"public, s-maxage=1800, stale-while-revalidate=3600"}})
}
