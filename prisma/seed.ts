import { prisma } from "../lib/db/prisma";
import { env } from "../lib/env";
import { hashPassword } from "../lib/security/password";
import { PERMISSIONS, ROLE_NAMES, ROLE_PERMISSION_MATRIX, type RoleName } from "../lib/auth/permissions";

const roleDescriptions: Record<RoleName, string> = {
  SUPER_ADMIN: "Full system access, including roles, users, settings and security-sensitive operations.",
  ADMIN: "Broad publication administration without permission-model ownership.",
  EDITOR: "Editorial content, media, moderation, tools, reviews and comparisons.",
  AUTHOR: "Create and edit owned content and upload media.",
  SEO_MANAGER: "SEO configuration and content/analytics visibility.",
  VIEWER: "Read-only operational access.",
};

async function seedRolesAndPermissions() {
  const permissionKeys = ["*", ...PERMISSIONS];
  for (const key of permissionKeys) {
    await prisma.permission.upsert({ where: { key }, update: {}, create: { key, description: key === "*" ? "All permissions" : `Permission: ${key}` } });
  }

  for (const name of ROLE_NAMES) {
    const role = await prisma.role.upsert({ where: { name }, update: { description: roleDescriptions[name] }, create: { name, description: roleDescriptions[name], system: true } });
    const keys = ROLE_PERMISSION_MATRIX[name];
    for (const key of keys) {
      const permission = await prisma.permission.findUniqueOrThrow({ where: { key } });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }
}

async function seedSuperAdmin() {
  if (!env.SUPER_ADMIN_EMAIL || !env.SUPER_ADMIN_PASSWORD || env.SUPER_ADMIN_PASSWORD.startsWith("replace-with")) {
    throw new Error("Set SUPER_ADMIN_EMAIL and a strong SUPER_ADMIN_PASSWORD before running the seed.");
  }
  const passwordHash = await hashPassword(env.SUPER_ADMIN_PASSWORD);
  const user = await prisma.user.upsert({
    where: { email: env.SUPER_ADMIN_EMAIL.toLowerCase() },
    update: { name: env.SUPER_ADMIN_NAME, status: "ACTIVE" },
    create: { name: env.SUPER_ADMIN_NAME, email: env.SUPER_ADMIN_EMAIL.toLowerCase(), passwordHash, status: "ACTIVE" },
  });
  const role = await prisma.role.findUniqueOrThrow({ where: { name: "SUPER_ADMIN" } });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: role.id } }, update: {}, create: { userId: user.id, roleId: role.id } });
}

async function seedSettings() {
  const settings = [
    ["general.siteName", "general", "PushStream"],
    ["general.tagline", "general", "Smarter Tech. Better Solutions."],
    ["general.timezone", "general", "Asia/Colombo"],
    ["seo.defaultTitle", "seo", "PushStream — Smarter Tech. Better Solutions."],
    ["seo.defaultDescription", "seo", "Practical technology guides, AI tools, development tutorials, reviews and online business resources."],
    ["seo.metaDescription", "seo", "Practical technology guides, AI tools, development tutorials, reviews and online business resources."],
    ["seo.ogImage", "seo", ""],
    ["seo.twitterCard", "seo", "summary_large_image"],
    ["seo.robotsIndex", "seo", true],
    ["seo.robotsFollow", "seo", true],
    ["content.readingWordsPerMinute", "content", 225],
  ] as const;
  for (const [key, group, value] of settings) {
    await prisma.siteSetting.upsert({ where: { key }, update: {}, create: { key, group, value } });
  }
}


