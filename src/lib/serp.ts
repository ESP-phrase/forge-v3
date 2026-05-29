/**
 * SerpApi integration — fetches the top organic results for a keyword and
 * caches the response in the database to avoid burning through the free
 * tier. The article generator uses this output as a "competitive landscape"
 * input so Claude can write something demonstrably better than what already
 * ranks.
 */
import { prisma } from "@/lib/db";

const ENDPOINT = "https://serpapi.com/search.json";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type SerpResult = {
  position: number;
  title: string;
  link: string;
  domain: string;
  snippet: string;
};

export type SerpAnalysis = {
  keyword: string;
  topResults: SerpResult[];
  peopleAlsoAsk: string[];
  relatedSearches: string[];
  cached: boolean;
  fetchedAt: Date;
};

function domainOf(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

type RawSerp = {
  organic_results?: Array<{
    position?: number;
    title?: string;
    link?: string;
    snippet?: string;
  }>;
  related_questions?: Array<{ question?: string }>;
  related_searches?: Array<{ query?: string }>;
};

function shape(raw: RawSerp, keyword: string, fetchedAt: Date, cached: boolean): SerpAnalysis {
  const organic = raw.organic_results ?? [];
  const topResults: SerpResult[] = organic.slice(0, 10).map((r, i) => ({
    position: r.position ?? i + 1,
    title: r.title ?? "",
    link: r.link ?? "",
    domain: domainOf(r.link ?? ""),
    snippet: r.snippet ?? "",
  }));
  return {
    keyword,
    topResults,
    peopleAlsoAsk: (raw.related_questions ?? [])
      .map((q) => q.question ?? "")
      .filter(Boolean),
    relatedSearches: (raw.related_searches ?? [])
      .map((s) => s.query ?? "")
      .filter(Boolean),
    cached,
    fetchedAt,
  };
}

export async function fetchSerp(keyword: string): Promise<SerpAnalysis | null> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) return null;

  const normalised = keyword.trim().toLowerCase();
  const cached = await prisma.serpCache.findUnique({
    where: { keyword: normalised },
  });
  if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS) {
    try {
      const raw = JSON.parse(cached.json) as RawSerp;
      return shape(raw, normalised, cached.fetchedAt, true);
    } catch {
      // fall through to refetch
    }
  }

  const params = new URLSearchParams({
    engine: "google",
    q: normalised,
    api_key: apiKey,
    num: "10",
    hl: "en",
    gl: "us",
  });
  const resp = await fetch(`${ENDPOINT}?${params}`, { cache: "no-store" });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`SerpApi failed (${resp.status}): ${text.slice(0, 200)}`);
  }
  const raw = (await resp.json()) as RawSerp;
  const fetchedAt = new Date();
  await prisma.serpCache.upsert({
    where: { keyword: normalised },
    create: { keyword: normalised, json: JSON.stringify(raw), fetchedAt },
    update: { json: JSON.stringify(raw), fetchedAt },
  });

  return shape(raw, normalised, fetchedAt, false);
}

function analyseSnippetFormats(results: SerpResult[]): string {
  const patterns: string[] = [];
  const hasListicle = results.some((r) => /^\d+\s/.test(r.title) || /\d+ (best|top|ways|tips|steps|reasons|ideas|examples)/i.test(r.title));
  const hasGuide = results.some((r) => /how\s+to|guide|tutorial|ultimate|complete/i.test(r.title));
  const hasComparison = results.some((r) => /vs\.?|versus|difference between|or\b.*\bwhich/i.test(r.title));
  const hasDefinition = results.some((r) => /what\s+is|definition|meaning/i.test(r.title));

  if (hasListicle) patterns.push("listicle");
  if (hasGuide) patterns.push("step-by-step guide");
  if (hasComparison) patterns.push("comparison");
  if (hasDefinition) patterns.push("definition + explanation");

  if (patterns.length === 0) return "";
  return `\n**Dominant content formats in SERP:** ${patterns.join(", ")}. Match or exceed the best format, but add a section in a format nobody else uses.`;
}

function detectContentGaps(results: SerpResult[]): string {
  const allSnippets = results.map((r) => r.snippet.toLowerCase() + " " + r.title.toLowerCase()).join(" ");

  const missingAngles: string[] = [];

  if (!/example|case study|real.world/i.test(allSnippets)) {
    missingAngles.push("real-world examples or mini case studies");
  }
  if (!/checklist|template|worksheet|spreadsheet/i.test(allSnippets)) {
    missingAngles.push("a practical checklist or framework");
  }
  if (!/common.mistake|pitfall|watch.out|avoid|don'?t/i.test(allSnippets)) {
    missingAngles.push("common mistakes to avoid");
  }
  if (!/cost|price|budget|pricing/i.test(allSnippets)) {
    missingAngles.push("cost/pricing transparency or budget guidance");
  }
  if (!/timeline|how.long|time.frame|days|weeks|months/i.test(allSnippets)) {
    missingAngles.push("expected timeline or time commitment");
  }
  if (!/tool|software|app|platform/i.test(allSnippets)) {
    missingAngles.push("specific tool or software recommendations");
  }

  if (missingAngles.length === 0) return "\n**Content gap:** Top results are comprehensive. Differentiate with a stronger opinionated take and deeper examples than anyone else.";
  return `\n**Content gaps found (none of the top ${results.length} cover these):** ${missingAngles.join(", ")}. Include ALL of these angles — they are your competitive advantage.`;
}

/**
 * Render the SERP analysis as a competitive intelligence briefing for Claude.
 * Returns null if no SerpApi key was configured (generation degrades gracefully).
 */
export function serpToPromptContext(analysis: SerpAnalysis | null): string | null {
  if (!analysis) return null;
  const top = analysis.topResults.slice(0, 5);
  if (top.length === 0) return null;

  const lines: string[] = [];

  lines.push("## Competitive SERP intelligence");
  lines.push("");
  lines.push("Here is what currently ranks for this keyword. Your job: write something that deserves to outrank every one of them.");
  lines.push("");

  for (const r of top) {
    lines.push(
      `- **#${r.position}** — ${r.domain} — "${r.title}"\n  Snippet: ${r.snippet.replace(/\s+/g, " ").slice(0, 250)}`,
    );
  }

  const formatAnalysis = analyseSnippetFormats(top);
  if (formatAnalysis) lines.push(formatAnalysis);

  const gaps = detectContentGaps(top);
  lines.push(gaps);

  if (analysis.peopleAlsoAsk.length > 0) {
    lines.push("\n## People also ask (Google's own suggestions)");
    lines.push("Address every one of these in the FAQ section — they are real search volume:");
    for (const q of analysis.peopleAlsoAsk.slice(0, 8)) {
      lines.push(`- ${q}`);
    }
  }

  if (analysis.relatedSearches.length > 0) {
    lines.push("\n## Related searches (semantic neighbours)");
    lines.push("Weave these concepts naturally into the article body where relevant:");
    lines.push(analysis.relatedSearches.slice(0, 8).join(" · "));
  }

  lines.push("");
  lines.push("## Strategy");
  lines.push("1. Match the dominant content format (listicle, guide, etc.) so you're in the consideration set.");
  lines.push("2. Then GO DEEPER than anyone — add the missing angles identified above as dedicated H2 sections.");
  lines.push("3. Add at least ONE unique framework, mental model, or decision tree that nobody else has.");
  lines.push("4. Make the FAQ answers 2-4 sentences with concrete specifics, not generic wisdom.");
  lines.push("5. Do NOT copy or paraphrase any snippet from above. Write original content that is BETTER.");
  return lines.join("\n");
}
