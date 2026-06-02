import Link from "next/link";
import { sendMagicLinkAction } from "@/actions/auth";
import { SubmitButton } from "./SubmitButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; magic?: string; email?: string }>;
}) {
  const sp = await searchParams;
  const error = sp.error;
  const justSent = sp.magic === "1";
  const magicEmail = sp.email;

  return (
    <>
      <div className="text-center mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo2.png" alt="SEOForge" width={48} height={48} className="mx-auto mb-6 rounded-xl" />
        <h1 className="text-3xl font-extrabold tracking-tight">
          Sign in to <span className="text-accent">SEOForge</span>
        </h1>
        <p className="text-muted text-sm mt-2 max-w-xs mx-auto">
          Enter your email and we'll send you a sign-in link. No password needed.
        </p>
      </div>

      {error ? (
        <div className="bg-[rgba(248,113,113,0.12)] text-danger border border-[rgba(248,113,113,0.3)] rounded-lg px-3.5 py-2.5 mb-5 text-sm text-center">
          {error}
        </div>
      ) : null}

      {justSent ? (
        <div className="bg-accent-dim text-accent border border-accent-border rounded-lg px-4 py-4 mb-5 text-sm text-center">
          <div className="font-bold mb-1">Check your inbox</div>
          <div>We sent a sign-in link to <strong>{magicEmail || "your email"}</strong>.<br />Click it and you're in.</div>
        </div>
      ) : (
        <div className="relative">
          <div aria-hidden className="absolute -inset-px rounded-2xl pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(190,248,72,0.55) 0%, rgba(190,248,72,0.08) 30%, transparent 60%, rgba(190,248,72,0.08) 80%, rgba(190,248,72,0.5) 100%)", WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude", padding: 1 }} />
          <div className="relative bg-card-grad rounded-2xl p-6 shadow-panel">
            <form action={sendMagicLinkAction}>
              <div className="relative mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 bg-bg border border-border rounded-xl text-sm text-text focus:outline-none focus:border-accent-border placeholder:text-muted-2" />
              </div>
              <SubmitButton idleLabel="Send sign-in link" busyLabel="Sending…" />
            </form>
            <p className="text-center text-muted-2 text-xs mt-4">
              We'll email you a secure link. Click it once and you're signed in.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-5 text-muted text-xs mt-10">
        <Link href="/privacy" className="hover:text-text no-underline">Privacy</Link>
        <span className="text-muted-2">•</span>
        <Link href="/terms" className="hover:text-text no-underline">Terms</Link>
        <span className="text-muted-2">•</span>
        <a href="mailto:hello@seoforge.org" className="hover:text-text no-underline">Contact</a>
      </div>
    </>
  );
}