async function seedHomepageAndMenus() {
  const sections = [
    ["hero", 10, "manual", 1], ["stats", 20, "manual", 4], ["categories", 30, "featured_categories", 6],
    ["trending", 40, "trending_posts", 4], ["latest", 50, "latest_posts", 8], ["tools", 60, "featured_tools", 4],
    ["featuredGuide", 70, "featured_post", 1], ["popular", 80, "popular_posts", 4], ["newsletter", 90, "manual", 1],
  ] as const;
  for (const [key, sortOrder, dataSource, itemCount] of sections) {
    await prisma.homepageSection.upsert({ where: { key }, update: {}, create: { key, sortOrder, dataSource, itemCount, enabled: true } });
  }

  const header = await prisma.menu.upsert({ where: { key: "header" }, update: {}, create: { key: "header", name: "Header" } });
  const links = [
    ["Home", "/"], ["AI Tools", "/ai-tools"], ["WordPress", "/wordpress"], ["Development", "/development"],
    ["Reviews", "/reviews"], ["How-To", "/how-to"], ["Online Business", "/online-business"],
  ] as const;
  if (await prisma.menuItem.count({ where: { menuId: header.id } }) === 0) {
    for (const [sortOrder, [label, url]] of links.entries()) await prisma.menuItem.create({ data: { menuId: header.id, label, url, sortOrder } });
  }
  await prisma.menu.upsert({ where: { key: "mega" }, update: {}, create: { key: "mega", name: "Mega Menu" } });
  const footer = await prisma.menu.upsert({ where: { key: "footer" }, update: {}, create: { key: "footer", name: "Footer" } });
  if (await prisma.menuItem.count({ where: { menuId: footer.id } }) === 0) {
    const footerLinks = [["About","/about"],["Contact","/contact"],["Privacy Policy","/privacy-policy"],["Terms","/terms"],["Affiliate Disclosure","/affiliate-disclosure"],["Editorial Policy","/editorial-policy"]] as const;
    for (const [sortOrder,[label,url]] of footerLinks.entries()) await prisma.menuItem.create({data:{menuId:footer.id,label,url,sortOrder}});
  }
}

async function seedAiToolCategories() {
  const categories = [
    ["Writing & Content", "writing-content"], ["Coding", "coding"], ["Research", "research"],
    ["Image Generation", "image-generation"], ["Video", "video"], ["Audio", "audio"],
    ["Productivity", "productivity"], ["Automation", "automation"], ["Business", "business"],
    ["Marketing", "marketing"], ["SEO", "seo"], ["Design", "design"],
  ] as const;
  for (const [sortOrder, [name, slug]] of categories.entries()) {
    await prisma.aiToolCategory.upsert({ where: { slug }, update: { name, sortOrder }, create: { name, slug, sortOrder } });
  }
}

async function seedPhase11Defaults() {
  const adSlots = ["HOME_AFTER_HERO","HOME_BETWEEN_SECTIONS","ARTICLE_AFTER_INTRO","ARTICLE_AFTER_SELECTED_PARAGRAPH","ARTICLE_MIDDLE","ARTICLE_BEFORE_FAQ","ARTICLE_BEFORE_RELATED_POSTS","SIDEBAR","ARCHIVE"] as const;
  for (const key of adSlots) await prisma.adSlot.upsert({ where: { key }, create: { key, label: "Advertisement", enabled: false, device: "ALL" }, update: {} });
  await prisma.siteSetting.upsert({ where: { key: "analytics.trendingWeights" }, create: { key: "analytics.trendingWeights", group: "analytics", value: { last24h: 3, days2to7: 1.5, days8to30: 0.5, manualBoost: 100 } }, update: {} });
}

