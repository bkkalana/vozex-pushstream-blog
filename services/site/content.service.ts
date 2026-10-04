import { prisma } from "@/lib/db/prisma";

export const PAGE_SIZE = 12;
export function pageNumber(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw ?? 1);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}
export function publishedPostWhere() {
  return { status: "PUBLISHED" as const, deletedAt: null, publishedAt: { lte: new Date() } };
}
export async function listPublishedPosts({page=1,categoryId,tagId,authorId,query,sort="latest",limit=PAGE_SIZE}:{page?:number;categoryId?:string;tagId?:string;authorId?:string;query?:string;sort?:"latest"|"oldest"|"popular";limit?:number}) {
  const where = {
    ...publishedPostWhere(),
    ...(categoryId ? { categoryId } : {}),
    ...(authorId ? { authorId } : {}),
    ...(tagId ? { tags: { some: { tagId } } } : {}),
    ...(query ? { OR: [{ title: { contains: query } }, { excerpt: { contains: query } }, { subtitle: { contains: query } }] } : {}),
  };
  const orderBy = sort === "popular" ? [{ views: "desc" as const }, { publishedAt: "desc" as const }] : [{ publishedAt: sort === "oldest" ? "asc" as const : "desc" as const }];
  const [items,total] = await Promise.all([
    prisma.post.findMany({ where, orderBy, skip:(page-1)*limit, take:limit, select:{id:true,slug:true,title:true,excerpt:true,readingTime:true,publishedAt:true,category:{select:{name:true,slug:true}},featuredImage:{select:{path:true,altText:true}}} }),
    prisma.post.count({ where }),
  ]);
  return {items,total,pages:Math.max(1,Math.ceil(total/limit)),page};
}

export async function relatedPosts(postId:string, categoryId:string|null, tagIds:string[], take=4) {
  const candidates=await prisma.post.findMany({
    where:{...publishedPostWhere(),id:{not:postId},OR:[...(categoryId?[{categoryId}]:[]),...(tagIds.length?[{tags:{some:{tagId:{in:tagIds}}}}]:[])]},
    orderBy:{publishedAt:"desc"}, take:Math.max(20,take*5),
    select:{id:true,slug:true,title:true,excerpt:true,readingTime:true,publishedAt:true,categoryId:true,isFeatured:true,tags:{select:{tagId:true}},category:{select:{name:true,slug:true}},featuredImage:{select:{path:true,altText:true}}}
  });
  return candidates.map(p=>({...p,_relatedScore:(categoryId&&p.categoryId===categoryId?20:0)+p.tags.filter(t=>tagIds.includes(t.tagId)).length*10+(p.isFeatured?2:0)})).sort((a,b)=>b._relatedScore-a._relatedScore||((b.publishedAt?.getTime()||0)-(a.publishedAt?.getTime()||0))).slice(0,take).map(({_relatedScore:_,categoryId:__,isFeatured:___,tags:____,...p})=>p);
}
