import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { LinkButton } from "@/components/Button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SEO articles, written and published — start for $1",
  description: "Auto-publish SEO-optimized articles to your site every month. 3-day trial for $1, cancel anytime.",
  alternates: { canonical: "/start" },
  robots: { index: false, follow: true },
};

export default function StartPage() {
  const cta = "/pricing?utm_content=start_page";
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <MarketingHeader />

      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 md:px-10 py-6 md:py-10 flex flex-col">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-accent-dim text-accent border border-accent-border rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-wider font-bold mb-4">
            $1 starts your 3-day trial
          </div>
          <h1 className="text-[2.25rem] sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
            SEO articles, written +
            <br className="hidden sm:inline" />{" "}
            <span className="text-accent">published while you sleep.</span>
          </h1>
          <p className="text-muted text-base md:text-lg mt-4 max-w-xl mx-auto">
            Queue a keyword. We write and publish a 1,500-word article to your site — in under 10 minutes.
          </p>

          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-5 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Trusted by 500+ operators
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Thousands of articles published
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <LinkButton href={cta} size="lg">Start your 3-day trial for $1 →</LinkButton>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-3 text-[0.75rem] text-muted">
            <span className="inline-flex items-center gap-1.5"><Check /> 3-day trial</span>
            <span className="inline-flex items-center gap-1.5"><Check /> Cancel anytime</span>
            <span className="inline-flex items-center gap-1.5"><Check /> First article in 10 min</span>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-8 md:mt-10">
          <div className="grid grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
            {[
              { v: "75", l: "Articles / mo included" },
              { v: "10 min", l: "First article live" },
              { v: "<$0.50", l: "Per article cost" },
            ].map((m) => (
              <div key={m.l} className="bg-bg-2 p-4 md:p-6 text-center">
                <div className="text-xl md:text-2xl font-extrabold text-accent tracking-tight">
                  {m.v}
                </div>
                <div className="text-muted text-[0.6rem] md:text-[0.65rem] mt-0.5 uppercase tracking-wider font-semibold">
                  {m.l}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3-step workflow — larger, icon-driven */}
        <section className="mt-8 md:mt-10">
          <h2 className="text-lg font-extrabold text-center mb-4">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                n: "1",
                t: "Connect your site",
                b: "Site URL + secure credentials. 60 seconds.",
                icon: GlobeIcon,
              },
              {
                n: "2",
                t: "Queue keywords",
                b: "We research low-competition terms and queue them for you.",
                icon: SearchIcon,
              },
              {
                n: "3",
                t: "Publish automatically",
                b: "Articles go live daily. You sleep, they rank.",
                icon: RocketIcon,
              },
            ].map((s) => (
              <div
                key={s.n}
                className="bg-card-grad border border-border rounded-2xl p-6 flex flex-col items-center text-center hover:border-accent-border transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent-dim text-accent grid place-items-center mb-4 group-hover:scale-105 transition-transform">
                  <s.icon />
                </div>
                <div className="font-bold text-white text-sm mb-1.5">{s.t}</div>
                <div className="text-muted text-xs leading-snug">{s.b}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mt-10 md:mt-12 text-center max-w-md mx-auto w-full">
          <a
            href={cta}
            className="block bg-accent text-black px-6 py-4 rounded-xl font-extrabold text-base no-underline hover:brightness-110 transition-all shadow-glow"
          >
            Start your 3-day trial for $1 →
          </a>
          <p className="text-muted-2 text-xs mt-3">Cancel anytime · 7-day money-back guarantee</p>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

function Check() {
  return (
    <span className="inline-grid place-items-center w-3.5 h-3.5 rounded-full bg-accent-dim" aria-hidden>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#bef848" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 5 5 9-11" />
      </svg>
    </span>
  );
}

function GlobeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function RocketIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4l.5-.5 5 3.5-.5.5" />
    </svg>
  );
}
