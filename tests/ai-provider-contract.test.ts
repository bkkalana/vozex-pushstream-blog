import { describe, expect, it } from "vitest";
import { providerConfigurationStatus } from "@/services/ai/provider";
describe("AI provider abstraction",()=>{it("exposes all supported provider adapters without credentials",()=>{expect(Object.keys(providerConfigurationStatus()).sort()).toEqual(["ANTHROPIC","GEMINI","LOCAL","OPENAI"]);});});
