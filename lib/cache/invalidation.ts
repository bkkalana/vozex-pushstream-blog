import { revalidatePath, revalidateTag } from "next/cache";

export const CACHE_TAGS = {
  homepage: "public:homepage",
  posts: "public:posts",
  categories: "public:categories",
  aiTools: "public:ai-tools",
  chrome: "public:chrome",
  settings: "public:settings",
} as const;

export function revalidatePublicContent(tags: string[] = [], paths: string[] = []) {
  for (const tag of tags) revalidateTag(tag, "max");
  for (const path of paths) revalidatePath(path);
}

export function revalidateEditorialSurfaces() {
  revalidatePublicContent([CACHE_TAGS.posts, CACHE_TAGS.homepage, CACHE_TAGS.categories], ["/", "/latest"]);
  revalidatePath("/article/[slug]", "page");
  revalidatePath("/category/[slug]", "page");
  revalidatePath("/tag/[slug]", "page");
  revalidatePath("/author/[slug]", "page");
}

export function revalidateToolSurfaces() {
  revalidatePublicContent([CACHE_TAGS.aiTools, CACHE_TAGS.homepage], ["/", "/ai-tools"]);
  revalidatePath("/ai-tools/[slug]", "page");
}

export function revalidateReviewSurfaces() {
  revalidatePublicContent([CACHE_TAGS.homepage], ["/", "/reviews", "/comparisons"]);
  revalidatePath("/reviews/[slug]", "page");
  revalidatePath("/comparisons/[slug]", "page");
}

export async function revalidateAffectedPost(postId:string){
  const {prisma}=await import("@/lib/db/prisma");
  const post=await prisma.post.findUnique({where:{id:postId},select:{slug:true,status:true,category:{select:{slug:true}},author:{select:{authorProfile:{select:{slug:true}}}},tags:{select:{tag:{select:{slug:true}}}}}});
  if(!post)return;
  revalidatePublicContent([CACHE_TAGS.posts,CACHE_TAGS.homepage,CACHE_TAGS.categories],["/","/latest","/search",`/article/${post.slug}`]);
  if(post.category)revalidatePath(`/category/${post.category.slug}`);
  if(post.author.authorProfile)revalidatePath(`/author/${post.author.authorProfile.slug}`);
  for(const x of post.tags)revalidatePath(`/tag/${x.tag.slug}`);
  if(post.status === "PUBLISHED") {
    const {submitIndexNowUrls}=await import("@/lib/seo/indexnow");
    const urls=[`/article/${post.slug}`,"/","/latest",...(post.category?[`/category/${post.category.slug}`]:[]),...(post.author.authorProfile?[`/author/${post.author.authorProfile.slug}`]:[]),...post.tags.map(x=>`/tag/${x.tag.slug}`)];
    submitIndexNowUrls(urls).catch(()=>undefined);
  }
}
