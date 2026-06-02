"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { LockIcon } from "@/components/Icons";
import { startCheckoutAction } from "@/actions/billing";

type Tier = {
  name: string;
  tagline: string;
  trialFee: number;
  priceMo: number;
  priceYr: number;
  accent: boolean;
  cta: string;
  articles: string;
  sites: string;
  features: string[];
};

const TIERS: Tier[] = [
  {
    name: "Creator",
    tagline: "For the solo operator.",
    trialFee: 1,
    priceMo: 29,
    priceYr: 23,
    accent: false,
    cta: "Start 3-day trial",
    articles: "75 articles / mo",
    sites: "3 sites",
    features: [
      "Keyword research + SERP analysis",
      "1,500-word SEO articles",
      "Auto-publish",
      "Quality gates + drafts review",
      "Activity log + cost tracking",
    ],
  },
  {
    name: "Operator",
    tagline: "Run a real portfolio.",
    trialFee: 10,
    priceMo: 79,
    priceYr: 63,
    accent: true,
    cta: "Start 3-day trial",
    articles: "250 articles / mo",
    sites: "15 sites",
    features: [
      "Everything in Creator",
      "Daily cron auto-publish",
      "Backlink outreach workflow",
      "Internal-link graph builder",
      "Self-hosted page analytics",
    ],
  },
  {
    name: "Agency",
    tagline: "Scale across clients.",
    trialFee: 30,
    priceMo: 199,
    priceYr: 159,
    accent: false,
    cta: "Start 3-day trial",
    articles: "1,000 articles / mo",
    sites: "Unlimited sites",
    features: [
      "Everything in Operator",
      "Google Search Console integration",
      "White-label client reports",
      "Team seats (up to 5)",
      "Priority generation + API access",
    ],
  },
];

const COMPARE: { label: string; values: (string | boolean)[] }[] = [
    { label: "Auto-publish", values: [true, true, true] },
  { label: "Keyword research", values: [true, true, true] },
  { label: "SERP gap analysis", values: [true, true, true] },
  { label: "Internal linking", values: [true, true, true] },
  { label: "Page-view analytics", values: [false, true, true] },
  { label: "Google Search Console", values: [false, false, true] },
  { label: "Backlink outreach", values: [false, true, true] },
  { label: "Daily cron auto-publish", values: [false, true, true] },
  { label: "Team seats", values: ["1", "3", "5"] },
  { label: "Support SLA", values: ["Community", "Email · 24h", "Slack · 4h"] },
];

const FAQ = [
  {
    q: "Is the content actually good?",
    a: "Every article is built from real SERP analysis of what's already ranking, runs through quality gates (word count, headings, FAQ, schema, internal links), and reads like a human wrote it — not generic blog spam.",
  },
  {
    q: "Do I need my own API keys?",
    a: "No. All plans include managed generation capacity. We handle the entire pipeline — you just connect your WordPress site and queue keywords.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts. Cancel from the dashboard, keep access through the end of your billing period. Your articles stay on your WordPress site forever — they're yours.",
  },
  {
    q: "Is there a money-back guarantee?",
    a: "Yes. 7-day money-back guarantee on first-time subscriptions. If you're not happy, email us and we'll refund your subscription — no questions asked.",
  },
  {
    q: "What happens after the trial?",
    a: "You get 3 days to try everything. Cancel before day 3 and you're never charged the monthly rate. If you stay, your subscription starts automatically — and you can cancel anytime after that too.",
  },
];

