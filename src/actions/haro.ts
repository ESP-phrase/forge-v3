"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createLLMClient, resolveModel } from "@/lib/llmClient";

export async function draftHaroResponseAction(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
  draft?: { subject: string; body: string; rationale: string };
}> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "not signed in" };

  const siteId = Number(formData.get("siteId"));
  const queryText = String(formData.get("queryText") ?? "").trim();
  if (!siteId || !queryText) return { ok: false, error: "missing siteId or queryText" };

  const site = await prisma.site.findUnique({ where: { id: siteId } });
  if (!site) return { ok: false, error: "site not found" };

  const client = createLLMClient();
  const SYSTEM = `You draft responses to journalist source requests (HARO, Connectively, Featured.com, etc).
Your goal: get the user quoted. Reporters reject responses that are generic, over-promotional, or longer than 200 words.

Rules:
- Write in first person from the expert's voice provided.
- Lead with the single most quotable sentence — something a reporter would put in headline quotes.
- 80-200 words total. Concise wins.
- Include 1 specific, vivid example or stat. No fluff.
- End with a one-line bio + the site URL.
- Never beg, never say "happy to chat", never offer "more info if needed."

Call the haro_draft function with the result.`;

  const TOOL = {
    type: "function" as const,
    function: {
      name: "haro_draft",
      description: "Return the drafted email subject, body, and a 1-sentence rationale.",
      parameters: {
        type: "object" as const,
        properties: {
          subject: { type: "string", description: "Email subject line." },
          body: { type: "string", description: "80-200 word response body. Plain text." },
          rationale: { type: "string", description: "One sentence: why this angle works." },
        },
        required: ["subject", "body", "rationale"],
      },
    },
  };

  const userMsg = `JOURNALIST'S QUERY:
${queryText}

---
EXPERT VOICE (write as this person):
${site.expertVoice || "An experienced operator in this niche."}

SITE:
Name: ${site.name}
Niche: ${site.niche || "(not specified)"}
Audience: ${site.audience || "(not specified)"}
URL: ${site.wpUrl || site.customDomain || "(none)"}

Call haro_draft now.`;

  try {
    const resp = await client.chat.completions.create({
      model: resolveModel("deepseek/deepseek-chat"),
      max_tokens: 1200,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userMsg },
      ],
      tools: [TOOL],
      tool_choice: { type: "function", function: { name: "haro_draft" } },
    });

    const msg = resp.choices[0]?.message;
    const tc = msg?.tool_calls?.[0];
    if (!tc?.function?.arguments) return { ok: false, error: "AI returned no draft" };
    const draft = JSON.parse(tc.function.arguments) as { subject: string; body: string; rationale: string };
    return { ok: true, draft };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "call failed" };
  }
}
