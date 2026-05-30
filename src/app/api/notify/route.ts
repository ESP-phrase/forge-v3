/**
 * Chat escalation notification — sends an email to the founder when a
 * visitor provides their email for human follow-up.
 */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { email?: string; transcript?: string; page?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "email required" }, { status: 400 });
  }

  // Log the escalation
  console.log(`[escalation] ${email} requested human contact`);

  // Send notification to founder
  try {
    const { sendEscalationEmail } = await import("@/lib/email");
    void sendEscalationEmail(email, body.transcript, body.page);
  } catch { /* noop */ }

  return NextResponse.json({ ok: true });
}