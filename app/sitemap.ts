import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";
import { canonicalUrl } from "@/lib/seo/site";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [posts,pages,categories,tags,authors,tools,reviews,comparisons,collections,series,noindex] = await Promise.all([
    prisma.post.findMany({where:{status:"PUBLISHED",deletedAt:null,robotsIndex:true,publishedAt:{lte:now}},select:{slug:true,updatedAt:true}}),
    prisma.page.findMany({where:{status:"PUBLISHED",deletedAt:null,robotsIndex:true,publishedAt:{lte:now}},select:{id:true,slug:true,updatedAt:true}}),
    prisma.category.findMany({where:{archivedAt:null,robotsIndex:true},select:{id:true,slug:true,updatedAt:true}}),
    prisma.tag.findMany({select:{id:true,slug:true,updatedAt:true,_count:{select:{posts:true}}}}),
    prisma.authorProfile.findMany({select:{id:true,slug:true,updatedAt:true}}),
    prisma.aiTool.findMany({where:{status:"PUBLISHED",deletedAt:null},select:{id:true,slug:true,updatedAt:true}}),
    prisma.review.findMany({where:{status:"PUBLISHED",publishedAt:{lte:now}},select:{id:true,slug:true,updatedAt:true}}),
    prisma.comparison.findMany({where:{status:"PUBLISHED",publishedAt:{lte:now}},select:{id:true,slug:true,updatedAt:true}}),
    prisma.featuredCollection.findMany({where:{published:true,robotsIndex:true},select:{slug:true,updatedAt:true}}),
    prisma.contentSeries.findMany({
      where:{posts:{some:{post:{status:"PUBLISHED",deletedAt:null,publishedAt:{lte:now}}}}},
      select:{slug:true,updatedAt:true},
    }),
    prisma.seoMeta.findMany({where:{robotsIndex:false},select:{entityType:true,entityId:true}}),
  ]);

  const hidden = new Set(noindex.map((x) => `${x.entityType}:${x.entityId}`));
  const staticRoutes = [
    "/", "/latest", "/wordpress", "/development", "/how-to", "/online-business",
    "/ai-tools", "/reviews", "/comparisons", "/about", "/contact", "/guides", "/resources",
  ];

  return [
    ...staticRoutes.map((url) => ({
      url: canonicalUrl(url),
      lastModified: now,
      changeFrequency: url === "/" ? "daily" as const : "weekly" as const,
      priority: url === "/" ? 1 : 0.8,
    })),
    ...posts.map((x)=>({url:canonicalUrl(`/article/${x.slug}`),lastModified:x.updatedAt,changeFrequency:"weekly" as const,priority:0.8})),
    ...pages.filter((x)=>!hidden.has(`PAGE:${x.id}`)).map((x)=>({url:canonicalUrl(`/${x.slug}`),lastModified:x.updatedAt,changeFrequency:"monthly" as const,priority:0.6})),
    ...categories.filter((x)=>!hidden.has(`CATEGORY:${x.id}`)).map((x)=>({url:canonicalUrl(`/category/${x.slug}`),lastModified:x.updatedAt,changeFrequency:"weekly" as const,priority:0.6})),
    ...tags.filter((x)=>x._count.posts>0&&!hidden.has(`TAG:${x.id}`)).map((x)=>({url:canonicalUrl(`/tag/${x.slug}`),lastModified:x.updatedAt,changeFrequency:"weekly" as const,priority:0.5})),
    ...authors.filter((x)=>!hidden.has(`AUTHOR:${x.id}`)).map((x)=>({url:canonicalUrl(`/author/${x.slug}`),lastModified:x.updatedAt,changeFrequency:"monthly" as const,priority:0.5})),
    ...tools.filter((x)=>!hidden.has(`AI_TOOL:${x.id}`)).map((x)=>({url:canonicalUrl(`/ai-tools/${x.slug}`),lastModified:x.updatedAt,changeFrequency:"weekly" as const,priority:0.7})),
    ...reviews.filter((x)=>!hidden.has(`REVIEW:${x.id}`)).map((x)=>({url:canonicalUrl(`/reviews/${x.slug}`),lastModified:x.updatedAt,changeFrequency:"monthly" as const,priority:0.7})),
    ...comparisons.filter((x)=>!hidden.has(`COMPARISON:${x.id}`)).map((x)=>({url:canonicalUrl(`/comparisons/${x.slug}`),lastModified:x.updatedAt,changeFrequency:"monthly" as const,priority:0.6})),
    ...collections.map((x)=>({url:canonicalUrl(`/guides/${x.slug}`),lastModified:x.updatedAt,changeFrequency:"monthly" as const,priority:0.6})),
    ...series.map((x)=>({url:canonicalUrl(`/series/${x.slug}`),lastModified:x.updatedAt,changeFrequency:"monthly" as const,priority:0.5})),
  ];
}
