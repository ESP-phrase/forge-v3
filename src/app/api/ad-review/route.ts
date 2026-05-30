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

const SYSTEM = `You are an ad creative analyst. Review the image and return a JSON object. Evaluate it as a Google Ads image creative for a SaaS product called SEOForge — an AI SEO content automation tool ($1 trial, $29/mo).

Return this exact JSON structure:
{
  "scores": {
    "hook": number 0-100,       // Does the image grab attention in 1 second?
    "cta_clarity": number 0-100, // Is the call-to-action obvious + compelling?
    "visual_hierarchy": number 0-100, // Is the layout scannable? Text readable?
    "brand_consistency": number 0-100, // Does it feel like a SaaS product?
    "conversion_potential": number 0-100, // How likely to drive a click?
    "overall": number 0-100      // Weighted average
  },
  "strengths": ["string"],       // 2-3 things the ad does well
  "weaknesses": ["string"],      // 2-3 things hurting performance
  "fixes": ["string"],           // 2-4 specific, actionable improvements
  "best_for": "string",          // e.g. "Display Network", "YouTube", "Gmail", "Discovery"
  "verdict": "string"            // 1-sentence overall assessment
}

Be honest and specific. If the ad has no text, mention it. If the CTA is buried, say so. Rate against Google Ads best practices for conversion.`;

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