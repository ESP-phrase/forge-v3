"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createLLMClient, resolveModel } from "@/lib/llmClient";

export type ClusterArticle = {
  title: string;
  keyword: string;
  intent: "informational" | "commercial" | "transactional" | "navigational";
  role: "pillar" | "cluster";
  links_to: number[];
};

export type ClusterPlan = {
  pillar_title: string;
  pillar_keyword: string;
  articles: ClusterArticle[];
};

export async function generateClusterAction(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
  plan?: ClusterPlan;
}> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "not signed in" };

  const siteId = Number(formData.get("siteId"));
  const pillarTopic = String(formData.get("pillarTopic") ?? "").trim();
  if (!siteId || !pillarTopic) return { ok: false, error: "missing siteId or pillarTopic" };

  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) return { ok: false, error: "site not found" };

  const client = createLLMClient();

  const SYSTEM = `You are an SEO content strategist who designs topic clusters that rank.

A topic cluster is:
  1 "pillar" article — broad, comprehensive, targets the high-volume head term
  10-12 "cluster" articles — narrow, specific long-tail queries that all link UP to the pillar
  Cluster articles cross-link to 2-3 sibling clusters where relevant

Rules:
- Pillar keyword: the broad topic itself.
- Cluster keywords: 3-7 words each, long-tail, low-competition. Mix of intents.
- "how to" / "what is" / "best X for Y" / "X vs Y" / "X cost" / "X mistakes" / case studies
- Every cluster article links_to the pillar (index 0).
- Each cluster article ALSO links_to 1-3 other cluster articles by topical relevance.
- No duplicate or near-duplicate keywords across articles.
- Mix intents: 60% informational, 25% commercial, 15% transactional.

Call the cluster_plan function with the result.`;

  const TOOL = {
    type: "function" as const,
    function: {
      name: "cluster_plan",
      description: "Return the full cluster plan.",
      parameters: {
        type: "object" as const,
        properties: {
          pillar_title: { type: "string", description: "Title of the pillar article" },
          pillar_keyword: { type: "string", description: "Target keyword of the pillar" },
          articles: {
            type: "array",
            minItems: 11,
            maxItems: 13,
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                keyword: { type: "string" },
                intent: { type: "string", enum: ["informational", "commercial", "transactional", "navigational"] },
                role: { type: "string", enum: ["pillar", "cluster"] },
                links_to: { type: "array", items: { type: "integer" }, description: "Indexes of other articles to link to" },
              },
              required: ["title", "keyword", "intent", "role", "links_to"],
            },
          },
        },
        required: ["pillar_title", "pillar_keyword", "articles"],
      },
    },
  };

  const userMsg = `Design a topic cluster for:

PILLAR TOPIC: ${pillarTopic}

SITE CONTEXT:
Name: ${site.name}
Niche: ${site.niche || "(not specified)"}
Audience: ${site.audience || "(not specified)"}

Return 1 pillar + 10-12 cluster articles. Call the cluster_plan function.`;

  const tag = `[cluster:${site.slug}]`;
  const t0 = Date.now();
  console.log(`${tag} ▶ planning cluster · pillar="${pillarTopic}"`);

  try {
    const resp = await client.chat.completions.create({
      model: resolveModel("deepseek/deepseek-chat"),
      max_tokens: 3500,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userMsg },
      ],
      tools: [TOOL],
      tool_choice: { type: "function", function: { name: "cluster_plan" } },
    });

    const msg = resp.choices[0]?.message;
    const tc = msg?.tool_calls?.[0];
    if (!tc?.function?.arguments) {
      console.warn(`${tag} ⚠ No tool call returned`);
      return { ok: false, error: "AI returned no plan" };
    }
    const plan = JSON.parse(tc.function.arguments) as ClusterPlan;
    const dur = ((Date.now() - t0) / 1000).toFixed(1);
    const u = resp.usage;
    const cost = ((u?.prompt_tokens ?? 0) / 1_000_000) * 0.35 + ((u?.completion_tokens ?? 0) / 1_000_000) * 0.50;
    console.log(`${tag} ✓ plan ready · ${plan.articles.length} articles · ${dur}s · ~$${cost.toFixed(3)}`);
    return { ok: true, plan };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "call failed";
    console.error(`${tag} ✗ ${msg}`);
    return { ok: false, error: msg };
  }
}

export async function saveClusterAction(formData: FormData): Promise<{ ok: boolean; error?: string; added?: number; skipped?: number }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "not signed in" };

  const siteId = Number(formData.get("siteId"));
  const planJson = String(formData.get("plan") ?? "");
  if (!siteId || !planJson) return { ok: false, error: "missing siteId or plan" };

  let plan: ClusterPlan;
  try { plan = JSON.parse(planJson) as ClusterPlan; } catch { return { ok: false, error: "invalid plan json" }; }

  let added = 0, skipped = 0;
  for (const a of plan.articles) {
    try {
      await prisma.keyword.create({ data: { siteId, keyword: a.keyword, intent: a.intent, status: "queued" } });
      added += 1;
    } catch { skipped += 1; /* unique constraint */ }
  }
  revalidatePath(`/sites/${siteId}`);
  return { ok: true, added, skipped };
}
