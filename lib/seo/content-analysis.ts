export type SeoCheckStatus = "GOOD" | "NEEDS_IMPROVEMENT" | "MISSING";
export type SeoCheck = { id:string; group:"Basic SEO"|"Readability"|"Images"|"Links"|"Schema"|"Social preview"; label:string; status:SeoCheckStatus; message:string; target?:string };

type Node={type?:string;attrs?:Record<string,unknown>;text?:string;content?:Node[];marks?:Array<{type?:string;attrs?:Record<string,unknown>}>};
export type SeoAnalysisInput={title:string;seoTitle?:string|null;seoDescription?:string|null;focusKeyword?:string|null;excerpt?:string|null;slug?:string|null;canonicalUrl?:string|null;featuredImageId?:string|null;featuredImageAlt?:string|null;ogImageId?:string|null;schemaType?:string|null;content:unknown};
function walk(node:Node|undefined, fn:(n:Node)=>void){if(!node)return;fn(node);node.content?.forEach(x=>walk(x,fn))}
function doc(input:unknown):Node{return input&&typeof input==="object"?input as Node:{type:"doc",content:[]}}
function textOf(n:Node|undefined){let out="";walk(n,x=>{if(x.text)out+=`${x.text} `});return out.trim()}
function norm(s:string){return s.trim().toLowerCase()}
export function analyzeSeo(input:SeoAnalysisInput):SeoCheck[]{
 const root=doc(input.content), all=textOf(root), keyword=norm(input.focusKeyword||"");
 const headings:string[]=[]; const paragraphs:string[]=[]; let images=0,missingAlt=0,internal=0,external=0,faq=false;
 walk(root,n=>{if(n.type==="heading"){headings.push(textOf(n))} if(n.type==="paragraph"){const t=textOf(n);if(t)paragraphs.push(t)} if(n.type==="image"){images++;if(!String(n.attrs?.alt||"").trim())missingAlt++} if(n.type==="customBlock"&&String(n.attrs?.kind)==="faq")faq=true; for(const mark of n.marks||[]){if(mark.type==="link"){const href=String(mark.attrs?.href||"");if(href.startsWith("/")||href.includes("pushstream.online"))internal++;else if(/^https?:\/\//i.test(href))external++}}});
 const intro=paragraphs.slice(0,2).join(" ").toLowerCase(), seoTitle=(input.seoTitle||input.title).trim(), desc=(input.seoDescription||"").trim(), slug=(input.slug||"").trim();
 const sentences=all.split(/[.!?]+\s+/).filter(Boolean);const words=all.split(/\s+/).filter(Boolean);const longParas=paragraphs.filter(x=>x.split(/\s+/).length>120).length;const avgSentence=sentences.length?Math.round(words.length/sentences.length):0;
 const c:SeoCheck[]=[]; const add=(group:SeoCheck["group"],id:string,label:string,status:SeoCheckStatus,message:string,target?:string)=>c.push({group,id,label,status,message,target});
 add("Basic SEO","seo-title","SEO title",!seoTitle?"MISSING":seoTitle.length>=30&&seoTitle.length<=60?"GOOD":"NEEDS_IMPROVEMENT",!seoTitle?"Add an SEO title.":`${seoTitle.length} characters; aim for about 30–60.`,"seoTitle");
 add("Basic SEO","meta-description","Meta description",!desc?"MISSING":desc.length>=120&&desc.length<=160?"GOOD":"NEEDS_IMPROVEMENT",!desc?"Add a meta description.":`${desc.length} characters; aim for about 120–160.`,"seoDescription");
 add("Basic SEO","focus-keyword","Focus keyword",!keyword?"MISSING":"GOOD",keyword?`Focus keyword: ${input.focusKeyword}`:"Add a focus keyword for deterministic checks.","focusKeyword");
 if(keyword){add("Basic SEO","keyword-title","Keyword in title",seoTitle.toLowerCase().includes(keyword)?"GOOD":"NEEDS_IMPROVEMENT",seoTitle.toLowerCase().includes(keyword)?"Focus keyword appears in the title.":"Consider using the focus keyword naturally in the title.","seoTitle");add("Basic SEO","keyword-intro","Keyword in introduction",intro.includes(keyword)?"GOOD":"NEEDS_IMPROVEMENT",intro.includes(keyword)?"Focus keyword appears near the introduction.":"Consider mentioning the focus keyword naturally near the introduction.","content");add("Basic SEO","keyword-heading","Keyword in headings",headings.some(x=>x.toLowerCase().includes(keyword))?"GOOD":"NEEDS_IMPROVEMENT",headings.some(x=>x.toLowerCase().includes(keyword))?"Focus keyword appears in a heading.":"A relevant heading may include the focus keyword when natural.","content")}
 add("Basic SEO","excerpt","Excerpt",input.excerpt?.trim()?"GOOD":"MISSING",input.excerpt?.trim()?"Excerpt is present.":"Add a concise excerpt.","excerpt");
 add("Basic SEO","canonical","Canonical URL",input.canonicalUrl?.trim()?"GOOD":"MISSING",input.canonicalUrl?.trim()?"Canonical URL is set.":"Set a canonical URL before publication.","canonicalUrl");
 add("Basic SEO","slug","Slug length",!slug?"MISSING":slug.length<=75?"GOOD":"NEEDS_IMPROVEMENT",!slug?"Generate or enter a slug.":`${slug.length} characters; keep it concise.`,"slug");
 add("Readability","h2","H2 headings",headings.length?"GOOD":"MISSING",headings.length?`${headings.length} headings detected.`:"Add descriptive section headings.","content");
 add("Readability","article-length","Article length",words.length<300?"NEEDS_IMPROVEMENT":"GOOD",`${words.length} words. Very short content may not fully answer the topic; length is not a ranking guarantee.`,"content");
 add("Readability","paragraph-length","Paragraph length",longParas===0?"GOOD":"NEEDS_IMPROVEMENT",longParas===0?"No very long paragraphs detected.":`${longParas} paragraph(s) exceed 120 words.`,"content");
 add("Readability","sentence-length","Sentence length",avgSentence&&avgSentence<=30?"GOOD":"NEEDS_IMPROVEMENT",avgSentence?`Average sentence length is approximately ${avgSentence} words.`:"No sentence text detected.","content");
 add("Images","featured-image","Featured image",input.featuredImageId?"GOOD":"MISSING",input.featuredImageId?"Featured image is selected.":"Select a featured image.","featuredImage");
 add("Images","featured-alt","Featured image alt",!input.featuredImageId?"MISSING":input.featuredImageAlt?.trim()?"GOOD":"MISSING",input.featuredImageAlt?.trim()?"Featured image alt text is present.":"Add useful alt text for the featured image.","featuredImageAlt");
 if(images)add("Images","inline-alt","Inline image alt text",missingAlt===0?"GOOD":"NEEDS_IMPROVEMENT",missingAlt===0?`${images} inline image(s) include alt text.`:`${missingAlt} of ${images} inline image(s) are missing alt text.`,"content");
 add("Links","internal-links","Internal links",internal>0?"GOOD":"MISSING",internal?`${internal} internal link(s) detected.`:"Add useful internal links where relevant.","content");
 add("Links","external-links","External links",external>0?"GOOD":"NEEDS_IMPROVEMENT",external?`${external} external link(s) detected.`:"No external source links detected; add them when factual sourcing benefits the article.","content");
 add("Schema","schema","Schema type",input.schemaType?.trim()?"GOOD":"MISSING",input.schemaType?.trim()?`Schema type: ${input.schemaType}.`:"Choose an appropriate schema type.","schemaType");
 add("Schema","faq","FAQ availability",faq?"GOOD":"NEEDS_IMPROVEMENT",faq?"FAQ block detected.":"FAQ is optional; add only when it genuinely helps readers.","content");
 add("Social preview","og-image","Open Graph image",input.ogImageId||input.featuredImageId?"GOOD":"MISSING",input.ogImageId||input.featuredImageId?"A social preview image is available.":"Add an OG image or featured image.","featuredImage");
 return c;
}
