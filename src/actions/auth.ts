"use server";

import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";

async function createSessionCookie(userId: string): Promise<void> {
  const { prisma } = await import("@/lib/db");
  const crypto = await import("node:crypto");
  const { cookies } = await import("next/headers");

  const sessionToken = `${crypto.randomUUID()}${crypto.randomBytes(8).toString("hex")}`;
  const expires = new Date(Date.now() + 14 * 24 * 3600 * 1000);
  await prisma.session.create({ data: { sessionToken, userId, expires } });

  const isProd = process.env.NODE_ENV === "production";
  const cookieStore = await cookies();
  cookieStore.set(isProd ? "__Secure-authjs.session-token" : "authjs.session-token", sessionToken, {
    httpOnly: true, sameSite: "lax", secure: isProd, expires, path: "/",
  });
}

async function runSignupSideEffects(user: { id: string; email: string; name?: string | null }) {
  const { prisma } = await import("@/lib/db");
  try {
    const { cookies } = await import("next/headers");
    const c = await cookies();
    const refCode = c.get("sf_ref")?.value;
    if (refCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: refCode } });
      if (referrer && referrer.id !== user.id) {
        await prisma.user.update({ where: { id: user.id }, data: { referredBy: refCode } });
        await prisma.referral.create({ data: { referrerId: referrer.id, referredId: user.id } });
      }
    }
  } catch { /* noop */ }
  try { const { sendWelcomeEmail } = await import("@/lib/email"); void sendWelcomeEmail(user.email, user.name); } catch { /* noop */ }
  try { const { sendRedditEvent } = await import("@/lib/redditCapi"); await sendRedditEvent({ eventName: "SignUp", email: user.email, userId: user.id }); await sendRedditEvent({ eventName: "Lead", email: user.email, userId: user.id }); } catch { /* noop */ }
  try { const { sendTikTokEvent } = await import("@/lib/tiktokCapi"); await sendTikTokEvent({ eventName: "CompleteRegistration", email: user.email, userId: user.id, eventId: `signup_${user.id}` }); } catch { /* noop */ }
}

function parseCredentials(formData: FormData): { email: string; password: string } | null {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !email.includes("@") || password.length < 8) return null;
  return { email, password };
}

function safeNext(formData: FormData): string {
  const raw = String(formData.get("next") ?? "").trim();
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

function maskEmail(e?: string | null): string {
  if (!e) return "(none)";
  const [u, d] = e.split("@");
  if (!d) return e;
  return `${u.slice(0, 2)}***@${d}`;
}

export async function signUpAction(formData: FormData): Promise<void> {
  const t0 = Date.now();
  const reqId = Math.random().toString(36).slice(2, 8);
  const next = safeNext(formData);
  const creds = parseCredentials(formData);
  console.log(`[signup ${reqId}] start email=${maskEmail(creds?.email)} next=${next}`);
  if (!creds) {
    redirect(`/login?mode=signup&error=${encodeURIComponent("Enter a valid email and a password of at least 8 characters.")}`);
  }
  const { prisma } = await import("@/lib/db");
  const bcrypt = (await import("bcryptjs")).default;

  const existing = await prisma.user.findUnique({ where: { email: creds!.email } });
  if (existing) {
    redirect(`/login?error=${encodeURIComponent("An account with that email already exists. Sign in instead.")}`);
  }

  const passwordHash = await bcrypt.hash(creds!.password, 12);
  const name = String(formData.get("name") ?? "").trim() || null;
  const user = await prisma.user.create({ data: { email: creds!.email, name, passwordHash } });

  await runSignupSideEffects(user);
  await createSessionCookie(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
  console.log(`[signup ${reqId}] created user=${user.id} in ${Date.now() - t0}ms → redirect ${next}`);
  redirect(next);
}

export async function signInWithPasswordAction(formData: FormData): Promise<void> {
  const t0 = Date.now();
  const reqId = Math.random().toString(36).slice(2, 8);
  const next = safeNext(formData);
  const creds = parseCredentials(formData);
  if (!creds) redirect(`/login?error=${encodeURIComponent("Enter your email and password.")}`);
  const { prisma } = await import("@/lib/db");
  const bcrypt = (await import("bcryptjs")).default;

  const user = await prisma.user.findUnique({ where: { email: creds!.email } });
  if (!user || !user.passwordHash) {
    redirect(`/login?error=${encodeURIComponent("Invalid email or password.")}`);
  }
  const ok = await bcrypt.compare(creds!.password, user.passwordHash!);
  if (!ok) redirect(`/login?error=${encodeURIComponent("Invalid email or password.")}`);

  await createSessionCookie(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
  console.log(`[signin ${reqId}] success user=${user.id} in ${Date.now() - t0}ms`);
  redirect(next);
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirect: false });
  redirect("/login");
}

export async function signInWithGoogleAction(): Promise<void> {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function signInWithXAction(): Promise<void> {
  await signIn("twitter", { redirectTo: "/dashboard" });
}

export async function signInWithGitHubAction(): Promise<void> {
  await signIn("github", { redirectTo: "/dashboard" });
}

// ── Magic link login ────────────────────────────────────────────────────

export async function sendMagicLinkAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = safeNext(formData);

  if (!email || !email.includes("@")) {
    redirect(`/login?error=${encodeURIComponent("Enter a valid email.")}`);
  }

  const { prisma } = await import("@/lib/db");
  const crypto = await import("node:crypto");

  // Create a verification token valid for 15 minutes
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  // Clean up any existing tokens for this email
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({ data: { identifier: email, token, expires } });

  // Send the magic link email
  const { sendMagicLinkEmail } = await import("@/lib/email");
  void sendMagicLinkEmail(email, token, next);

  redirect(`/login?magic=1&email=${encodeURIComponent(email)}`);
}

export async function verifyMagicLinkAction(token: string): Promise<void> {
  const { prisma } = await import("@/lib/db");

  // Find and validate the token
  const vt = await prisma.verificationToken.findUnique({ where: { token } });
  if (!vt || vt.expires < new Date()) {
    redirect("/login?error=" + encodeURIComponent("This link has expired. Request a new one."));
  }

  const email = vt.identifier;

  // Delete the used token
  await prisma.verificationToken.delete({ where: { token } });

  // Find existing user or create one
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email, name: email.split("@")[0] } });
    await runSignupSideEffects(user);
  }

  await createSessionCookie(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
  redirect("/dashboard");
}

// ── Admin quick login ───────────────────────────────────────────────────

export async function adminQuickLoginAction(): Promise<void> {
  if (process.env.ADMIN_QUICK_LOGIN !== "1") {
    redirect("/login?error=" + encodeURIComponent("Admin quick login is disabled."));
  }
  const { prisma } = await import("@/lib/db");
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!user) redirect("/login?error=" + encodeURIComponent("No admin user exists yet."));
  await createSessionCookie(user.id);
  redirect("/dashboard");
}
