import { prisma } from "@/lib/db/prisma";
export const AD_PLACEMENTS=["HOME_AFTER_HERO","HOME_BETWEEN_SECTIONS","ARTICLE_AFTER_INTRO","ARTICLE_AFTER_SELECTED_PARAGRAPH","ARTICLE_MIDDLE","ARTICLE_BEFORE_FAQ","ARTICLE_BEFORE_RELATED_POSTS","SIDEBAR","ARCHIVE"] as const;
export type AdPlacement=typeof AD_PLACEMENTS[number];
export type AdContext={categoryId?:string|null;articleType?:string|null};
export const adService={
 list:()=>prisma.adSlot.findMany({orderBy:{key:"asc"}}),
 async getEnabled(key:AdPlacement,context:AdContext={}){const now=new Date();return prisma.adSlot.findFirst({where:{key,enabled:true,AND:[{OR:[{startAt:null},{startAt:{lte:now}}]},{OR:[{endAt:null},{endAt:{gte:now}}]},{OR:[{targetCategoryId:null},{targetCategoryId:context.categoryId||"__none__"}]},{OR:[{targetArticleType:null},{targetArticleType:context.articleType||"__none__"}]}]}})},
 async seedSlots(){for(const key of AD_PLACEMENTS)await prisma.adSlot.upsert({where:{key},create:{key,label:"Advertisement",enabled:false,device:"ALL",desktopEnabled:true,tabletEnabled:true,mobileEnabled:true},update:{}})},
};

export function isAdScheduleActive(input:{enabled:boolean;startAt:Date|null;endAt:Date|null},now=new Date()){return input.enabled&&(!input.startAt||input.startAt<=now)&&(!input.endAt||input.endAt>=now)}
export function adMatchesContext(input:{targetCategoryId:string|null;targetArticleType:string|null},context:AdContext={}){return(!input.targetCategoryId||input.targetCategoryId===context.categoryId)&&(!input.targetArticleType||input.targetArticleType===context.articleType)}
