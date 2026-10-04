import { describe, expect, it } from "vitest";
import { aiGenerateSchema, aiSettingsSchema } from "@/lib/validation/ai";
import { buildAiPrompt, AI_EDITORIAL_SYSTEM } from "@/services/ai/prompts";

describe("AI editorial validation",()=>{
 it("accepts supported actions and rejects empty context",()=>{
  expect(aiGenerateSchema.parse({action:"rewrite",context:"Useful paragraph"}).action).toBe("rewrite");
  expect(()=>aiGenerateSchema.parse({action:"rewrite",context:""})).toThrow();
 });
 it("bounds provider settings",()=>{
  expect(()=>aiSettingsSchema.parse({enabled:true,provider:"OPENAI",model:"x",maxTokens:99999,dailyLimit:10,perUserDailyLimit:2,featureRewrite:true,featureMetadata:true,featureOutline:true,featureFaq:true,featureLinks:true})).toThrow();
 });
 it("keeps editorial safeguards in the system instruction",()=>{
  expect(AI_EDITORIAL_SYSTEM).toContain("Never claim the draft is verified");
  expect(AI_EDITORIAL_SYSTEM).toContain("Never include instructions to auto-publish");
  expect(buildAiPrompt("faq","Known context")).toContain("Known context");
 });
});
