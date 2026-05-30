/**
 * Ad creative review — send an image URL, get a structured quality report
 * from Gemini Flash via OpenRouter. Vision-capable, zero extra cost.
 *
 * POST body: { imageUrl: "https://..." }  or  { imageBase64: "..." }
 */
import { NextRequest, NextResponse } from "next/server";
import { createLLMClient } from "@/lib/llmClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "google/gemini-2.5-flash";

const SYSTEM = `You are an ad creative analyst. Review the image and return a JSON object. Evaluate it as a Google Ads image creative for a SaaS called SEOForge — an SEO content automation tool ($1 trial, $29/mo).

Return this exact JSON structure:
{
  "scores": {
    "hook": number 0-100,
    "cta_clarity": number 0-100,
    "visual_hierarchy": number 0-100,
    "brand_consistency": number 0-100,
    "conversion_potential": number 0-100,
    "overall": number 0-100
  },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "fixes": ["string"],
  "best_for": "string",
  "verdict": "string"
}

Be honest and specific. Rate against Google Ads best practices for conversion.`;

export async function POST(req: NextRequest) {
  let body: { imageUrl?: string; imageBase64?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid json" }, { status: 400 }); }

  const imageUrl = body.imageUrl?.trim();
  const imageBase64 = body.imageBase64?.trim();

  if (!imageUrl && !imageBase64) {
    return NextResponse.json({ error: "imageUrl or imageBase64 required" }, { status: 400 });
  }

  const imageContent = imageUrl
    ? { type: "image_url" as const, image_url: { url: imageUrl } }
    : { type: "image_url" as const, image_url: { url: `data:image/png;base64,${imageBase64}` } };

  try {
    const client = createLLMClient();
    const resp = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 1000,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: "Review this ad creative image." },
            imageContent as any,
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const text = resp.choices[0]?.message?.content ?? "";
    let review: any;
    try { review = JSON.parse(text); } catch { review = { error: "unparseable", raw: text.slice(0, 200) }; }

    return NextResponse.json({ ...review, model: MODEL, tokens: resp.usage?.total_tokens ?? 0 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "review failed" }, { status: 500 });
  }
}
