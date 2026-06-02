import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const metadata: Metadata = {
  title: "Results — SEOForge",
  description: "See how operators, agencies, and niche site builders use SEOForge to scale content and rank.",
  alternates: { canonical: "/testimonials" },
};

export const dynamic = "force-dynamic";

const CASES = [
  {
    title: "The solo operator",
    before: "Writing every article by hand. Publishing 2-3 per week max.",
    after: "75 articles per month. Traffic up 214% in 90 days.",
    result: "Hours back every week",
  },
  {
    title: "The agency",
    before: "Juggling 12 client sites. Content was the bottleneck.",
    after: "250 articles per month across 15 sites. Clients see rankings, not drafts.",
    result: "Scaled from 12 to 47 sites",
  },
  {
    title: "The niche builder",
    before: "One site. All content on pause while testing topics.",
    after: "18 sites running. Each one auto-publishing daily.",
    result: "Hobby became a full-time income",
  },
];

const METRICS = [
  { v: "500+", l: "operators trust SEOForge" },
  { v: "128K+", l: "impressions generated" },
  { v: "14 days", l: "median time to first rank" },
  { v: "$0.39", l: "average cost per article" },
];

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />
      <main className="max-w-[1100px] mx-auto px-6 md:px-10 py-12 md:py-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Content that <span className="text-accent">actually ranks.</span>
          </h1>
          <p className="text-muted text-lg mt-4">
            Not promises. Results from operators who switched.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16">
          {METRICS.map((m) => (
            <div key={m.l} className="bg-card-grad border border-border rounded-2xl p-5 text-center">
              <div className="text-2xl md:text-3xl font-extrabold text-accent tracking-tight">{m.v}</div>
              <div className="text-muted text-xs mt-1.5">{m.l}</div>
            </div>
          ))}
        </div>

        {/* Use cases */}
        <h2 className="text-2xl font-extrabold text-center mb-8">Who uses SEOForge</h2>
        <div className="space-y-4 mb-16">
          {CASES.map((c) => (
            <div key={c.title} className="bg-card-grad border border-border rounded-2xl p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-10 items-start">
                <div>
                  <div className="text-accent text-xs font-bold uppercase tracking-wider mb-1">Before</div>
                  <p className="text-muted text-sm">{c.before}</p>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg mb-2">{c.title}</h3>
                  <div className="bg-accent-dim border border-accent-border rounded-xl p-4 mb-3">
                    <div className="text-accent text-xs font-bold uppercase tracking-wider mb-1">After</div>
                    <p className="text-text text-sm font-semibold">{c.after}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="text-muted">{c.result}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-card-grad border border-accent-border rounded-2xl p-10 shadow-glow max-w-xl mx-auto">
          <h2 className="text-2xl font-extrabold mb-2">
            See results for your site.
          </h2>
          <p className="text-muted text-sm mb-6">
            Start your 3-day trial. First article in 10 minutes. Cancel anytime.
          </p>
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 bg-accent text-black px-7 py-3.5 rounded-xl font-extrabold text-base no-underline hover:brightness-110 transition-all shadow-glow"
          >
            Start for $1 →
          </a>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
