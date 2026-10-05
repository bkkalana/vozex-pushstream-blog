import { prisma } from "@/lib/db/prisma";
import { calculateTrending } from "@/services/analytics/trending.service";
import { getCachedHomepageSections, getCachedSiteChromeRows } from "@/lib/cache/public-cache";

const defaults = {
  hero: { enabled: true, heading: "Smarter Tech. Better Solutions.", description: "Practical guides, AI tools, WordPress fixes, development tutorials, software reviews, and smart digital solutions.", sortOrder: 10, dataSource: "manual", itemCount: 1, config: { badge: "TECH GUIDES FOR A SMARTER WEB", primaryCtaLabel: "Explore Guides", primaryCtaUrl: "/how-to", secondaryCtaLabel: "Latest Articles", secondaryCtaUrl: "/latest" } },
  stats: { enabled: true, heading: null, description: null, sortOrder: 20, dataSource: "manual", itemCount: 4, config: { items: [{ value: "500+", label: "Guides & Tutorials" }, { value: "50K+", label: "Monthly Readers" }, { value: "12+", label: "Core Categories" }, { value: "100%", label: "Practical & Honest" }], disclaimer: "Editable editorial figures; not automatically verified analytics." } },
  categories: { enabled: true, heading: "Explore by Category", description: "Browse practical resources across the core topics we cover.", sortOrder: 30, dataSource: "featured_categories", itemCount: 6, config: {} },
  trending: { enabled: true, heading: "Trending Now", description: "Popular and editor-picked technology stories.", sortOrder: 40, dataSource: "trending_posts", itemCount: 4, config: {} },
  latest: { enabled: true, heading: "Latest Guides & Tutorials", description: "Fresh practical content from PushStream.", sortOrder: 50, dataSource: "latest_posts", itemCount: 8, config: {} },
  tools: { enabled: true, heading: "Featured Tools & Resources", description: "Useful AI and software tools selected by our editors.", sortOrder: 60, dataSource: "featured_tools", itemCount: 4, config: {} },
  featuredGuide: { enabled: true, heading: "Featured Guide", description: null, sortOrder: 70, dataSource: "featured_post", itemCount: 1, config: {} },
  popular: { enabled: true, heading: "Popular Articles", description: "Most-read content based on recorded views.", sortOrder: 80, dataSource: "popular_posts", itemCount: 4, config: {} },
  newsletter: { enabled: true, heading: "Get the Latest Tech Guides & Tools Straight to Your Inbox", description: "Join PushStream updates for practical guides, reviews and useful tools.", sortOrder: 90, dataSource: "manual", itemCount: 1, config: {} },
} as const;

export type HomeSectionKey = keyof typeof defaults;

