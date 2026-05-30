/**
 * Unified LLM client factory — OpenAI-compatible via OpenRouter.
 *
 * One key (OPENROUTER_API_KEY) unlocks every model: DeepSeek, Claude, GPT,
 * Gemini, Llama, Mistral, Qwen — switch by changing the model ID string.
 * Default: deepseek/deepseek-chat ($0.35/$0.50 per M tokens).
 */
import OpenAI from "openai";
import { getEnv } from "@/lib/envFallback";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

export function createLLMClient(): OpenAI {
  const key = getEnv("OPENROUTER_API_KEY");
  if (!key) throw new Error("OPENROUTER_API_KEY env var is required.");
  return new OpenAI({
    baseURL: OPENROUTER_BASE,
    apiKey: key,
    defaultHeaders: {
      "HTTP-Referer": getEnv("NEXT_PUBLIC_APP_URL") || "https://www.seoforge.org",
      "X-Title": "SEOForge",
    },
  });
}

export function resolveModel(modelId: string): string {
  return modelId;
}