async function seedPhase12Defaults() {
  const settings = [
    ["general.adminEmail","general",env.SUPER_ADMIN_EMAIL ?? ""],
    ["general.logoUrl","general",""],["general.faviconUrl","general",""],["general.defaultAuthorId","general",""],
    ["appearance.primary","appearance","#2563EB"],["appearance.primaryHover","appearance","#1D4ED8"],["appearance.secondary","appearance","#0B1F3A"],["appearance.accent","appearance","#287BFF"],["appearance.fontFamily","appearance","Inter"],
    ["appearance.foreground","appearance","#0B1F3A"],["appearance.background","appearance","#FFFFFF"],
    ["appearance.backgroundSoft","appearance","#F5F9FF"],["appearance.backgroundBlue","appearance","#EFF6FF"],
    ["appearance.border","appearance","#E4ECF5"],["appearance.textSecondary","appearance","#526174"],["appearance.textMuted","appearance","#6B7A90"],
    ["social.facebook","social",""],["social.twitter","social",""],["social.linkedin","social",""],["social.youtube","social",""],["social.instagram","social",""],
    ["analytics.googleAnalyticsId","integrations",""],["analytics.googleTagManagerId","integrations",""],
    ["comments.enabled","integrations",true],["comments.requireModeration","integrations",true],["newsletter.confirmationRequired","integrations",true],
    ["performance.readingWordsPerMinute","integrations",225],
  ] as const;
  for (const [key,group,value] of settings) await prisma.siteSetting.upsert({where:{key},update:{},create:{key,group,value}});
}



function docFromParagraphs(...paragraphs: string[]) {
  return {
    type: "doc",
    content: paragraphs.map((text) => ({ type: "paragraph", content: [{ type: "text", text }] })),
  };
}

