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
    q: "How long does setup take?",
    a: "About 60 seconds. Connect your site, queue a keyword, and your first article publishes in under 10 minutes. No configuration, no API keys.",
  },
  {
    q: "How much does each article cost?",
    a: "Creator plan: ~$0.39 per article. Operator: ~$0.32. Agency: ~$0.20. Overage is $0.45/$0.30/$0.15 per extra article beyond your monthly cap.",
  },
  {
    q: "Can I use this with multiple sites?",
    a: "Yes. Creator supports 3 sites, Operator 15, and Agency unlimited. Each site gets its own settings, keywords, and publishing schedule.",
  },
  {
    q: "Can I edit articles before publishing?",
    a: "Absolutely. Every article starts as a draft you can review, edit, and approve. Quality gates also hold back articles that don't meet your minimum word count or lack FAQ sections.",
  },
  {
    q: "Is there a money-back guarantee?",
    a: "Yes. 7-day money-back guarantee on first-time subscriptions. If you're not happy, email us and we'll refund your subscription — no questions asked.",
  },
  {
    q: "What happens after the 3-day trial?",
    a: "Try everything for 3 days. Cancel before day 3 and you're never charged the monthly rate. If you stay, your subscription starts automatically — and you can cancel anytime after that too. No contracts.",
  },
  {
    q: "Do I need my own API keys?",
    a: "No. All plans include managed generation capacity. We handle the entire pipeline — you just connect your site and queue keywords.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts. Cancel from the dashboard, keep access through the end of your billing period. Your articles stay on your site forever — they're yours.",
  },
  {
    q: "What kind of sites can I publish to?",
    a: "You connect your site via REST API. This works with most modern platforms. Setup takes 60 seconds with secure credentials.",
  },
  {
    q: "How is this different from using ChatGPT?",
    a: "ChatGPT writes text. We write articles that rank. Every article includes real SERP analysis, internal linking, FAQ schema, rich formatting (TL;DR boxes, callouts, comparison tables, pull-quotes), and auto-publishes to your site. No prompting required.",
  },
  {
    q: "Who built this?",
    a: "SEOForge is built and run by Aubrey, a solo indie developer. Bootstrapped, no VC, no team. Every support email goes to a real person who actually ships the product.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />
      <main className="max-w-2xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="text-center mb-10">
          <div className="text-accent text-xs font-bold uppercase tracking-wider mb-3">FAQ</div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Questions &amp; <span className="text-accent">answers</span>
          </h1>
          <p className="text-muted text-lg mt-4">
            Can't find what you're looking for? Chat with us — we're real people.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <details key={i} className="group bg-card-grad border border-border rounded-xl overflow-hidden">
              <summary className="cursor-pointer list-none text-sm font-bold text-text flex items-center justify-between gap-3 px-5 py-4 hover:text-accent transition-colors">
                <span>{item.q}</span>
                <span className="text-accent text-lg group-open:rotate-45 transition-transform shrink-0 leading-none">+</span>
              </summary>
              <div className="px-5 pb-4 text-muted text-sm leading-relaxed">{item.a}</div>
            </details>
          ))}
        </div>

        <div className="text-center mt-12 bg-card-grad border border-accent-border rounded-2xl p-8 shadow-glow">
          <h2 className="text-xl font-extrabold mb-2">Ready to try it?</h2>
          <p className="text-muted text-sm mb-5">Start your 3-day trial for $1. Cancel anytime.</p>
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 bg-accent text-black px-6 py-3 rounded-xl font-extrabold text-sm no-underline hover:brightness-110 transition-all"
          >
            Start for $1 →
          </a>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