export default function PricingPageClient() {
  const [annual, setAnnual] = useState(false);
  const searchParams = useSearchParams();
  const triggered = useRef(false);

  useEffect(() => {
    const plan = searchParams.get("plan");
    const cadence = searchParams.get("cadence");
    if (plan && cadence && !triggered.current) {
      triggered.current = true;
      const fd = new FormData();
      fd.set("plan", plan);
      fd.set("cadence", cadence);
      startCheckoutAction(fd).catch(() => {});
    }
  }, [searchParams]);

  const bestValue = annual ? "Creator · $23/mo" : "Creator · $1 today";

  return (
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />
      <main className="max-w-[1200px] mx-auto px-6 md:px-10 py-12 md:py-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 bg-accent-dim text-accent border border-accent-border rounded-full px-3 py-1 text-xs uppercase tracking-wider font-bold mb-5">
            {annual ? "Save 20% with annual billing" : `Starts at ${bestValue}`}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            One plan. <span className="text-accent">All the content.</span>
          </h1>
          <p className="text-muted text-lg mt-4">
            Your first article goes live in 10 minutes. Every plan includes keyword research,
            SERP analysis, article generation, and WordPress auto-publish.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button type="button" onClick={() => setAnnual(false)}
              className={`text-sm font-bold ${!annual ? "text-text" : "text-muted hover:text-text"}`}>
              Monthly
            </button>
            <button type="button" role="switch" aria-checked={annual}
              onClick={() => setAnnual(!annual)}
              className="relative w-12 h-6 rounded-full bg-surface-2 border border-border transition-colors">
              <span className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-accent shadow-glow transition-all ${annual ? "left-[28px]" : "left-0.5"}`} />
            </button>
            <button type="button" onClick={() => setAnnual(true)}
              className={`text-sm font-bold flex items-center gap-2 ${annual ? "text-text" : "text-muted hover:text-text"}`}>
              Annual
              <span className="bg-accent text-black text-[0.6rem] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded">Save 20%</span>
            </button>
          </div>

          <Suspense fallback={null}>
            <PricingErrorBanner />
          </Suspense>

          {/* Trust badges */}
          <div className="inline-flex items-center gap-3 mt-5 bg-surface border border-border rounded-full px-4 py-2 text-xs text-muted">
            <span className="flex items-center gap-1"><LockIcon className="w-3 h-3 text-accent" /> 7-day money-back guarantee</span>
            <span className="text-muted-2">·</span>
            <span>Secured by Stripe</span>
            <span className="text-muted-2">·</span>
            <span>Cancel anytime</span>
          </div>
        </div>

        {/* Tier cards */}
        <div id="plans" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
          {TIERS.map((t, idx) => {
            const price = annual ? t.priceYr : t.priceMo;
            const strike = annual ? t.priceMo : null;
            const slug = (["hobby", "operator", "agency"] as const)[idx];
            const annualSavings = t.priceMo - t.priceYr;
            return (
              <div key={t.name}
                className={`relative rounded-2xl p-7 border flex flex-col ${
                  t.accent
                    ? "border-accent bg-card-grad shadow-glow ring-2 ring-accent/40 md:-mt-2 md:mb-2"
                    : "border-border bg-card-grad"
                }`}>
                {t.accent ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-black text-xs font-extrabold uppercase tracking-wider px-4 py-1 rounded-full whitespace-nowrap">
                    Most operators pick this
                  </div>
                ) : null}

                <div className="text-xs text-muted font-bold uppercase tracking-wider mb-3">{t.name}</div>

                {/* Price */}
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-5xl font-extrabold tracking-tight text-accent">
                    ${price}
                  </span>
                  <span className="text-muted text-sm">/mo</span>
                  {strike ? (
                    <span className="text-muted-2 line-through text-sm ml-1">
                      ${strike}/mo
                    </span>
                  ) : null}
                </div>
                {annual && annualSavings > 0 ? (
                  <p className="text-accent text-sm font-semibold mb-3">
                    Save ${annualSavings * 12}/yr
                  </p>
                ) : (
                  <p className="text-muted text-sm mb-3">
                    ${t.trialFee} today · cancel before day 3
                  </p>
                )}

                {/* Capacity badge */}
                <div className="bg-accent-dim border border-accent-border rounded-xl p-4 mb-6">
                  <div className="text-accent text-lg font-extrabold">{t.articles}</div>
                  <div className="text-muted text-sm">{t.sites}</div>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 text-sm mb-6 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check />
                      <span className="text-text/80">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <form action={startCheckoutAction} onSubmit={() => {
                  const value = t.trialFee;
                  try { (window as any).ttq?.track?.("AddToCart", { value, currency: "USD", content_name: `${t.name} plan`, content_id: slug, content_type: "product" }); } catch {}
                  try { (window as any).rdt?.("track", "AddToCart", { value, currency: "USD", itemCount: 1 }); } catch {}
                }}>
                  <input type="hidden" name="plan" value={slug} />
                  <input type="hidden" name="cadence" value={annual ? "annual" : "monthly"} />
                  <button type="submit"
                    className={`w-full px-6 py-3.5 text-sm font-extrabold rounded-xl transition-all ${
                      t.accent
                        ? "bg-accent text-black hover:brightness-110 shadow-glow"
                        : "bg-surface-2 text-text border border-border hover:bg-surface-3"
                    }`}>
                    {t.cta}
                  </button>
                </form>
                <p className="text-muted-2 text-xs text-center mt-3">No credit check · Cancel anytime</p>
              </div>
            );
          })}
        </div>

        {/* Feature comparison */}
        <section className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-extrabold text-center mb-2">Compare features</h2>
          <p className="text-muted text-sm text-center mb-8">Everything you get on each plan, side by side.</p>
          <div className="bg-card-grad border border-border rounded-2xl overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-5 text-muted font-bold">Feature</th>
                  {TIERS.map((t, i) => (
                    <th key={t.name} className={`text-center py-4 px-3 font-bold ${i === 1 ? "text-accent" : "text-text"}`}>
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={row.label} className={`border-b border-border last:border-0 ${i % 2 ? "bg-surface-2/20" : ""}`}>
                    <td className="py-3.5 px-5 text-text font-medium">{row.label}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className="py-3.5 px-3 text-center">
                        {v === true ? <span className="text-accent font-bold">&#x2713;</span>
                          : v === false ? <span className="text-muted-2">&mdash;</span>
                          : <span className="text-text font-semibold">{v}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl font-extrabold text-center mb-2">Questions & answers</h2>
          <p className="text-muted text-sm text-center mb-8">If you don't see yours, chat with us — we're real people.</p>
          <div className="space-y-2">
            {FAQ.map((item) => (
              <details key={item.q} className="group bg-card-grad border border-border rounded-xl overflow-hidden">
                <summary className="cursor-pointer list-none text-sm font-bold text-text flex items-center justify-between gap-3 px-5 py-4 hover:text-accent transition-colors">
                  <span>{item.q}</span>
                  <span className="text-accent text-lg group-open:rotate-45 transition-transform shrink-0 leading-none">+</span>
                </summary>
                <div className="px-5 pb-4 text-muted text-sm leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center max-w-xl mx-auto">
          <div className="bg-card-grad border border-accent-border rounded-2xl p-10 shadow-glow">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">
              Your first article <span className="text-accent">in 10 minutes.</span>
            </h2>
            <p className="text-muted text-base mb-6">
              Connect your site, queue a keyword, publish. It really is that fast.
            </p>
            <a href="#plans" className="inline-flex items-center gap-2 bg-accent text-black px-7 py-3.5 rounded-xl font-extrabold text-base no-underline hover:brightness-110 transition-all shadow-glow">
              Pick your plan →
            </a>
            <p className="text-muted-2 text-xs mt-4">3-day trial · 7-day guarantee · Cancel anytime · No credit check</p>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function PricingErrorBanner() {
  const params = useSearchParams();
  const error = params.get("error");
  if (!error) return null;
  return (
    <div role="alert" className="mt-4 mx-auto max-w-xl bg-[rgba(248,113,113,0.10)] text-danger border border-[rgba(248,113,113,0.3)] rounded-lg px-4 py-3 text-sm text-left">
      {error}
    </div>
  );
}

function Check() {
  return (
    <span className="inline-grid place-items-center w-5 h-5 rounded-full bg-accent-dim mt-0.5 shrink-0" aria-hidden>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#bef848" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 5 5 9-11" />
      </svg>
    </span>
  );
}
