
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { csvObjects, toCsv } from "./csv";

export const importTypes=["redirects","subscribers","ai-tools","posts"] as const;
export type ImportType=typeof importTypes[number];
export type PreviewRow={row:number;valid:boolean;warnings:string[];errors:string[];data:Record<string,unknown>};

const redirectSchema=z.object({oldPath:z.string().min(1),newPath:z.string().min(1),type:z.enum(["PERMANENT","TEMPORARY"]).default("PERMANENT"),active:z.boolean().default(true)});
const subscriberSchema=z.object({email:z.string().email(),name:z.string().optional().nullable(),status:z.enum(["PENDING","ACTIVE","UNSUBSCRIBED"]).default("ACTIVE"),source:z.string().optional().nullable()});
const aiToolSchema=z.object({name:z.string().min(1),slug:z.string().min(1).optional(),websiteUrl:z.string().url(),shortDescription:z.string().min(1),categorySlug:z.string().min(1),pricingModel:z.enum(["FREE","FREEMIUM","PAID","FREE_TRIAL","ENTERPRISE"]),startingPrice:z.number().nonnegative().optional().nullable(),currency:z.string().length(3).optional().nullable(),status:z.enum(["DRAFT","PUBLISHED","ARCHIVED"]).default("DRAFT")});
const postSchema=z.object({title:z.string().min(1),slug:z.string().min(1).optional(),excerpt:z.string().optional().nullable(),content:z.string().optional().default(""),categorySlug:z.string().optional().nullable(),authorEmail:z.string().email(),status:z.enum(["DRAFT","REVIEW","IN_REVIEW","CHANGES_REQUESTED","APPROVED","SCHEDULED","PUBLISHED","ARCHIVED","TRASH"]).optional()});

