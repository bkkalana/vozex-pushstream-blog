import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";
import { absoluteUrl, canonicalUrl } from "@/lib/seo/site";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const publishedPostWhere = (now: Date) => ({
  status: "PUBLISHED" as const,
  deletedAt: null,
  robotsIndex: true,
  publishedAt: { lte: now },
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [posts,pages,categories,tags,authors,tools,reviews,comparisons,collections,series,noindex] = await Promise.all([
    prisma.post.findMany({
      where: publishedPostWhere(now),
      select: {
        slug:true,
        updatedAt:true,
        lastMeaningfulUpdateAt:true,
        featuredImage:{select:{path:true}},
        ogImage:{select:{path:true}},
      },
      orderBy:{publishedAt:"desc"},
    }),
    prisma.page.findMany({
      where:{status:"PUBLISHED",deletedAt:null,robotsIndex:true,publishedAt:{lte:now}},
      select:{id:true,slug:true,updatedAt:true},
    }),
    prisma.category.findMany({
      where:{archivedAt:null,robotsIndex:true,posts:{some:publishedPostWhere(now)}},
      select:{id:true,slug:true,updatedAt:true},
    }),
    prisma.tag.findMany({
      where:{posts:{some:{post:publishedPostWhere(now)}}},
      select:{id:true,slug:true,updatedAt:true},
    }),
    prisma.authorProfile.findMany({
      where:{user:{posts:{some:publishedPostWhere(now)}}},
      select:{id:true,slug:true,updatedAt:true},
    }),
    prisma.aiTool.findMany({
      where:{status:"PUBLISHED",deletedAt:null},
      select:{id:true,slug:true,updatedAt:true,logo:{select:{path:true}}},
    }),
    prisma.review.findMany({
      where:{status:"PUBLISHED",deletedAt:null,publishedAt:{lte:now}},
      select:{id:true,slug:true,updatedAt:true},
    }),
    prisma.comparison.findMany({
      where:{status:"PUBLISHED",deletedAt:null,publishedAt:{lte:now}},
      select:{id:true,slug:true,updatedAt:true},
    }),
    prisma.featuredCollection.findMany({
      where:{published:true,robotsIndex:true},
      select:{slug:true,updatedAt:true},
    }),
    prisma.contentSeries.findMany({
      where:{posts:{some:{post:publishedPostWhere(now)}}},
      select:{slug:true,updatedAt:true},
    }),
    prisma.seoMeta.findMany({
      where:{robotsIndex:false},
      select:{entityType:true,entityId:true},
    }),
  ]);

  const hidden = new Set(noindex.map((x) => `${x.entityType}:${x.entityId}`));
  const staticRoutes: Array<{path:string;changeFrequency:"daily"|"weekly"|"monthly";priority:number}> = [
    {path:"/",changeFrequency:"daily",priority:1},
    {path:"/latest",changeFrequency:"daily",priority:0.9},
    {path:"/wordpress",changeFrequency:"weekly",priority:0.8},
    {path:"/development",changeFrequency:"weekly",priority:0.8},
    {path:"/how-to",changeFrequency:"weekly",priority:0.8},
    {path:"/online-business",changeFrequency:"weekly",priority:0.8},
    {path:"/ai-tools",changeFrequency:"weekly",priority:0.8},
    {path:"/reviews",changeFrequency:"weekly",priority:0.8},
    {path:"/comparisons",changeFrequency:"weekly",priority:0.8},
    {path:"/guides",changeFrequency:"weekly",priority:0.8},
    {path:"/resources",changeFrequency:"monthly",priority:0.7},
    {path:"/about",changeFrequency:"monthly",priority:0.5},
    {path:"/contact",changeFrequency:"monthly",priority:0.4},
  ];

  return [
    ...staticRoutes.map((item) => ({
      url: canonicalUrl(item.path),
      changeFrequency: item.changeFrequency,
      priority: item.priority,
    })),
    ...posts.map((x)=>({
      url:canonicalUrl(`/article/${x.slug}`),
      lastModified:x.lastMeaningfulUpdateAt || x.updatedAt,
      changeFrequency:"weekly" as const,
      priority:0.8,
      ...((absoluteUrl(x.ogImage?.path || x.featuredImage?.path)) ? {images:[absoluteUrl(x.ogImage?.path || x.featuredImage?.path)!]} : {}),
    })),
    ...pages.filter((x)=>!hidden.has(`PAGE:${x.id}`)).map((x)=>({
      url:canonicalUrl(`/${x.slug}`),lastModified:x.updatedAt,changeFrequency:"monthly" as const,priority:0.6
    })),
    ...categories.filter((x)=>!hidden.has(`CATEGORY:${x.id}`)).map((x)=>({
      url:canonicalUrl(`/category/${x.slug}`),lastModified:x.updatedAt,changeFrequency:"weekly" as const,priority:0.6
    })),
    ...tags.filter((x)=>!hidden.has(`TAG:${x.id}`)).map((x)=>({
      url:canonicalUrl(`/tag/${x.slug}`),lastModified:x.updatedAt,changeFrequency:"weekly" as const,priority:0.5
    })),
    ...authors.filter((x)=>!hidden.has(`AUTHOR:${x.id}`)).map((x)=>({
      url:canonicalUrl(`/author/${x.slug}`),lastModified:x.updatedAt,changeFrequency:"monthly" as const,priority:0.5
    })),
    ...tools.filter((x)=>!hidden.has(`AI_TOOL:${x.id}`)).map((x)=>({
      url:canonicalUrl(`/ai-tools/${x.slug}`),
      lastModified:x.updatedAt,
      changeFrequency:"weekly" as const,
      priority:0.7,
      ...((absoluteUrl(x.logo?.path)) ? {images:[absoluteUrl(x.logo?.path)!]} : {}),
    })),
    ...reviews.filter((x)=>!hidden.has(`REVIEW:${x.id}`)).map((x)=>({
      url:canonicalUrl(`/reviews/${x.slug}`),lastModified:x.updatedAt,changeFrequency:"monthly" as const,priority:0.7
    })),
    ...comparisons.filter((x)=>!hidden.has(`COMPARISON:${x.id}`)).map((x)=>({
      url:canonicalUrl(`/comparisons/${x.slug}`),lastModified:x.updatedAt,changeFrequency:"monthly" as const,priority:0.6
    })),
    ...collections.map((x)=>({
      url:canonicalUrl(`/guides/${x.slug}`),lastModified:x.updatedAt,changeFrequency:"monthly" as const,priority:0.6
    })),
    ...series.map((x)=>({
      url:canonicalUrl(`/series/${x.slug}`),lastModified:x.updatedAt,changeFrequency:"monthly" as const,priority:0.5
    })),
  ];
}
