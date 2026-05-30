import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let email = "";
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    email = String(body.email ?? "").trim().toLowerCase();
  } else {
    const fd = await req.formData().catch(() => null);
    email = String(fd?.get("email") ?? "").trim().toLowerCase();
  }
  if (!email || !email.includes("@")) {
    return NextResponse.redirect(new URL("/start?error=invalid-email", req.url), 303);
  }

  // Store lead � best-effort, never block the user
  try {
    const { prisma } = await import("@/lib/db");
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await prisma.user.create({
        data: { email, name: email.split("@")[0], articleCredits: 0 },
      });
      console.log(`[lead] captured: ${email}`);
    }
  } catch (e) {
    console.warn("[lead] store failed:", e instanceof Error ? e.message : e);
  }

  // Redirect back with success message
  const url = new URL("/start", req.url);
  url.searchParams.set("captured", "1");
  return NextResponse.redirect(url, 303);
}