function bool(v:unknown,d=true){if(typeof v==="boolean")return v;const s=String(v??"").toLowerCase();if(["1","true","yes","on"].includes(s))return true;if(["0","false","no","off"].includes(s))return false;return d}
function slugify(v:string){return v.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,180)||"item"}
function textDoc(text:string){return {type:"doc",content:text?text.split(/\n{2,}/).filter(Boolean).map(p=>({type:"paragraph",content:[{type:"text",text:p}]})):[]}}
export function parseImportFile(type:ImportType,filename:string,text:string){
  const ext=filename.toLowerCase().endsWith(".json")?"json":"csv";
  const raw:Record<string,unknown>[] = ext==="json" ? (()=>{const x=JSON.parse(text);return Array.isArray(x)?x:(Array.isArray(x.rows)?x.rows:[])})() : csvObjects(text);
  if(raw.length>5000)throw new Error("Import is limited to 5,000 rows per batch.");
  return raw.map((input,i)=>normalize(type,input,i+2));
}
function normalize(type:ImportType,input:Record<string,unknown>,row:number):PreviewRow{
  const warnings:string[]=[]; const errors:string[]=[];
  try{
    let data:Record<string,unknown>;
    if(type==="redirects"){
      const oldPath=String(input.oldPath??input.sourcePath??"").trim(),newPath=String(input.newPath??input.destinationPath??"").trim();
      data=redirectSchema.parse({oldPath,newPath,type:String(input.type??"PERMANENT").toUpperCase()==="302"?"TEMPORARY":String(input.type??"PERMANENT").toUpperCase(),active:bool(input.active,true)});
    }else if(type==="subscribers"){
      data=subscriberSchema.parse({email:String(input.email??"").trim().toLowerCase(),name:String(input.name??"").trim()||null,status:String(input.status??"ACTIVE").toUpperCase(),source:String(input.source??"import").trim()||"import"});
    }else if(type==="ai-tools"){
      data=aiToolSchema.parse({name:String(input.name??"").trim(),slug:String(input.slug??"").trim()||undefined,websiteUrl:String(input.websiteUrl??input.url??"").trim(),shortDescription:String(input.shortDescription??input.description??"").trim(),categorySlug:String(input.categorySlug??input.category??"").trim(),pricingModel:String(input.pricingModel??"FREEMIUM").toUpperCase(),startingPrice:String(input.startingPrice??"").trim()?Number(input.startingPrice):null,currency:String(input.currency??"").trim().toUpperCase()||null,status:String(input.status??"DRAFT").toUpperCase()});
      if(!data.slug)data.slug=slugify(String(data.name));
    }else{
      data=postSchema.parse({title:String(input.title??"").trim(),slug:String(input.slug??"").trim()||undefined,excerpt:String(input.excerpt??"").trim()||null,content:String(input.content??"").trim(),categorySlug:String(input.categorySlug??input.category??"").trim()||null,authorEmail:String(input.authorEmail??input.author??"").trim().toLowerCase(),status:String(input.status??"DRAFT").toUpperCase()});
      if(!data.slug)data.slug=slugify(String(data.title));
      if(data.status!=="DRAFT")warnings.push("Imported posts are forced to DRAFT for editorial safety.");
      data.status="DRAFT";
    }
    return {row,valid:true,warnings,errors,data};
  }catch(e){
    const maybe=e as {issues?:Array<{path:(string|number)[];message:string}>};
    if(Array.isArray(maybe?.issues))errors.push(...maybe.issues.map((x)=>`${x.path.join(".")||"row"}: ${x.message}`));
    else errors.push(e instanceof Error?e.message:"Invalid row");
    return {row,valid:false,warnings,errors,data:input}
  }
}
export async function commitImport(type:ImportType,rows:PreviewRow[]){
  const valid=rows.filter(r=>r.valid);
  return prisma.$transaction(async tx=>{
    let created=0,updated=0;
    for(const r of valid){
      const d=r.data as any;
      if(type==="redirects"){
        const existing=await tx.redirect.findUnique({where:{oldPath:d.oldPath}});
        await tx.redirect.upsert({where:{oldPath:d.oldPath},update:{newPath:d.newPath,type:d.type,active:d.active},create:{oldPath:d.oldPath,newPath:d.newPath,type:d.type,active:d.active}});
        existing?updated++:created++;
      }else if(type==="subscribers"){
        const existing=await tx.newsletterSubscriber.findUnique({where:{email:d.email}});
        await tx.newsletterSubscriber.upsert({where:{email:d.email},update:{name:d.name,status:d.status,source:d.source,confirmedAt:d.status==="ACTIVE"?(existing?.confirmedAt??new Date()):existing?.confirmedAt},create:{email:d.email,name:d.name,status:d.status,source:d.source,confirmedAt:d.status==="ACTIVE"?new Date():null}});
        existing?updated++:created++;
      }else if(type==="ai-tools"){
        const cat=await tx.aiToolCategory.findUnique({where:{slug:d.categorySlug}}); if(!cat)throw new Error(`AI Tool category not found: ${d.categorySlug}`);
        const existing=await tx.aiTool.findUnique({where:{slug:d.slug}});
        await tx.aiTool.upsert({where:{slug:d.slug},update:{name:d.name,websiteUrl:d.websiteUrl,shortDescription:d.shortDescription,categoryId:cat.id,pricingModel:d.pricingModel,startingPrice:d.startingPrice,currency:d.currency,status:d.status},create:{name:d.name,slug:d.slug,websiteUrl:d.websiteUrl,shortDescription:d.shortDescription,fullDescription:textDoc(d.shortDescription),categoryId:cat.id,pricingModel:d.pricingModel,startingPrice:d.startingPrice,currency:d.currency,status:d.status}});
        existing?updated++:created++;
      }else{
        const author=await tx.user.findUnique({where:{email:d.authorEmail}});if(!author)throw new Error(`Author not found: ${d.authorEmail}`);
        const cat=d.categorySlug?await tx.category.findUnique({where:{slug:d.categorySlug}}):null;if(d.categorySlug&&!cat)throw new Error(`Category not found: ${d.categorySlug}`);
        const existing=await tx.post.findUnique({where:{slug:d.slug}});
        const content=textDoc(d.content||"");
        if(existing){await tx.post.update({where:{id:existing.id},data:{title:d.title,excerpt:d.excerpt,content,authorId:author.id,categoryId:cat?.id??null,status:"DRAFT",publishedAt:null,scheduledAt:null}});updated++}
        else{await tx.post.create({data:{title:d.title,slug:d.slug,excerpt:d.excerpt,content,authorId:author.id,categoryId:cat?.id??null,status:"DRAFT"}});created++}
      }
    }
    return {created,updated,total:valid.length};
  });
}
export async function exportRows(type:string){
  if(type==="redirects")return (await prisma.redirect.findMany({orderBy:{oldPath:"asc"}})).map(x=>({sourcePath:x.oldPath,destinationPath:x.newPath,type:x.type==="PERMANENT"?301:302,active:x.active,hits:x.hits.toString()}));
  if(type==="subscribers")return (await prisma.newsletterSubscriber.findMany({orderBy:{createdAt:"desc"}})).map(x=>({email:x.email,name:x.name,status:x.status,source:x.source,createdAt:x.createdAt.toISOString()}));
  if(type==="affiliate-links")return (await prisma.affiliateLink.findMany({orderBy:{createdAt:"desc"}})).map(x=>({name:x.name,slug:x.slug,destinationUrl:x.destinationUrl,affiliateUrl:x.affiliateUrl,campaign:x.campaign,active:x.active,clicks:x.clicks.toString()}));
  if(type==="ai-tools")return (await prisma.aiTool.findMany({where:{deletedAt:null},include:{category:true},orderBy:{name:"asc"}})).map(x=>({name:x.name,slug:x.slug,websiteUrl:x.websiteUrl,shortDescription:x.shortDescription,categorySlug:x.category.slug,pricingModel:x.pricingModel,startingPrice:x.startingPrice?.toString()??"",currency:x.currency??"",status:x.status}));
  if(type==="posts")return (await prisma.post.findMany({where:{deletedAt:null},include:{category:true,author:true},orderBy:{createdAt:"desc"}})).map(x=>({title:x.title,slug:x.slug,excerpt:x.excerpt??"",categorySlug:x.category?.slug??"",authorEmail:x.author.email,status:x.status,publishedAt:x.publishedAt?.toISOString()??""}));
  throw new Error("Unsupported export type");
}
export async function serializeExport(type:string,format:string){
  const rows=await exportRows(type); return format==="json"?JSON.stringify(rows,null,2):toCsv(rows);
}