async function seedStarterPublicationContent() {
  const admin = await prisma.user.findUniqueOrThrow({ where: { email: env.SUPER_ADMIN_EMAIL!.toLowerCase() } });
  await prisma.authorProfile.upsert({
    where: { userId: admin.id },
    update: { slug: "pushstream-editorial", jobTitle: "Editorial Team", shortBio: "Practical technology guides, reviews and tutorials from PushStream." },
    create: {
      userId: admin.id,
      slug: "pushstream-editorial",
      jobTitle: "Editorial Team",
      shortBio: "Practical technology guides, reviews and tutorials from PushStream.",
      fullBio: "PushStream publishes practical, independently edited technology guides covering AI tools, WordPress, development, hosting, SEO and online business.",
      website: env.SITE_URL,
      seoTitle: "PushStream Editorial Team",
      seoDescription: "Meet the editorial team behind PushStream technology guides and reviews.",
    },
  });

  const categoryDefs = [
    ["AI Tools", "ai-tools", "Practical AI tool guides, workflows and reviews."],
    ["WordPress", "wordpress", "WordPress troubleshooting, performance, security and beginner guides."],
    ["Development", "development", "JavaScript, TypeScript, React, Next.js, APIs, databases and deployment."],
    ["Reviews", "reviews", "Independent software, SaaS, hosting and productivity reviews."],
    ["How-To", "how-to", "Step-by-step practical technology tutorials."],
    ["Online Business", "online-business", "Blogging, SEO, monetization, affiliate marketing and digital products."],
  ] as const;
  const categories: Record<string, string> = {};
  for (const [sortOrder, [name, slug, description]] of categoryDefs.entries()) {
    const category = await prisma.category.upsert({
      where: { slug },
      update: { name, description, featured: true, sortOrder },
      create: { name, slug, description, featured: true, sortOrder, seoTitle: `${name} Guides | PushStream`, seoDescription: description },
    });
    categories[slug] = category.id;
  }

  const tagDefs = [
    ["AI", "ai"], ["WordPress", "wordpress"], ["Development", "development"], ["MySQL", "mysql"],
    ["Troubleshooting", "troubleshooting"], ["Hosting", "hosting"], ["SEO", "seo"], ["Blogging", "blogging"],
  ] as const;
  const tags: Record<string, string> = {};
  for (const [name, slug] of tagDefs) {
    const tag = await prisma.tag.upsert({ where: { slug }, update: { name }, create: { name, slug, description: `${name} resources from PushStream.` } });
    tags[slug] = tag.id;
  }

  const articleDefs = [
    ["How to Fix WordPress 500 Internal Server Error", "how-to-fix-wordpress-500-internal-server-error", "wordpress", "A practical checklist for finding the root cause of a WordPress 500 error without guessing.", ["wordpress","troubleshooting"]],
    ["How to Speed Up a Slow WordPress Website", "how-to-speed-up-a-slow-wordpress-website", "wordpress", "A structured approach to caching, images, database cleanup, plugins and hosting bottlenecks.", ["wordpress"]],
    ["How to Fix Plugin Conflicts in WordPress", "how-to-fix-plugin-conflicts-in-wordpress", "wordpress", "Safely isolate plugin conflicts and restore a stable WordPress site.", ["wordpress","troubleshooting"]],
    ["How to Debug MySQL Connection Errors", "how-to-debug-mysql-connection-errors", "development", "A methodical guide to credentials, hosts, ports, permissions and connection diagnostics.", ["mysql","development","troubleshooting"]],
    ["How to Fix CORS Errors in Web Applications", "how-to-fix-cors-errors-in-web-applications", "development", "Understand CORS failures and fix them at the correct server, proxy or API layer.", ["development","troubleshooting"]],
    ["Best Free AI Tools for Content Creators", "best-free-ai-tools-for-content-creators", "ai-tools", "A practical framework for evaluating free AI tools for writing, research, images and workflow support.", ["ai"]],
    ["ChatGPT Alternatives for Coding and Development", "chatgpt-alternatives-for-coding-and-development", "ai-tools", "What to compare when choosing an AI coding assistant for real development work.", ["ai","development"]],
    ["AI Tools for WordPress Performance Analysis", "ai-tools-for-wordpress-performance-analysis", "ai-tools", "Ways AI-assisted analysis can support WordPress performance troubleshooting without replacing measurement.", ["ai","wordpress"]],
    ["Best Web Hosting for Blogs: What to Compare", "best-web-hosting-for-blogs-what-to-compare", "reviews", "A vendor-neutral checklist for evaluating speed, support, backups, limits and total hosting cost.", ["hosting","blogging"]],
    ["How to Start an English Tech Blog", "how-to-start-an-english-tech-blog", "online-business", "Plan a focused technology publication with clear categories, editorial standards and a sustainable workflow.", ["blogging"]],
    ["How to Choose a Profitable Blog Niche", "how-to-choose-a-profitable-blog-niche", "online-business", "Evaluate audience demand, competition, monetization paths and your ability to publish useful content consistently.", ["blogging","seo"]],
    ["How to Monetize a Tech Blog with Display Ads", "how-to-monetize-a-tech-blog-with-display-ads", "online-business", "Prepare a technology blog for display advertising while protecting reader experience and site performance.", ["blogging","seo"]],
  ] as const;

  const baseDate = new Date("2026-09-01T08:00:00.000Z");
  for (const [index, [title, slug, categorySlug, excerpt, articleTags]] of articleDefs.entries()) {
    const publishedAt = new Date(baseDate.getTime() + index * 86400000);
    const body = [
      excerpt,
      "This starter article is original seed content designed to demonstrate the publishing workflow. Expand it with tested screenshots, examples and references before treating it as a definitive production guide.",
      "Use the PushStream editor to add headings, quick-answer blocks, code examples, comparisons, FAQs and internal links as the article is developed.",
    ];
    const post = await prisma.post.upsert({
      where: { slug },
      update: {
        title, excerpt, categoryId: categories[categorySlug], status: "PUBLISHED", publishedAt,
        seoTitle: title, seoDescription: excerpt, robotsIndex: true, robotsFollow: true,
      },
      create: {
        title, slug, excerpt, content: docFromParagraphs(...body), authorId: admin.id, categoryId: categories[categorySlug],
        status: "PUBLISHED", publishedAt, seoTitle: title, seoDescription: excerpt,
        focusKeyword: title.toLowerCase().split(" ").slice(0, 5).join(" "), schemaType: "BlogPosting",
        readingTime: 2, wordCount: body.join(" ").split(/\s+/).length,
        isFeatured: index === 0, isTrending: index < 2, allowComments: true, tableOfContentsEnabled: true,
      },
    });
    for (const tagSlug of articleTags) {
      await prisma.postTag.upsert({ where: { postId_tagId: { postId: post.id, tagId: tags[tagSlug] } }, update: {}, create: { postId: post.id, tagId: tags[tagSlug] } });
    }
  }

  const pages = [
    ["About", "about", "Helping You Build a Smarter Web.", "PushStream publishes practical technology education with an emphasis on clarity, usefulness and responsible recommendations."],
    ["Privacy Policy", "privacy-policy", "Privacy Policy", "This starter policy page must be reviewed and adapted to the analytics, advertising, email and legal requirements that apply to the production site."],
    ["Terms of Use", "terms", "Terms of Use", "These starter terms are placeholder editorial content and require legal review before production publication."],
    ["Disclaimer", "disclaimer", "Disclaimer", "Technology information can change. Readers should verify important technical, financial or business decisions independently."],
    ["Affiliate Disclosure", "affiliate-disclosure", "Affiliate Disclosure", "PushStream may use affiliate links. When applicable, sponsored or affiliate relationships should be clearly disclosed near relevant content."],
    ["Editorial Policy", "editorial-policy", "Editorial Policy", "PushStream aims to publish practical, original and clearly disclosed editorial content. Reviews and ratings must be based on editor-controlled information rather than fabricated values."],
    ["Cookie Policy", "cookie-policy", "Cookie Policy", "This starter cookie policy should be reviewed against the final analytics, advertising and consent configuration before launch."],
  ] as const;
  for (const [title, slug, heading, paragraph] of pages) {
    await prisma.page.upsert({
      where: { slug },
      update: { title, status: "PUBLISHED", seoTitle: `${title} | PushStream`, seoDescription: paragraph },
      create: { title, slug, content: docFromParagraphs(heading, paragraph), status: "PUBLISHED", editorId: admin.id, publishedAt: new Date(), seoTitle: `${title} | PushStream`, seoDescription: paragraph },
    });
  }

  const codingCategory = await prisma.aiToolCategory.findUniqueOrThrow({ where: { slug: "coding" } });
  const writingCategory = await prisma.aiToolCategory.findUniqueOrThrow({ where: { slug: "writing-content" } });
  const tools = [
    ["Example Coding Assistant", "example-coding-assistant", codingCategory.id, "A seeded example entry showing how coding assistants are represented in the directory.", "FREEMIUM"],
    ["Example Writing Assistant", "example-writing-assistant", writingCategory.id, "A seeded example entry for testing AI tool directory layouts and filters.", "FREE_TRIAL"],
  ] as const;
  for (const [name, slug, categoryId, shortDescription, pricingModel] of tools) {
    await prisma.aiTool.upsert({
      where: { slug },
      update: { name, categoryId, shortDescription },
      create: {
        name, slug, websiteUrl: env.SITE_URL, shortDescription, fullDescription: docFromParagraphs(shortDescription), categoryId,
        pricingModel, status: "PUBLISHED", featured: true, verified: false, reviewCount: 0, apiAvailable: false, freeTrial: pricingModel === "FREE_TRIAL",
      },
    });
  }
}


