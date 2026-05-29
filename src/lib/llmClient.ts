/**
 * Unified LLM client factory — Google Gemini via @google/generative-ai.
 *
 * Uses GOOGLE_API_KEY from env. Call createLLMClient() to get a model
 * instance, then generateContent() for text or structured output.
 * Free tier: 1,500 requests/day on Gemini Flash — more than ample for
 * article generation traffic.
 */
import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";
import { getEnv } from "@/lib/envFallback";

export function createLLMClient(): GoogleGenerativeAI {
  const key = getEnv("GOOGLE_API_KEY");
  if (!key) throw new Error("GOOGLE_API_KEY env var is required.");
  return new GoogleGenerativeAI(key);
}

export function resolveModel(modelId: string): string {
  return modelId;
}
