import { prisma } from "@/lib/db/prisma";
import { ArticleJsonRenderer } from "@/components/site/article-json-renderer";
export async function SharedContentBlock({slug}:{slug:string}){const block=await prisma.contentBlock.findFirst({where:{slug,status:"ACTIVE"},select:{content:true,name:true}});if(!block)return null;return <aside className="my-6 rounded-2xl border border-[var(--border)] bg-[var(--soft-bg)] p-5" aria-label={block.name}><ArticleJsonRenderer doc={block.content}/></aside>}
