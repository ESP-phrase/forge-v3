import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Panel } from "@/components/Panel";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Features — Topic clusters, GSC, auto-publish, anchor analysis",
  description:
    "Every SEO feature SEOForge ships: cluster planner, SERP gap analysis, WordPress auto-publish, Google Search Console, anchor-text diversity, backlink outreach, internal linking, schema markup.",
  alternates: { canonical: "/features" },
};

const FEATURES = [
  {
    title: "Multi-site management",
    body: "One dashboard for unlimited WordPress sites. Each site has its own niche, audience, expert voice, daily cap, and credentials — all stored encrypted at rest.",
  },
  {
    title: "Keyword research",
    body: "Paste a seed term. We find 30+ long-tail candidates with intent tags that a new domain can realistically rank for in 3-6 months.",
  },
  {
    title: "Article generator",
    body: "Every article ships with H2/H3 structure, FAQ, JSON-LD schema, category, and tags. Internal linking happens automatically against your past articles.",
  },
  {
    title: "Quality gates",
    body: "Articles below your minimum word count or missing FAQ are held back as drafts for human review. Nothing low-quality reaches WordPress automatically.",
  },
  {
    title: "Daily caps",
    body: "Per-site rate limits keep new domains under Google's spam radar. 1–2 articles/day at launch, scale up after 4–6 weeks of clean indexing.",
  },
  {
    title: "WordPress publisher",
    body: "REST API integration that creates posts, categories, and tags on the fly. Drafts go to your WP admin queue; flip to auto-publish when you're confident.",
  },
  {
    title: "Cost tracking",
    body: "See your per-site monthly spend at a glance. Every article's cost is logged to the cent.",
  },
  {
    title: "Activity log",
    body: "Every generation, publish, and quality-gate hold is recorded with timestamp, status, message, and cost. Filter by site or browse globally.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />
      <main className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Everything you need to <span className="text-accent">scale SEO content.</span>
          </h1>
          <p className="text-muted text-lg mt-4">
            A single dashboard handles keyword research, article generation, internal linking,
            publishing, and tracking — across as many WordPress sites as you can run.
          </p>
        </div>
        {/* 8 features — 4 cols on lg gives a perfect 4/4 split instead of 3/3/2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <Panel key={f.title} title={f.title}>
              <p className="text-muted text-sm leading-relaxed">{f.body}</p>
            </Panel>
          ))}
        </div>
        {/* CTA — bottom of features, top of purchase intent */}
        <div className="text-center max-w-xl mx-auto mt-14 bg-card-grad border border-accent-border rounded-2xl p-10 shadow-glow">
          <h2 className="text-2xl font-extrabold tracking-tight mb-2">
            Ship better content <span className="text-accent">today.</span>
          </h2>
          <p className="text-muted text-sm mb-6">
            Spin up your first site and publish an article in under 10 minutes.
          </p>
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 bg-accent text-black px-5 py-2.5 rounded-xl font-extrabold text-sm no-underline hover:brightness-110"
          >
            Start 3-day trial →
          </a>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
