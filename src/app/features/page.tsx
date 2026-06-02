import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Features — SEOForge",
  description: "Run 100 SEO sites from one dashboard. Auto-publish ranked articles to your site.",
  alternates: { canonical: "/features" },
};

const CAPABILITIES = [
  {
    icon: GlobeIcon,
    title: "Multi-site management",
    body: "Run unlimited sites from one dashboard.",
  },
  {
    icon: SearchIcon,
    title: "Keyword research",
    body: "Find low-competition keywords automatically.",
  },
  {
    icon: FileIcon,
    title: "Article generator",
    body: "1,500+ word articles ready to publish.",
  },
  {
    icon: ShieldIcon,
    title: "Quality gates",
    body: "Prevent weak content from going live.",
  },
  {
    icon: LinkIcon,
    title: "Internal linking",
    body: "Auto-link to your past articles.",
  },
  {
    icon: ChartIcon,
    title: "Performance tracking",
    body: "Track rankings, traffic, impressions.",
  },
  {
    icon: ClockIcon,
    title: "Daily cron auto-publish",
    body: "Set your pace. Scale when ready.",
  },
  {
    icon: LockIcon,
    title: "Encrypted credentials",
    body: "AES-256 at rest. Never plaintext.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-20 text-center">
        <div className="inline-flex items-center gap-1.5 bg-accent-dim text-accent border border-accent-border rounded-full px-3 py-1 text-xs uppercase tracking-wider font-bold mb-5">
          Trusted by 500+ site operators
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] max-w-3xl mx-auto">
          Run 100 SEO sites
          <br />
          <span className="text-accent">from one dashboard.</span>
        </h1>
        <p className="text-muted text-lg mt-5 max-w-xl mx-auto">
          From keyword to published article in under 10 minutes — without hiring writers.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            152 articles published this month
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            128K+ impressions generated
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            14 days median to first rank
          </span>
        </div>
      </section>

      {/* Capability grid */}
      <section className="max-w-[1100px] mx-auto px-6 md:px-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CAPABILITIES.map((c) => (
            <div
              key={c.title}
              className="bg-card-grad border border-border rounded-2xl p-6 hover:border-accent-border transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-dim text-accent grid place-items-center mb-4 group-hover:scale-105 transition-transform">
                <c.icon />
              </div>
              <h3 className="font-bold text-sm mb-1.5">{c.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow — how it works visually */}
      <section className="max-w-[1100px] mx-auto px-6 md:px-10 pb-16">
        <h2 className="text-2xl font-extrabold text-center mb-10">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { n: "1", t: "Add your site", b: "Connect in 60 seconds." },
            { n: "2", t: "Queue keywords", b: "Or let us research them." },
            { n: "3", t: "Review articles", b: "Approve or auto-publish." },
            { n: "4", t: "Watch traffic grow", b: "Track rankings over time." },
          ].map((s) => (
            <div key={s.n} className="bg-card-grad border border-border rounded-xl p-5 flex items-start gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-accent text-black font-black grid place-items-center text-sm">
                {s.n}
              </span>
              <div>
                <div className="font-bold text-text text-sm">{s.t}</div>
                <div className="text-muted text-xs mt-1">{s.b}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1100px] mx-auto px-6 md:px-10 pb-20">
        <div className="bg-card-grad border border-accent-border rounded-2xl p-10 text-center shadow-glow">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
            Your first article goes live{" "}
            <span className="text-accent">in under 10 minutes.</span>
          </h2>
          <p className="text-muted text-sm mb-2">Start for $1. Cancel anytime.</p>
          <p className="text-muted-2 text-xs mb-6">3-day trial · 7-day money-back guarantee</p>
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 bg-accent text-black px-7 py-3.5 rounded-xl font-extrabold text-base no-underline hover:brightness-110 transition-all shadow-glow"
          >
            Start 3-Day Trial →
          </a>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function FileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
