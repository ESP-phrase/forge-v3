/**
 * Backlink outreach engine.
 *
 * Workflow:
 *   1. findProspects(seed, site) → SerpApi search for resource-page intents
 *   2. draftOutreachEmail(prospect, article, site) → AI drafts cold-outreach email
 *
 * No emails sent automatically — dashboard review + copy-paste from your mailbox.
 */
import { createLLMClient, resolveModel } from "@/lib/llmClient";

const ENDPOINT = "https://serpapi.com/search.json";

const RESOURCE_INTENT_QUERIES = (seed: string): string[] => [
  `best ${seed} resources`,
  `${seed} guide list`,
  `top ${seed} blogs 2026`,
  `${seed} tools and tips`,
  `useful ${seed} resources`,
];

const MODEL_SCORE = "deepseek/deepseek-chat";
const MODEL_EMAIL = "deepseek/deepseek-chat";

const SCORE_PRICE_INPUT_PER_M = 0.35;
const SCORE_PRICE_OUTPUT_PER_M = 0.50;
const EMAIL_PRICE_INPUT_PER_M = 0.35;
const EMAIL_PRICE_OUTPUT_PER_M = 0.50;

export type ProspectCandidate = {
  url: string;
  domain: string;
  pageTitle: string;
  snippet: string;
  searchSeed: string;
  relevanceScore: number;
  scoreReason: string;
};

type SerpRaw = {
  organic_results?: Array<{ position?: number; title?: string; link?: string; snippet?: string }>;
};

function domainOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

async function fetchSerpFor(query: string): Promise<SerpRaw> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error("SERPAPI_KEY missing");
  const params = new URLSearchParams({ engine: "google", q: query, api_key: apiKey, num: "10", hl: "en", gl: "us" });
  const resp = await fetch(`${ENDPOINT}?${params}`, { cache: "no-store" });
  if (!resp.ok) throw new Error(`SerpApi failed (${resp.status})`);
  return (await resp.json()) as SerpRaw;
}

export async function findProspects(seed: string): Promise<{
  raw: Array<{ url: string; domain: string; pageTitle: string; snippet: string; searchSeed: string }>;
  searchCount: number;
}> {
  const queries = RESOURCE_INTENT_QUERIES(seed);
  const seen = new Set<string>();
  const out: Array<{ url: string; domain: string; pageTitle: string; snippet: string; searchSeed: string }> = [];

  for (const q of queries) {
    let raw: SerpRaw;
    try { raw = await fetchSerpFor(q); } catch { continue; }
    for (const r of raw.organic_results ?? []) {
      const url = r.link ?? "";
      if (!url) continue;
      const d = domainOf(url);
      if (!d || seen.has(url)) continue;
      seen.add(url);
      out.push({ url, domain: d, pageTitle: r.title ?? "", snippet: r.snippet ?? "", searchSeed: q });
    }
  }
  return { raw: out, searchCount: queries.length };
}

