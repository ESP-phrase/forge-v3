/**
 * Social post generation and distribution to X and Reddit.
 *
 * NOTE: X and Reddit posting are disabled stubs in v1. Wire up
 * `twitter-api-v2` and `snoowrap` when the integrations go live.
 * The LLM post generator is preserved below for when that happens.
 */
import { createLLMClient, resolveModel } from "@/lib/llmClient";

const MODEL = "deepseek/deepseek-chat";

export type ArticleRecord = {
  id: number;
  title: string;
  wpUrl: string;
  metaDescription: string;
};

export type Posts = {
  tweet: string;
  linkedin: string;
  reddit_title: string;
  reddit_body: string;
};

function envSet(...keys: string[]): boolean {
  return keys.every((k) => !!process.env[k]);
}

// Kept for when integrations go live — generates posts via Claude.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _generatePosts(article: ArticleRecord): Promise<Posts> {
  const client = createLLMClient();
  const prompt = `Article title: ${article.title}
Article URL: ${article.wpUrl}
Meta description: ${article.metaDescription}

Write social posts that drive clicks WITHOUT looking like spam. Return JSON only:
{
  "tweet": "<= 270 chars, no hashtags, ends with the URL on its own line",
  "linkedin": "3-5 short lines, conversational, ends with the URL",
  "reddit_title": "<= 90 chars, question or specific claim, no clickbait",
  "reddit_body": "2-3 sentences of genuine context, then the URL on a new line"
}`;
  const resp = await client.chat.completions.create({
    model: resolveModel(MODEL),
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });
  const content = resp.choices[0]?.message?.content ?? "";
  const stripped = content.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  return JSON.parse(stripped) as Posts;
}

async function _postToX(_text: string): Promise<string | null> {
  if (!envSet("X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_SECRET")) return null;
  return null;
}

async function _postToReddit(
  _subreddit: string,
  _title: string,
  _body: string,
): Promise<string | null> {
  if (!envSet("REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET", "REDDIT_USERNAME", "REDDIT_PASSWORD")) {
    return null;
  }
  return null;
}

export async function distribute(
  _article: ArticleRecord,
  _subreddits: string[] = [],
): Promise<{ generated: null; posted: Record<string, string>; errors: Record<string, string> }> {
  // Social posting stubs — X and Reddit integrations are disabled in v1.
  // Wire up twitter-api-v2 and snoowrap when needed. Until then, skip the
  // LLM call to avoid wasting API cost on posts that are never published.
  return { generated: null, posted: {}, errors: {} };
}
