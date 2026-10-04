import { env } from "@/lib/env";

export type AiProviderId = "OPENAI" | "ANTHROPIC" | "GEMINI" | "LOCAL";
export type AiProviderRequest = { model: string; system: string; prompt: string; maxTokens: number };
export type AiProviderResponse = { text: string; outputTokens: number | undefined };

export interface AiProvider {
  readonly id: AiProviderId;
  configured(): boolean;
  generateText(input: AiProviderRequest): Promise<AiProviderResponse>;
  summarize(input: AiProviderRequest): Promise<AiProviderResponse>;
  rewrite(input: AiProviderRequest): Promise<AiProviderResponse>;
  generateMetadata(input: AiProviderRequest): Promise<AiProviderResponse>;
  generateFaq(input: AiProviderRequest): Promise<AiProviderResponse>;
  generateOutline(input: AiProviderRequest): Promise<AiProviderResponse>;
}

abstract class BaseProvider implements AiProvider {
  abstract readonly id: AiProviderId;
  abstract configured(): boolean;
  abstract generateText(input: AiProviderRequest): Promise<AiProviderResponse>;
  summarize(input: AiProviderRequest) { return this.generateText(input); }
  rewrite(input: AiProviderRequest) { return this.generateText(input); }
  generateMetadata(input: AiProviderRequest) { return this.generateText(input); }
  generateFaq(input: AiProviderRequest) { return this.generateText(input); }
  generateOutline(input: AiProviderRequest) { return this.generateText(input); }
}

async function jsonOrThrow(response: Response) {
  const json = await response.json().catch(() => null) as Record<string, unknown> | null;
  if (!response.ok) {
    const message = typeof json?.error === "object" && json?.error && "message" in json.error
      ? String((json.error as {message?:unknown}).message || "Provider request failed")
      : `Provider request failed with HTTP ${response.status}`;
    throw new Error(message.slice(0, 300));
  }
  return json ?? {};
}

class OpenAiProvider extends BaseProvider {
  readonly id = "OPENAI" as const;
  configured() { return Boolean(env.OPENAI_API_KEY); }
  async generateText(input: AiProviderRequest) {
    if (!env.OPENAI_API_KEY) throw new Error("OpenAI is not configured.");
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ model: input.model, instructions: input.system, input: input.prompt, max_output_tokens: input.maxTokens }),
      signal: AbortSignal.timeout(90_000),
    });
    const json = await jsonOrThrow(response) as any;
    const text = typeof json.output_text === "string" ? json.output_text : (json.output ?? [])
      .flatMap((item:any) => item?.content ?? []).filter((part:any) => part?.type === "output_text")
      .map((part:any) => part.text).join("\n");
    if (!text?.trim()) throw new Error("OpenAI returned no text output.");
    return { text: text.trim(), outputTokens: Number(json.usage?.output_tokens || 0) || undefined };
  }
}

class AnthropicProvider extends BaseProvider {
  readonly id = "ANTHROPIC" as const;
  configured() { return Boolean(env.ANTHROPIC_API_KEY); }
  async generateText(input: AiProviderRequest) {
    if (!env.ANTHROPIC_API_KEY) throw new Error("Anthropic is not configured.");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: input.model, max_tokens: input.maxTokens, system: input.system, messages: [{ role: "user", content: input.prompt }] }),
      signal: AbortSignal.timeout(90_000),
    });
    const json = await jsonOrThrow(response) as any;
    const text = (json.content ?? []).filter((p:any) => p?.type === "text").map((p:any) => p.text).join("\n");
    if (!text?.trim()) throw new Error("Anthropic returned no text output.");
    return { text: text.trim(), outputTokens: Number(json.usage?.output_tokens || 0) || undefined };
  }
}

class GeminiProvider extends BaseProvider {
  readonly id = "GEMINI" as const;
  configured() { return Boolean(env.GEMINI_API_KEY); }
  async generateText(input: AiProviderRequest) {
    if (!env.GEMINI_API_KEY) throw new Error("Gemini is not configured.");
    const model = encodeURIComponent(input.model.replace(/^models\//, ""));
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": env.GEMINI_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: input.system }] },
        contents: [{ role: "user", parts: [{ text: input.prompt }] }],
        generationConfig: { maxOutputTokens: input.maxTokens },
      }),
      signal: AbortSignal.timeout(90_000),
    });
    const json = await jsonOrThrow(response) as any;
    const text = (json.candidates?.[0]?.content?.parts ?? []).map((p:any) => p?.text || "").join("\n");
    if (!text?.trim()) throw new Error("Gemini returned no text output.");
    return { text: text.trim(), outputTokens: Number(json.usageMetadata?.candidatesTokenCount || 0) || undefined };
  }
}

class LocalProvider extends BaseProvider {
  readonly id = "LOCAL" as const;
  configured() { return Boolean(env.LOCAL_AI_ENDPOINT); }
  async generateText(input: AiProviderRequest) {
    if (!env.LOCAL_AI_ENDPOINT) throw new Error("Local AI endpoint is not configured.");
    const response = await fetch(env.LOCAL_AI_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", ...(env.LOCAL_AI_API_KEY ? { authorization: `Bearer ${env.LOCAL_AI_API_KEY}` } : {}) },
      body: JSON.stringify(input), signal: AbortSignal.timeout(90_000),
    });
    const json = await jsonOrThrow(response) as any;
    const text = String(json.text || "").trim();
    if (!text) throw new Error("Local AI endpoint returned no text output.");
    return { text, outputTokens: Number(json.outputTokens || 0) || undefined };
  }
}

const providers: Record<AiProviderId, AiProvider> = {
  OPENAI: new OpenAiProvider(), ANTHROPIC: new AnthropicProvider(), GEMINI: new GeminiProvider(), LOCAL: new LocalProvider(),
};
export function getAiProvider(id: AiProviderId) { return providers[id]; }
export function providerConfigurationStatus() { return Object.fromEntries(Object.entries(providers).map(([id,p]) => [id,p.configured()])); }
