import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FAQ — SEOForge",
  description: "Common questions about SEOForge — pricing, content quality, setup, and more.",
  alternates: { canonical: "/faq" },
};

const FAQ = [
  {
    q: "Is the content actually good?",
    a: "Every article is built from real SERP analysis of what's already ranking. We run quality gates — word count, headings, FAQ schema, internal links — before anything goes live. The result reads like a human wrote it, not generic blog spam.",
  },
  {
    q: "How is this different from using ChatGPT?",
    a: "ChatGPT writes text. We write articles that rank. Every article includes real SERP analysis, internal linking, FAQ schema, rich formatting (TL;DR boxes, callouts, comparison tables, pull-quotes), and auto-publishes to your site. No prompting required.",
  },
  {
    q: "How much does each article cost?",
    a: "Creator plan: ~$0.39 per article ($29/mo). Operator: ~$0.32 ($79/mo). Agency: ~$0.20 ($199/mo). Overage is $0.45/$0.30/$0.15 for extra articles.",
  },
  {
    q: "Can I edit articles before publishing?",
    a: "Yes. Every article starts as a draft you can review in the dashboard. Edit anything, approve, or reject. Quality gates also automatically hold back articles that don't meet your minimums.",
  },
  {
    q: "What happens if I cancel?",
    a: "No contracts. Cancel from the dashboard anytime. You keep access through the end of your billing period, and every article you published stays on your site forever — they're yours.",
  },
  {
    q: "Is there a money-back guarantee?",
    a: "Yes. 7-day money-back guarantee on first-time subscriptions. If you're not happy, email us and we'll refund — no questions asked.",
  },
];

const QUICK = [
  { q: "Setup time?", a: "60 seconds. No API keys needed." },
  { q: "Multiple sites?", a: "Yes — 3 on Creator, 15 on Operator, unlimited on Agency." },
  { q: "Money-back?", a: "7 days. No questions asked." },
  { q: "Contracts?", a: "No. Cancel anytime." },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />
      <main className="max-w-3xl mx-auto px-6 md:px-10 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-accent text-xs font-bold uppercase tracking-wider mb-3">FAQ</div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Questions &amp; <span className="text-accent">answers</span>
          </h1>
          <p className="text-muted text-lg mt-4">
            Can't find what you're looking for? Chat with us — we're real people.
          </p>
        </div>

        {/* At-a-glance quick answers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {QUICK.map((item) => (
            <div key={item.q} className="bg-card-grad border border-border rounded-xl p-4 text-center">
              <div className="text-accent font-extrabold text-xl mb-1">{item.a}</div>
              <div className="text-muted text-xs">{item.q}</div>
            </div>
          ))}
        </div>

        {/* Full Q&A — all open by default */}
        <div className="space-y-6">
          {FAQ.map((item, i) => (
            <div key={i}>
              <h2 className="text-lg font-extrabold mb-2">{item.q}</h2>
              <p className="text-muted text-sm leading-relaxed">{item.a}</p>
              {i < FAQ.length - 1 && <hr className="mt-6 border-border" />}
            </div>
          ))}
        </div>

        {/* Section: Who built this */}
        <div className="mt-12 bg-card-grad border border-border rounded-2xl p-8">
          <h2 className="text-lg font-extrabold mb-2">Who built this?</h2>
          <p className="text-muted text-sm leading-relaxed">
            SEOForge is built and run by Aubrey — a solo indie developer. Bootstrapped, no VC, no team. 
            Every support email goes to a real person who ships the product. If something breaks at 2 AM, 
            the same person who built it fixes it.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mt-12 bg-card-grad border border-accent-border rounded-2xl p-10 shadow-glow">
          <h2 className="text-2xl font-extrabold mb-2">
            Start your 3-day trial <span className="text-accent">for $1</span>
          </h2>
          <p className="text-muted text-sm mb-5">Cancel anytime. 7-day money-back guarantee.</p>
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