async function seedPhase18AiDefaults() {
  const settings = [
    ["ai.enabled","ai",false], ["ai.provider","ai","OPENAI"], ["ai.model","ai","gpt-5.6-luna"],
    ["ai.maxTokens","ai",1800], ["ai.dailyLimit","ai",500], ["ai.perUserDailyLimit","ai",75],
    ["ai.feature.rewrite","ai",true], ["ai.feature.metadata","ai",true], ["ai.feature.outline","ai",true],
    ["ai.feature.faq","ai",true], ["ai.feature.links","ai",true],
  ] as const;
  for (const [key,group,value] of settings) await prisma.siteSetting.upsert({where:{key},update:{},create:{key,group,value}});
}

async function seedPhase21MediaCollections() {
  for (const name of ["Blog Images","AI Tools","Authors","Reviews","Homepage","Logos"]) {
    await prisma.mediaCollection.upsert({ where: { name }, update: {}, create: { name } });
  }
}

async function seedPhase26CommunicationDefaults(){
  for(const [name,slug,description] of [["AI Tools","ai-tools","AI tools and practical AI guidance"],["WordPress","wordpress","WordPress fixes, performance and security"],["Development","development","JavaScript, React, Next.js, Node.js and APIs"],["Online Business","online-business","SEO, blogging, monetization and online business"]] as const){await prisma.newsletterSegment.upsert({where:{slug},update:{name,description,active:true},create:{name,slug,description,active:true}})}
  const templates=[
    ["newsletter.confirmation","Newsletter confirmation","Confirm your PushStream subscription","Hi {{name}},\n\nConfirm your subscription: {{confirmationUrl}}",null],
    ["password.reset","Password reset","Reset your PushStream password","Reset your password using this link: {{resetUrl}}",null],
    ["contact.acknowledgement","Contact acknowledgement","We received your PushStream message","Hi {{name}},\n\nWe received your message and will review it.",null],
    ["editorial.notification","Editorial notification","PushStream editorial update","{{message}}",null],
  ] as const;
  for(const [key,name,subject,textBody,htmlBody] of templates)await prisma.emailTemplate.upsert({where:{key},update:{name,subject,textBody,htmlBody,active:true},create:{key,name,subject,textBody,htmlBody,active:true}});
}

