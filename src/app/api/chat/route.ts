/**
 * Chat endpoint for the floating widget. Streams responses from DeepSeek via
 * OpenRouter using server-sent events.
 *
 * Model: deepseek/deepseek-chat — fast, cheap (~$0.01/conversation).
 *
 * No auth — chat is open to every visitor on the marketing site.
 */
import { NextRequest } from "next/server";
import { createLLMClient, resolveModel } from "@/lib/llmClient";
import { CHAT_SYSTEM_PROMPT } from "@/lib/chatSystemPrompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = "deepseek/deepseek-chat";
const MAX_TURNS = 20;
const MAX_TOKENS = 400;

type Message = { role: "system" | "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  let body: { messages?: { role: string; content: string }[] };
  try { body = await req.json(); } catch { return new Response("invalid json", { status: 400 }); }

  const rawMessages = (body.messages ?? [])
    .filter((m): m is { role: string; content: string } => m && typeof m.content === "string");

  if (rawMessages.length === 0) return new Response("messages required", { status: 400 });
  if (rawMessages.filter((m) => m.role === "user").length > MAX_TURNS) {
    return new Response("conversation limit reached", { status: 429 });
  }

  const messages: Message[] = [
    { role: "system", content: CHAT_SYSTEM_PROMPT },
    ...rawMessages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  const client = createLLMClient();
  const stream = await client.chat.completions.create({
    model: resolveModel(MODEL),
    max_tokens: MAX_TOKENS,
    messages,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: delta })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "stream error";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
