import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

export const settingDefaults={"general.siteName":"PushStream","general.tagline":"Smarter Tech. Better Solutions.","general.adminEmail":"","general.timezone":"Asia/Colombo","general.logoUrl":"/branding/pushstream-logo.png","general.faviconUrl":"/branding/favicon.ico","general.footerBrandCardTitle":"Build a smarter web with PushStream","general.footerBrandCardBody":"Tutorials, tools, reviews, and practical ideas for creators and businesses.","general.footerCommunityMessage":"Made with ♥ for the web community.","appearance.primary":"#2563EB","appearance.primaryHover":"#1D4ED8","appearance.secondary":"#0B1F3A","appearance.accent":"#287BFF","appearance.foreground":"#0B1F3A","appearance.background":"#FFFFFF","appearance.backgroundSoft":"#F5F9FF","appearance.backgroundBlue":"#EFF6FF","appearance.border":"#E4ECF5","appearance.textSecondary":"#526174","appearance.textMuted":"#6B7A90","appearance.fontFamily":"Inter","social.facebook":"","social.twitter":"","social.linkedin":"","social.youtube":"","social.instagram":"","analytics.googleAnalyticsId":"G-CT25S0HK0Y","analytics.googleTagManagerId":"","comments.enabled":true,"comments.requireModeration":true,"newsletter.confirmationRequired":true,"performance.readingWordsPerMinute":225,"system.maintenanceMode":false,"ai.enabled":false,"ai.provider":"OPENAI","ai.model":"gpt-5.6-luna","ai.maxTokens":1800,"ai.dailyLimit":500,"ai.perUserDailyLimit":75,"ai.feature.rewrite":true,"ai.feature.metadata":true,"ai.feature.outline":true,"ai.feature.faq":true,"ai.feature.links":true} as const;

function isHttpUrl(value:string){
  try{
    const url=new URL(value);
    return url.protocol==="http:"||url.protocol==="https:";
  }catch{
    return false;
  }
}

function normalizeHttpUrl(value:string){
  const trimmed=value.trim();
  if(!trimmed)return "";
  if(/^https?:\/\//i.test(trimmed))return trimmed;
  if(/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}(?:[/:?#].*)?$/i.test(trimmed))return `https://${trimmed}`;
  return trimmed;
}

function isSafeInternalAssetUrl(value:string){
  // Site-managed logo/favicon/media settings may use a same-origin public path.
  // Protocol-relative URLs (//host/path), backslashes and control characters are rejected.
  return /^\/(?!\/)[^\\\u0000-\u001F]*$/.test(value);
}

function normalizeSettingValue(key:string,value:string|number|boolean){
  if(typeof value!=="string")return value;
  if(key.startsWith("social.")||key.endsWith("Url"))return normalizeHttpUrl(value);
  return value.trim();
}

function validate(key:string,value:string|number|boolean){
  if(key.endsWith("Email")&&value&&typeof value==="string"&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))throw new Error("Invalid email setting.");

  if(value&&typeof value==="string"){
    if(key.startsWith("social.")&&!isHttpUrl(value))throw new Error("Social profile URLs must use HTTP or HTTPS.");
    if((key==="general.logoUrl"||key==="general.faviconUrl")&&!isHttpUrl(value)&&!isSafeInternalAssetUrl(value))throw new Error("Logo and favicon URLs must be an HTTP/HTTPS URL or a site-relative path beginning with /.");
    if(key.endsWith("Url")&&!key.startsWith("social.")&&key!=="general.logoUrl"&&key!=="general.faviconUrl"&&!isHttpUrl(value))throw new Error("Only HTTP/HTTPS URLs are allowed.");
  }

  if(key==="analytics.googleAnalyticsId"&&value&&typeof value==="string"&&!/^(G-[A-Z0-9]+|UA-\d+-\d+)$/i.test(value))throw new Error("Invalid Google Analytics ID.");
  if(key==="analytics.googleTagManagerId"&&value&&typeof value==="string"&&!/^GTM-[A-Z0-9]+$/i.test(value))throw new Error("Invalid Google Tag Manager ID.");
  if(key==="performance.readingWordsPerMinute"&&(typeof value!=="number"||!Number.isFinite(value)||value<100||value>600))throw new Error("Reading speed must be 100–600 words/minute.");
}

export async function getSettingsMap(group?:string){
  const rows=await prisma.siteSetting.findMany({where:group?{group}:undefined,orderBy:{key:"asc"}});
  const map=new Map<string,unknown>(Object.entries(settingDefaults));
  for(const row of rows)map.set(row.key,row.value);
  return map;
}

export async function upsertSettings(group:string,values:Record<string,string|number|boolean>,userId?:string){
  const normalized=Object.fromEntries(Object.entries(values).map(([key,value])=>[key,normalizeSettingValue(key,value)])) as Record<string,string|number|boolean>;
  for(const[k,v]of Object.entries(normalized))validate(k,v);

  const keys=Object.keys(normalized);
  const before=await prisma.siteSetting.findMany({where:{key:{in:keys}},select:{key:true,value:true}});
  const previous=new Map(before.map(x=>[x.key,x.value]));

  // The settings write is the primary operation. Do not make it dependent on
  // optional history/audit storage being perfectly in sync with the deployment.
  await prisma.$transaction(
    Object.entries(normalized).map(([key,value])=>prisma.siteSetting.upsert({
      where:{key},
      update:{value,group},
      create:{key,value,group},
    })),
  );

  const changes=Object.entries(normalized).filter(([key,value])=>JSON.stringify(previous.get(key))!==JSON.stringify(value));
  if(changes.length===0)return;

  try{
    await prisma.$transaction(
      changes.map(([key,value])=>prisma.settingHistory.create({
        data:{
          userId:userId??null,
          group,
          key,
          oldValue:(previous.has(key)?previous.get(key):null) as never,
          newValue:value as never,
        },
      })),
    );
  }catch(error){
    logger.error("Settings history write failed",{
      group,
      keys:changes.map(([key])=>key),
      error:error instanceof Error?error.message:"unknown",
    });
  }
}

export function appearanceVariablesFromSettings(s:Map<string,unknown>){const value=(key:string,fallback:string)=>String(s.get(key)??fallback);return {"--primary":value("appearance.primary","#2563EB"),"--primary-electric":value("appearance.primary","#287BFF"),"--primary-hover":value("appearance.primaryHover","#1D4ED8"),"--secondary":value("appearance.secondary","#0B1F3A"),"--accent":value("appearance.accent","#287BFF"),"--foreground":value("appearance.foreground","#0B1F3A"),"--background":value("appearance.background","#FFFFFF"),"--background-soft":value("appearance.backgroundSoft","#F5F9FF"),"--background-blue":value("appearance.backgroundBlue","#EFF6FF"),"--border":value("appearance.border","#E4ECF5"),"--text-secondary":value("appearance.textSecondary","#526174"),"--text-muted":value("appearance.textMuted","#6B7A90")} as Record<string,string>}
export async function getAppearanceVariables(){return appearanceVariablesFromSettings(await getSettingsMap("appearance"))}