async function seedPhase30PlatformDefaults(){
  const flags=[
    ["comments",true,"Public comments"],["ai-assistant",false,"AI-assisted editorial workspace"],["newsletter",true,"Newsletter signup"],["internal-analytics",true,"Internal analytics"],["ads",true,"Advertising placements"],["affiliate-tracking",true,"Affiliate redirect tracking"],["announcement-bar",false,"Public announcement bar"],
  ] as const;
  for(const [key,enabled,description] of flags)await prisma.featureFlag.upsert({where:{key},update:{},create:{key,enabled,description}});
  await prisma.siteSetting.upsert({where:{key:"system.maintenanceMode"},update:{},create:{key:"system.maintenanceMode",group:"system",value:false}});
}

async function seedFrontendPhase3SitePages(){
  const pages = {
    home:[["hero","hero_split","Smarter Tech. Better Solutions.","manual",1],["stats","stats_row",null,"manual",4],["categories","category_cards","Popular Categories","featured_categories",6],["trending","article_grid","Trending Articles","trending_posts",4],["latest","article_grid","Latest Articles","latest_posts",4],["tools","tool_cards","Featured Tools","featured_tools",6],["reviews","review_cards","Reviews & Comparisons","latest_reviews",4],["newsletter","newsletter_band","Get the Latest Tech Guides in Your Inbox","manual",1]],
    latest:[["hero","hero_editorial","Latest Articles","manual",1],["featured","article_featured_grid","Featured Article","featured_posts",1],["articles","article_sidebar_layout","All Articles","latest_posts",12],["newsletter","newsletter_band",null,"manual",1]],
    wordpress:[["hero","hero_split","WordPress Fixes","manual",1],["topics","category_cards","Popular Topics","wordpress_topics",8],["articles","article_sidebar_layout","All WordPress Fixes","category:wordpress",12],["newsletter","newsletter_band",null,"manual",1]],
    development:[["hero","hero_split","Development Guides","manual",1],["articles","article_sidebar_layout",null,"category:development",12],["newsletter","newsletter_band",null,"manual",1]],
    "how-to":[["hero","hero_split","How-To Guides","manual",1],["articles","article_sidebar_layout",null,"category:how-to",12],["newsletter","newsletter_band",null,"manual",1]],
    "ai-tools":[["hero","hero_split","Best AI Tools for Content Creators","manual",1],["categories","category_cards","Popular AI Tool Categories","ai_tool_categories",6],["top-tools","tool_cards","Top AI Tools","featured_tools",4],["directory","tool_directory","AI Tools Comparison","all_tools",20],["reviews","review_cards","Latest AI Tool Reviews","latest_reviews",4],["newsletter","newsletter_band",null,"manual",1]],
    reviews:[["hero","hero_editorial","Reviews & Comparisons","manual",1],["reviews","article_sidebar_layout",null,"latest_reviews",12],["newsletter","newsletter_band",null,"manual",1]],
    comparisons:[["hero","hero_editorial","Product Comparisons","manual",1],["comparisons","comparison_table",null,"latest_comparisons",12],["newsletter","newsletter_band",null,"manual",1]],
    about:[["hero","hero_split","A Smarter Web For Everyone.","manual",1],["mission","mission_vision","Our Mission & Vision","manual",2],["topics","category_cards","Topics on PushStream","featured_categories",6],["team","team_grid","The People Behind PushStream","authors",4],["values","values_grid","What Guides Us","manual",4],["community","stats_row","A Growing Community","manual",4],["newsletter","newsletter_band",null,"manual",1]],
    contact:[["hero","hero_split","We’d Love to Hear from You","manual",1],["contact","contact_form_layout","Send Us a Message","manual",1],["methods","contact_cards","Contact Information","manual",4],["faq","faq_grid","Quick Answers","manual",6],["social","social_grid","Follow & Connect","manual",5],["newsletter","newsletter_band",null,"manual",1]],
    resources:[["hero","hero_editorial","Resources","manual",1],["directory","manual_cards",null,"resources",20],["newsletter","newsletter_band",null,"manual",1]],
  } as const;
  for(const [pageKey,defs] of Object.entries(pages)){for(const [i,d] of defs.entries()){const [sectionKey,sectionType,heading,dataSource,itemCount]=d;await prisma.publicPageSection.upsert({where:{pageKey_sectionKey:{pageKey,sectionKey}},update:{},create:{pageKey,sectionKey,sectionType,heading:heading??null,sortOrder:(i+1)*10,dataSource,itemCount,config:{stylePreset:"white"}}})}}

  // Phase 4: seed editable homepage hero chips and display stats only when the section has no items yet.
  const hero=await prisma.publicPageSection.findUnique({where:{pageKey_sectionKey:{pageKey:"home",sectionKey:"hero"}},include:{items:true}});
  if(hero&&hero.items.length===0){
    const chips=[["ai-tools","AI Tools","ai-tools"],["wordpress","WordPress","wordpress"],["development","Development","development"],["reviews","Reviews","reviews"],["how-to","How-To","how-to"],["products","Products","products"]] as const;
    await prisma.publicPageSectionItem.createMany({data:chips.map(([itemKey,title,icon],index)=>({sectionId:hero.id,itemKey,title,icon,sortOrder:(index+1)*10,enabled:true,config:{}}))});
  }
  const stats=await prisma.publicPageSection.findUnique({where:{pageKey_sectionKey:{pageKey:"home",sectionKey:"stats"}},include:{items:true}});
  if(stats&&stats.items.length===0){
    const items=[["articles","500+","In-depth Articles"],["tools","50+","Tools Reviewed"],["readers","100K+","Monthly Readers"],["rating","4.9/5","Community Rating"]] as const;
    await prisma.publicPageSectionItem.createMany({data:items.map(([itemKey,title,subtitle],index)=>({sectionId:stats.id,itemKey,title,subtitle,sortOrder:(index+1)*10,enabled:true,config:{}}))});
  }
}

async function main() {
  await seedRolesAndPermissions();
  await seedSuperAdmin();
  await seedSettings();
  await seedHomepageAndMenus();
  await seedAiToolCategories();
  await seedPhase11Defaults();
  await seedPhase12Defaults();
  await seedPhase18AiDefaults();
  await seedPhase21MediaCollections();
  await seedPhase26CommunicationDefaults();
  await seedPhase30PlatformDefaults();
  await seedFrontendPhase3SitePages();
  await seedStarterPublicationContent();
  console.log("Seed complete: roles, permissions, Super Admin, settings, homepage, site pages, navigation, starter publication content, AI tools, ads and system defaults.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
