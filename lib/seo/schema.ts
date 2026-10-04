import { env } from "@/lib/env";
import { canonicalUrl } from "@/lib/seo/site";

export function organizationSchema(input:{name:string;logo?:string;social?:string[]}){
  return {"@context":"https://schema.org","@type":"Organization",name:input.name,url:env.SITE_URL,...(input.logo?{logo:canonicalUrl(input.logo)}:{}),...(input.social?.length?{sameAs:input.social}:{})};
}
export function websiteSchema(name:string){return {"@context":"https://schema.org","@type":"WebSite",name,url:env.SITE_URL,potentialAction:{"@type":"SearchAction",target:`${env.SITE_URL}/search?q={search_term_string}`,"query-input":"required name=search_term_string"}}}
export function breadcrumbSchema(items:{name:string;url:string}[]){return {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:items.map((x,i)=>({"@type":"ListItem",position:i+1,name:x.name,item:canonicalUrl(x.url)}))}}
export function articleSchema(input:{headline:string;description?:string|null;url:string;image?:string|null;datePublished?:Date|null;dateModified:Date;author:string;schemaType?:string|null}){
  const allowed=input.schemaType==="Article"?"Article":"BlogPosting";
  return {"@context":"https://schema.org","@type":allowed,headline:input.headline,description:input.description||undefined,mainEntityOfPage:canonicalUrl(input.url),image:input.image?canonicalUrl(input.image):undefined,datePublished:input.datePublished?.toISOString(),dateModified:input.dateModified.toISOString(),author:{"@type":"Person",name:input.author},publisher:{"@type":"Organization",name:"PushStream",url:env.SITE_URL}};
}
export function faqSchema(items:{question:string;answer:string}[]){return {"@context":"https://schema.org","@type":"FAQPage",mainEntity:items.map(x=>({"@type":"Question",name:x.question,acceptedAnswer:{"@type":"Answer",text:x.answer}}))}}
export function structuredReviewSchema(input:{name:string;itemName:string;itemUrl?:string|null;rating:number;body?:string|null}){return {"@context":"https://schema.org","@type":"Review",name:input.name,reviewBody:input.body||undefined,author:{"@type":"Organization",name:"PushStream",url:env.SITE_URL},itemReviewed:{"@type":"SoftwareApplication",name:input.itemName,...(input.itemUrl?{url:input.itemUrl}:{})},reviewRating:{"@type":"Rating",ratingValue:input.rating,bestRating:5,worstRating:1}}}

export function personSchema(input:{name:string;url:string;jobTitle?:string|null;description?:string|null;sameAs?:string[];expertise?:string[]}){return {"@context":"https://schema.org","@type":"Person",name:input.name,url:canonicalUrl(input.url),jobTitle:input.jobTitle||undefined,description:input.description||undefined,...(input.sameAs?.length?{sameAs:input.sameAs}:{}),...(input.expertise?.length?{knowsAbout:input.expertise}: {})}}
