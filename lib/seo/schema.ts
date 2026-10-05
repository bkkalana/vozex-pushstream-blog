import { env } from "@/lib/env";
import { canonicalUrl } from "@/lib/seo/site";

export function organizationSchema(input:{name:string;logo?:string;social?:string[]}){
  return {
    "@context":"https://schema.org",
    "@type":"Organization",
    name:input.name,
    url:env.SITE_URL,
    ...(input.logo?{logo:canonicalUrl(input.logo)}:{}),
    ...(input.social?.length?{sameAs:input.social}:{})
  };
}

export function websiteSchema(name:string, alternateName?:string){
  return {
    "@context":"https://schema.org",
    "@type":"WebSite",
    name,
    ...(alternateName?{alternateName}:{}),
    url:env.SITE_URL,
    inLanguage:"en"
  };
}

export function breadcrumbSchema(items:{name:string;url:string}[]){
  return {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:items.map((x,i)=>({"@type":"ListItem",position:i+1,name:x.name,item:canonicalUrl(x.url)}))}
}

export function articleSchema(input:{headline:string;description?:string|null;url:string;image?:string|null;datePublished?:Date|null;dateModified:Date;author:string;authorUrl?:string|null;schemaType?:string|null;publisherLogo?:string|null}){
  const allowed=input.schemaType==="Article"?"Article":input.schemaType==="NewsArticle"?"NewsArticle":"BlogPosting";
  return {
    "@context":"https://schema.org",
    "@type":allowed,
    headline:input.headline,
    description:input.description||undefined,
    mainEntityOfPage:{"@type":"WebPage","@id":canonicalUrl(input.url)},
    image:input.image?[canonicalUrl(input.image)]:undefined,
    datePublished:input.datePublished?.toISOString(),
    dateModified:input.dateModified.toISOString(),
    author:{
      "@type":"Person",
      name:input.author,
      ...(input.authorUrl?{url:canonicalUrl(input.authorUrl)}:{})
    },
    publisher:{
      "@type":"Organization",
      name:"PushStream",
      url:env.SITE_URL,
      ...(input.publisherLogo?{logo:{"@type":"ImageObject",url:canonicalUrl(input.publisherLogo)}}:{})
    }
  };
}

export function faqSchema(items:{question:string;answer:string}[]){
  return {"@context":"https://schema.org","@type":"FAQPage",mainEntity:items.map(x=>({"@type":"Question",name:x.question,acceptedAnswer:{"@type":"Answer",text:x.answer}}))}
}

export function structuredReviewSchema(input:{name:string;itemName:string;itemUrl?:string|null;rating:number;body?:string|null}){
  return {"@context":"https://schema.org","@type":"Review",name:input.name,reviewBody:input.body||undefined,author:{"@type":"Organization",name:"PushStream",url:env.SITE_URL},itemReviewed:{"@type":"SoftwareApplication",name:input.itemName,...(input.itemUrl?{url:input.itemUrl}:{})},reviewRating:{"@type":"Rating",ratingValue:input.rating,bestRating:5,worstRating:1}}
}

export function personSchema(input:{name:string;url:string;jobTitle?:string|null;description?:string|null;sameAs?:string[];expertise?:string[]}){
  return {"@context":"https://schema.org","@type":"Person",name:input.name,url:canonicalUrl(input.url),jobTitle:input.jobTitle||undefined,description:input.description||undefined,...(input.sameAs?.length?{sameAs:input.sameAs}:{}),...(input.expertise?.length?{knowsAbout:input.expertise}: {})}
}