export async function getHomepageData() {
  const rows = await getCachedHomepageSections();
  const byKey = new Map(rows.map((row) => [row.key, row]));
  const customRows = rows.filter((row) => row.key.startsWith("custom-") && row.enabled);
  const customMax = (source:string, fallback:number) => Math.max(fallback, ...customRows.filter(x=>x.dataSource===source).map(x=>Number(x.itemCount??0)), 0);
  const section = (key: HomeSectionKey) => ({ ...defaults[key], ...(byKey.get(key) ?? {}), config: { ...defaults[key].config, ...((byKey.get(key)?.config as Record<string, unknown> | null) ?? {}) } });

  const heroSection = section("hero");
  const heroImageId = (heroSection.config as Record<string, unknown>).heroImageId;
  const [categories, trending, latest, tools, featuredGuide, popular, heroImage] = await Promise.all([
    prisma.category.findMany({ where: { archivedAt: null, featured: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], take: Number(section("categories").itemCount ?? 6), include: { image: true, _count: { select: { posts: true } } } }),
    calculateTrending(Number(section("trending").itemCount ?? 4)).then(async ranked => { const ids=ranked.map(x=>x.id); if(!ids.length)return []; const rows=await prisma.post.findMany({where:{id:{in:ids}},include:{category:true,author:true,featuredImage:true}}); const map=new Map(rows.map(x=>[x.id,x])); return ids.map(id=>map.get(id)).filter(Boolean); }),
    prisma.post.findMany({ where: { deletedAt: null, status: "PUBLISHED", publishedAt: { lte: new Date() } }, orderBy: [{ publishedAt: "desc" }], take: customMax("latest_posts", Number(section("latest").itemCount ?? 8)), include: { category: true, author: true, featuredImage: true } }),
    prisma.aiTool.findMany({ where: { deletedAt: null, status: "PUBLISHED", featured: true }, orderBy: [{ rating: "desc" }, { updatedAt: "desc" }], take: customMax("featured_tools", Number(section("tools").itemCount ?? 4)), include: { category: true, logo: true } }),
    prisma.post.findFirst({ where: { deletedAt: null, status: "PUBLISHED", publishedAt: { lte: new Date() }, isFeatured: true }, orderBy: [{ publishedAt: "desc" }], include: { category: true, author: true, featuredImage: true } }),
    prisma.post.findMany({ where: { deletedAt: null, status: "PUBLISHED", publishedAt: { lte: new Date() } }, orderBy: [{ views: "desc" }, { publishedAt: "desc" }], take: customMax("popular_posts", Number(section("popular").itemCount ?? 4)), include: { category: true, author: true, featuredImage: true } }),
    typeof heroImageId === "string" ? prisma.media.findFirst({ where: { id: heroImageId, deletedAt: null } }) : Promise.resolve(null),
  ]);

  const manualIds=Array.from(new Set(customRows.flatMap(row=>{const c=(row.config as Record<string,unknown>|null)??{};return Array.isArray(c.manualSelection)?c.manualSelection.filter((x):x is string=>typeof x==="string"):[]})));
  const manualPosts=manualIds.length?await prisma.post.findMany({where:{id:{in:manualIds},deletedAt:null,status:"PUBLISHED",publishedAt:{lte:new Date()}},include:{category:true,author:true,featuredImage:true}}):[];
  const manualMap=new Map(manualPosts.map(x=>[x.id,x]));
  const customSections=customRows.map(row=>{
    const cfg=(row.config as Record<string,unknown>|null)??{}; const count=Number(row.itemCount??4);
    let items:any[]=[];
    if(row.dataSource==="latest_posts")items=latest.slice(0,count);
    else if(row.dataSource==="popular_posts")items=popular.slice(0,count);
    else if(row.dataSource==="trending_posts")items=trending.slice(0,count);
    else if(row.dataSource==="featured_tools")items=tools.slice(0,count);
    else if(row.dataSource==="manual_posts"){const ids=Array.isArray(cfg.manualSelection)?cfg.manualSelection.filter((x):x is string=>typeof x==="string"):[];items=ids.map(id=>manualMap.get(id)).filter(Boolean).slice(0,count)}
    return {...row,config:cfg,items,itemType:row.dataSource==="featured_tools"?"tool":"post"};
  });
  return { heroImage, sections: Object.fromEntries((Object.keys(defaults) as HomeSectionKey[]).map((key) => [key, section(key)])) as Record<HomeSectionKey, ReturnType<typeof section>>, categories, trending, latest, tools, featuredGuide, popular, customSections };
}

export async function getSiteChrome() {
  const [settings, menus] = await getCachedSiteChromeRows();
  const setting = new Map(settings.map((x) => [x.key, x.value]));
  return { siteName: String(setting.get("general.siteName") ?? "PushStream"), tagline: String(setting.get("general.tagline") ?? "Smarter Tech. Better Solutions."), logoUrl: String(setting.get("general.logoUrl") || "/branding/pushstream-logo.png"), socials: { facebook: String(setting.get("social.facebook") ?? ""), twitter: String(setting.get("social.twitter") ?? ""), linkedin: String(setting.get("social.linkedin") ?? ""), youtube: String(setting.get("social.youtube") ?? ""), instagram: String(setting.get("social.instagram") ?? "") }, footer: { brandCardTitle: String(setting.get("general.footerBrandCardTitle") ?? "Build a smarter web with PushStream"), brandCardBody: String(setting.get("general.footerBrandCardBody") ?? "Tutorials, tools, reviews, and practical ideas for creators and businesses."), communityMessage: String(setting.get("general.footerCommunityMessage") ?? "Made with ♥ for the web community.") }, menus: new Map(menus.map((m) => [m.key, m.items])) };
}
