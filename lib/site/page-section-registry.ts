export const PUBLIC_PAGE_KEYS = [
  "home","latest","wordpress","development","how-to","online-business","ai-tools","reviews","comparisons","about","contact","resources"
] as const;
export type PublicPageKey = (typeof PUBLIC_PAGE_KEYS)[number];

export const PUBLIC_SECTION_TYPES = [
  "hero_split","hero_editorial","stats_row","category_cards","article_grid","article_featured_grid",
  "article_sidebar_layout","tool_cards","tool_directory","review_cards","comparison_table","team_grid",
  "values_grid","mission_vision","contact_form_layout","contact_cards","faq_grid","newsletter_band",
  "social_grid","featured_guide","promo_card","manual_cards"
] as const;
export type PublicSectionType = (typeof PUBLIC_SECTION_TYPES)[number];

export type PageDefinition = {key:PublicPageKey;label:string;href:string;description:string;defaults:Array<{sectionKey:string;sectionType:PublicSectionType;heading?:string;description?:string;dataSource?:string;itemCount?:number}>};

export const PUBLIC_PAGE_DEFINITIONS: PageDefinition[] = [
  {key:"home",label:"Home",href:"/",description:"Main publication landing page.",defaults:[
    {sectionKey:"hero",sectionType:"hero_split",heading:"Smarter Tech. Better Solutions."},
    {sectionKey:"stats",sectionType:"stats_row"},
    {sectionKey:"categories",sectionType:"category_cards",heading:"Popular Categories",dataSource:"featured_categories",itemCount:6},
    {sectionKey:"trending",sectionType:"article_grid",heading:"Trending Articles",dataSource:"trending_posts",itemCount:4},
    {sectionKey:"latest",sectionType:"article_grid",heading:"Latest Articles",dataSource:"latest_posts",itemCount:4},
    {sectionKey:"tools",sectionType:"tool_cards",heading:"Featured Tools",dataSource:"featured_tools",itemCount:6},
    {sectionKey:"reviews",sectionType:"review_cards",heading:"Reviews & Comparisons",dataSource:"latest_reviews",itemCount:4},
    {sectionKey:"newsletter",sectionType:"newsletter_band",heading:"Get the Latest Tech Guides in Your Inbox"},
  ]},
  {key:"latest",label:"Blog / Latest",href:"/latest",description:"Latest articles, filters, featured story and sidebar modules.",defaults:[
    {sectionKey:"hero",sectionType:"hero_editorial",heading:"Latest Articles"},
    {sectionKey:"stats",sectionType:"stats_row"},
    {sectionKey:"featured",sectionType:"article_featured_grid",heading:"Featured Article",dataSource:"featured_posts",itemCount:1},
    {sectionKey:"articles",sectionType:"article_sidebar_layout",heading:"All Articles",dataSource:"latest_posts",itemCount:12},
    {sectionKey:"newsletter",sectionType:"newsletter_band",heading:"Get New Articles in Your Inbox"}
  ]},
  {key:"wordpress",label:"WordPress",href:"/wordpress",description:"WordPress fixes and guides landing page.",defaults:[
    {sectionKey:"hero",sectionType:"hero_split",heading:"WordPress Fixes"},
    {sectionKey:"stats",sectionType:"stats_row"},
    {sectionKey:"topics",sectionType:"category_cards",heading:"Popular WordPress Topics",dataSource:"wordpress_topics",itemCount:8},
    {sectionKey:"articles",sectionType:"article_sidebar_layout",heading:"Latest WordPress Fixes",dataSource:"category:wordpress",itemCount:12},
    {sectionKey:"featured-guide",sectionType:"featured_guide",heading:"Featured WordPress Guide",dataSource:"featured_posts",itemCount:1},
    {sectionKey:"newsletter",sectionType:"newsletter_band",heading:"Get Weekly WordPress Fixes"}
  ]},
  {key:"development",label:"Development",href:"/development",description:"Development topic landing page.",defaults:[
    {sectionKey:"hero",sectionType:"hero_split",heading:"Web Development"},
    {sectionKey:"stats",sectionType:"stats_row"},
    {sectionKey:"topics",sectionType:"category_cards",heading:"Development Topics",dataSource:"category:development",itemCount:8},
    {sectionKey:"articles",sectionType:"article_sidebar_layout",heading:"Latest Development Guides",dataSource:"category:development",itemCount:12},
    {sectionKey:"featured-guide",sectionType:"featured_guide",heading:"Featured Development Guide",dataSource:"featured_posts",itemCount:1},
    {sectionKey:"newsletter",sectionType:"newsletter_band",heading:"Build Better Every Week"}
  ]},
  {key:"how-to",label:"How-To",href:"/how-to",description:"Step-by-step tutorial landing page.",defaults:[
    {sectionKey:"hero",sectionType:"hero_split",heading:"How-To Guides"},
    {sectionKey:"stats",sectionType:"stats_row"},
    {sectionKey:"topics",sectionType:"category_cards",heading:"Browse How-To Topics",dataSource:"category:how-to",itemCount:8},
    {sectionKey:"articles",sectionType:"article_sidebar_layout",heading:"Latest How-To Guides",dataSource:"category:how-to",itemCount:12},
    {sectionKey:"featured-guide",sectionType:"featured_guide",heading:"Featured How-To Guide",dataSource:"featured_posts",itemCount:1},
    {sectionKey:"newsletter",sectionType:"newsletter_band",heading:"Practical Guides, Delivered"}
  ]},
  {key:"online-business",label:"Online Business",href:"/online-business",description:"Online business, SEO, monetization and growth guides.",defaults:[
    {sectionKey:"hero",sectionType:"hero_split",heading:"Online Business"},
    {sectionKey:"stats",sectionType:"stats_row"},
    {sectionKey:"topics",sectionType:"category_cards",heading:"Online Business Topics",dataSource:"category:online-business",itemCount:8},
    {sectionKey:"articles",sectionType:"article_sidebar_layout",heading:"Latest Online Business Guides",dataSource:"category:online-business",itemCount:12},
    {sectionKey:"featured-guide",sectionType:"featured_guide",heading:"Featured Growth Guide",dataSource:"featured_posts",itemCount:1},
    {sectionKey:"newsletter",sectionType:"newsletter_band",heading:"Grow Smarter Every Week"}
  ]},
  {key:"ai-tools",label:"AI Tools",href:"/ai-tools",description:"AI tools directory and editorial picks.",defaults:[{sectionKey:"hero",sectionType:"hero_split",heading:"Best AI Tools for Content Creators"},{sectionKey:"stats",sectionType:"stats_row"},{sectionKey:"categories",sectionType:"category_cards",heading:"Popular AI Tool Categories",dataSource:"ai_tool_categories",itemCount:6},{sectionKey:"top-tools",sectionType:"tool_cards",heading:"Editor’s Choice",dataSource:"featured_tools",itemCount:4},{sectionKey:"directory",sectionType:"tool_directory",heading:"Compare AI Tools",dataSource:"all_tools",itemCount:20},{sectionKey:"reviews",sectionType:"review_cards",heading:"Latest AI Tool Reviews",dataSource:"latest_reviews",itemCount:4},{sectionKey:"newsletter",sectionType:"newsletter_band",heading:"Get Better AI Tool Picks in Your Inbox"}]},
  {key:"reviews",label:"Reviews",href:"/reviews",description:"Reviews listing and editorial review modules.",defaults:[{sectionKey:"hero",sectionType:"hero_editorial",heading:"Reviews & Comparisons"},{sectionKey:"reviews",sectionType:"article_sidebar_layout",dataSource:"latest_reviews",itemCount:12},{sectionKey:"newsletter",sectionType:"newsletter_band"}]},
  {key:"comparisons",label:"Comparisons",href:"/comparisons",description:"Comparison listing page.",defaults:[{sectionKey:"hero",sectionType:"hero_editorial",heading:"Product Comparisons"},{sectionKey:"comparisons",sectionType:"comparison_table",dataSource:"latest_comparisons",itemCount:12},{sectionKey:"newsletter",sectionType:"newsletter_band"}]},
  {key:"about",label:"About",href:"/about",description:"About PushStream, mission, team and values.",defaults:[{sectionKey:"hero",sectionType:"hero_split",heading:"A Smarter Web For Everyone."},{sectionKey:"mission",sectionType:"mission_vision",heading:"Our Mission & Vision"},{sectionKey:"topics",sectionType:"category_cards",heading:"Topics on PushStream",dataSource:"featured_categories",itemCount:6},{sectionKey:"team",sectionType:"team_grid",heading:"The People Behind PushStream",dataSource:"authors",itemCount:4},{sectionKey:"values",sectionType:"values_grid",heading:"What Guides Us",itemCount:4},{sectionKey:"community",sectionType:"stats_row",heading:"A Growing Community"},{sectionKey:"newsletter",sectionType:"newsletter_band"}]},
  {key:"contact",label:"Contact",href:"/contact",description:"Contact form, contact channels, FAQ and community links.",defaults:[{sectionKey:"hero",sectionType:"hero_split",heading:"We’d Love to Hear from You"},{sectionKey:"contact",sectionType:"contact_form_layout",heading:"Send Us a Message"},{sectionKey:"methods",sectionType:"contact_cards",heading:"Contact Information",itemCount:4},{sectionKey:"faq",sectionType:"faq_grid",heading:"Quick Answers",itemCount:6},{sectionKey:"social",sectionType:"social_grid",heading:"Follow & Connect",itemCount:5},{sectionKey:"newsletter",sectionType:"newsletter_band"}]},
  {key:"resources",label:"Resources",href:"/resources",description:"Curated resource directory.",defaults:[{sectionKey:"hero",sectionType:"hero_editorial",heading:"Resources"},{sectionKey:"directory",sectionType:"manual_cards",dataSource:"resources",itemCount:20},{sectionKey:"newsletter",sectionType:"newsletter_band"}]},
];

export function getPageDefinition(pageKey:string){return PUBLIC_PAGE_DEFINITIONS.find(x=>x.key===pageKey)??null}
export function isPublicPageKey(value:string):value is PublicPageKey{return PUBLIC_PAGE_KEYS.includes(value as PublicPageKey)}
export function isPublicSectionType(value:string):value is PublicSectionType{return PUBLIC_SECTION_TYPES.includes(value as PublicSectionType)}