export async function scoreProspects(
  raw: Array<{ url: string; domain: string; pageTitle: string; snippet: string; searchSeed: string }>,
  site: { niche?: string | null; audience?: string | null },
): Promise<{ candidates: ProspectCandidate[]; costUsd: number }> {
  if (raw.length === 0) return { candidates: [], costUsd: 0 };

  const client = createLLMClient();

  const SCORE_TOOL = {
    type: "function" as const,
    function: {
      name: "rank_prospects",
      description: "Rank each prospect 0-100 for backlink outreach.",
      parameters: {
        type: "object" as const,
        properties: {
          scored: {
            type: "array",
            items: {
              type: "object",
              properties: {
                url: { type: "string" },
                score: { type: "number", description: "0-100 outreach linkability" },
                reason: { type: "string", description: "1 short sentence" },
              },
              required: ["url", "score", "reason"],
            },
          },
        },
        required: ["scored"],
      },
    },
  };

  const prompt = `Score each page 0-100 for backlink outreach linkability.

Niche: ${site.niche || "general"}
Target audience: ${site.audience || "general"}

Score high: curated lists, resource roundups, independent blogs, pages that already list similar articles.
Score low: transactional pages, paywalls, social media, top-100 sites, irrelevant snippets.

Call rank_prospects for:
${raw.map((p, i) => `${i + 1}. ${p.url}\n   title: ${p.pageTitle}\n   snippet: ${p.snippet.slice(0, 200)}`).join("\n\n")}`;

  const resp = await client.chat.completions.create({
    model: resolveModel(MODEL_SCORE),
    max_tokens: 2500,
    messages: [{ role: "user", content: prompt }],
    tools: [SCORE_TOOL],
    tool_choice: { type: "function", function: { name: "rank_prospects" } },
  });

  const msg = resp.choices[0]?.message;
  const tc = msg?.tool_calls?.[0];
  if (!tc?.function?.arguments) {
    return { candidates: raw.map((r) => ({ ...r, relevanceScore: 50, scoreReason: "" })), costUsd: 0 };
  }
  const scored = JSON.parse(tc.function.arguments) as { scored: { url: string; score: number; reason: string }[] };
  const map = new Map(scored.scored.map((s) => [s.url, s]));

  const candidates: ProspectCandidate[] = raw.map((p) => {
    const s = map.get(p.url);
    return { ...p, relevanceScore: s ? Math.max(0, Math.min(100, Math.round(s.score))) : 50, scoreReason: s?.reason ?? "" };
  });

  const u = resp.usage;
  const inTok = u?.prompt_tokens ?? 0, outTok = u?.completion_tokens ?? 0;
  const costUsd = (inTok / 1_000_000) * SCORE_PRICE_INPUT_PER_M + (outTok / 1_000_000) * SCORE_PRICE_OUTPUT_PER_M;

  candidates.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return { candidates, costUsd };
}

export async function draftOutreachEmail({
  prospect, article, site,
}: {
  prospect: { pageTitle: string; url: string; snippet: string; domain: string };
  article: { title: string; url: string; metaDescription: string };
  site: { name: string; niche?: string | null; expertVoice?: string | null };
}): Promise<{ subject: string; body: string; costUsd: number }> {
  const client = createLLMClient();

  const EMAIL_TOOL = {
    type: "function" as const,
    function: {
      name: "write_email",
      description: "Write the outreach email subject and body.",
      parameters: {
        type: "object" as const,
        properties: {
          subject: { type: "string", description: "<= 60 chars, specific" },
          body: { type: "string", description: "Plain-text body. ~100-150 words. Conversational. Opens with a specific reference to their page. Pitches the article in 1 sentence. Ends with a soft ask." },
        },
        required: ["subject", "body"],
      },
    },
  };

  const prompt = `Draft a cold outreach email to the owner of this page:

Their page: ${prospect.url} (${prospect.domain})
Title: ${prospect.pageTitle}
Snippet: ${prospect.snippet}

Our article to pitch:
Title: ${article.title}
URL: ${article.url}
Description: ${article.metaDescription}

Site: ${site.name}
Niche: ${site.niche || "n/a"}
${site.expertVoice ? `Voice: ${site.expertVoice}` : ""}

Rules: No "leverage," "synergy," "circle back." Reference something specific about their page. Pitch in 1 sentence. Ask softly. 100-150 words max. Sign off "Best, [Your Name]".

Call write_email.`;

  const resp = await client.chat.completions.create({
    model: resolveModel(MODEL_EMAIL),
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
    tools: [EMAIL_TOOL],
    tool_choice: { type: "function", function: { name: "write_email" } },
  });

  const msg = resp.choices[0]?.message;
  const tc = msg?.tool_calls?.[0];
  if (!tc?.function?.arguments) throw new Error("AI returned no email draft.");
  const { subject, body } = JSON.parse(tc.function.arguments) as { subject: string; body: string };

  const u = resp.usage;
  const inTok = u?.prompt_tokens ?? 0, outTok = u?.completion_tokens ?? 0;
  const costUsd = (inTok / 1_000_000) * EMAIL_PRICE_INPUT_PER_M + (outTok / 1_000_000) * EMAIL_PRICE_OUTPUT_PER_M;

  return { subject, body, costUsd };
}
