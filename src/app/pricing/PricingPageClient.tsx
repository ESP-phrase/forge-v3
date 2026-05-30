"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { LockIcon } from "@/components/Icons";
import { startCheckoutAction } from "@/actions/billing";

type Tier = {
  name: string;
  tagline: string;
  trialFee: number;     // one-time charged today (in USD)
  priceMo: number;      // billed/mo after 14-day trial
  priceYr: number;      // billed/mo equivalent on annual cadence
  accent: boolean;
  cta: string;
  articles: string;
  sites: string;
  features: string[];
};

const TIERS: Tier[] = [
  {
    name: "Creator",
    tagline: "For solo operators and a few niche sites.",
    trialFee: 1,
    priceMo: 29,
    priceYr: 23,
    accent: false,
    cta: "Start 3-day trial",
    articles: "75 articles / mo",
    sites: "3 sites",
    features: [
      "Keyword research",
      "Article generation",
      "Quality gates + drafts review",
      "WordPress auto-publish",
      "Activity log + cost tracking",
      "Overage $0.45 / article",
    ],
  },
  {
    name: "Operator",
    tagline: "Run a real portfolio on autopilot.",
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
      "SERP & entity research",
      "Backlink outreach workflow",
      "Internal-link graph",
      "Self-hosted page-view analytics",
      "Email support · 24h",
      "Overage $0.30 / article",
    ],
  },
  {
    name: "Agency",
    tagline: "Power users, agencies, white-label clients.",
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
      "Priority generation",
      "API access",
      "Slack support · 4h",
      "Overage $0.15 / article",
    ],
  },
];

const COMPARE: { label: string; values: (string | boolean)[] }[] = [
  { label: "WordPress auto-publish", values: [true, true, true] },
    { label: "Keyword research", values: [true, true, true] },
  { label: "SERP gap analysis", values: [true, true, true] },
  { label: "Internal linking", values: [true, true, true] },
  { label: "Page-view analytics", values: [false, true, true] },
  { label: "Google Search Console", values: [false, false, true] },
    { label: "Backlink outreach emails", values: [false, true, true] },
  { label: "Daily cron auto-publish", values: [false, true, true] },
  { label: "Team seats", values: ["1", "3", "up to 5"] },
  { label: "Support SLA", values: ["Community", "Email · 24h", "Slack · 4h"] },
];

const FAQ = [
  {
    q: "Do I need my own API keys, or is it included?",
    a: "All paid plans include managed generation capacity — no extra setup. We handle the entire pipeline as part of your plan.",
  },
  {
    q: "Is the content actually good, or is it generic blog spam?",
    a: "Every article is built from real SERP analysis, runs through quality gates (word count, headings, FAQ, schema, internal links), and reads like a human wrote it. Generic tools produce 600-word fluff; we deliver 1,500-word articles with TL;DR boxes, callouts, comparison tables, and pull-quotes.",
  },
  {
    q: "Cancel anytime?",
    a: "Yes. No contracts. Cancel from the dashboard, keep access through the end of the billing period, then your articles stay on your WordPress site forever — they're yours.",
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

  return (
    <div className="h-screen bg-bg text-text flex flex-col overflow-hidden">
      <MarketingHeader />
      <main className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
        <div className="max-w-[1100px] mx-auto">
          {/* Hero — outcome-driven, social proof */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-accent-dim text-accent border border-accent-border rounded-full px-2.5 py-0.5 text-[0.6rem] uppercase tracking-wider font-bold">
                {annual
                  ? `From $${Math.min(...TIERS.map(t => t.priceYr))}/mo · Cancel anytime`
                  : `Start for $1 · 3-day trial`
                }
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight mt-1">
                Your first article goes <span className="text-accent">live in 10 minutes.</span>
              </h1>
              <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                <span>Trusted by 500+ site owners</span>
                <span className="text-muted-2">·</span>
                <span className="flex items-center gap-1">
                  <span className="text-accent">★★★★★</span> 4.8
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={() => setAnnual(false)}
                className={`text-xs font-bold ${!annual ? "text-text" : "text-muted hover:text-text"}`}>
                Monthly
              </button>
              <button type="button" role="switch" aria-checked={annual}
                onClick={() => setAnnual(!annual)}
                className="relative w-11 h-6 rounded-full bg-surface-2 border border-border transition-colors">
                <span className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-accent shadow-glow transition-all ${annual ? "left-[24px]" : "left-0.5"}`} />
              </button>
              <button type="button" onClick={() => setAnnual(true)}
                className={`text-xs font-bold flex items-center gap-1 ${annual ? "text-text" : "text-muted hover:text-text"}`}>
                Annual
                <span className="bg-accent text-black text-[0.5rem] font-extrabold uppercase tracking-wider px-1 py-0.5 rounded">Save 20%</span>
              </button>
            </div>
          </div>

          <Suspense fallback={null}>
            <PricingErrorBanner />
          </Suspense>

          {/* Tier cards — conversion-optimized */}
          <div id="plans" className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            {TIERS.map((t, idx) => {
              const price = annual ? t.priceYr : t.priceMo;
              const strike = annual ? t.priceMo : null;
              const slug = (["hobby", "operator", "agency"] as const)[idx];
              const annualSavings = t.priceMo - t.priceYr;
              return (
                <div key={t.name}
                  className={`relative rounded-xl p-4 border flex flex-col ${
                    t.accent
                      ? "border-accent bg-card-grad shadow-glow ring-1 ring-accent/30"
                      : "border-border bg-card-grad"
                  }`}>
                  {t.accent ? (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-black text-[0.55rem] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      Most popular · Best value
                    </div>
                  ) : null}

                  {/* Plan name + tagline */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[0.6rem] text-muted font-bold uppercase tracking-wider">{t.name}</div>
                    {idx === 2 ? <span className="text-[0.5rem] text-accent font-bold">⚡ Unlimited</span> : null}
                  </div>
                  <p className="text-muted text-[0.6rem] leading-tight mb-2">{t.tagline}</p>

                  {/* Price — emphasize the monthly cost, show trial as bonus */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold tracking-tight text-accent">${Number.isInteger(price) ? price : price.toFixed(2)}</span>
                    <span className="text-muted text-[0.6rem]">/mo</span>
                    {strike ? (
                      <span className="text-muted-2 line-through text-[0.6rem]">
                        ${Number.isInteger(strike) ? strike : strike.toFixed(2)}/mo
                      </span>
                    ) : null}
                  </div>
                  {annual && annualSavings > 0 ? (
                    <div className="text-[0.55rem] text-accent font-bold mt-0.5">
                      Save ${annualSavings * 12}/yr vs monthly
                    </div>
                  ) : null}
                  <div className="text-muted text-[0.55rem] mt-0.5 bg-accent-dim/50 inline-block px-1.5 py-0.5 rounded">
                    Try today for ${t.trialFee} · 3-day trial
                  </div>

                  {/* Key differentiator badge */}
                  <div className="bg-accent-dim border border-accent-border rounded-lg p-2 mt-2 mb-2">
                    <div className="text-accent text-sm font-extrabold">{t.articles}</div>
                    <div className="text-muted text-[0.6rem]">{t.sites}</div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-1 text-xs mb-3 flex-1">
                    {t.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-start gap-1.5">
                        <Check />
                        <span className="text-text/90">{f}</span>
                      </li>
                    ))}
                    {t.features.length > 4 ? (
                      <li className="text-accent text-[0.55rem] font-bold">+{t.features.length - 4} more →</li>
                    ) : null}
                  </ul>

                  {/* CTA with risk reversal */}
                  <form action={startCheckoutAction} onSubmit={() => {
                    const value = t.trialFee;
                    try { (window as unknown as { ttq?: { track?: (e: string, p: Record<string, unknown>) => void } }).ttq?.track?.("AddToCart", { value, currency: "USD", content_name: `${t.name} plan`, content_id: slug, content_type: "product" }); } catch {}
                    try { (window as unknown as { rdt?: (e: string, a: string, p: Record<string, unknown>) => void }).rdt?.("track", "AddToCart", { value, currency: "USD", itemCount: 1 }); } catch {}
                  }}>
                    <input type="hidden" name="plan" value={slug} />
                    <input type="hidden" name="cadence" value={annual ? "annual" : "monthly"} />
                    <button type="submit"
                      className={`w-full px-3 py-2.5 text-xs font-extrabold rounded-lg transition-all ${
                        t.accent
                          ? "bg-accent text-black hover:bg-accent/90 shadow-glow"
                          : "bg-surface-2 text-text border border-border hover:bg-surface-3"
                      }`}>
                      {annual && annualSavings > 0 ? `Start annual · Save $${annualSavings * 12}/yr` : t.cta}
                    </button>
                  </form>
                  <div className="mt-1.5 text-center flex items-center justify-center gap-2 text-muted-2 text-[0.55rem]">
                    <span>Cancel before day 3</span>
                    <span className="text-muted-3">·</span>
                    <span className="flex items-center gap-0.5">
                      <LockIcon className="w-2.5 h-2.5" /> 7-day guarantee
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Social proof + trust bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-3 text-[0.55rem] text-muted">
            <span>✦ Used by solo operators &amp; agencies</span>
            <span className="text-muted-2 hidden md:inline">·</span>
            <span>✦ No API key needed</span>
            <span className="text-muted-2 hidden md:inline">·</span>
            <span>✦ Cancel anytime</span>
          </div>

          {/* Compact comparison + FAQ row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-0">
            <div className="bg-card-grad border border-border rounded-xl p-3">
              <h3 className="text-xs font-extrabold text-muted uppercase tracking-wider mb-2">Compare features</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[300px] text-[0.6rem]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-1.5 pr-2 text-muted font-bold">Feature</th>
                      {TIERS.map((t, i) => (
                        <th key={t.name} className={`text-center py-1.5 px-1 font-bold ${i === 1 ? "text-accent" : "text-text"}`}>
                          {t.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE.slice(0, 6).map((row, i) => (
                      <tr key={row.label} className={i % 2 ? "bg-surface-2/20" : ""}>
                        <td className="py-1.5 pr-2 text-text">{row.label}</td>
                        {row.values.map((v, j) => (
                          <td key={j} className="py-1.5 px-1 text-center">
                            {v === true ? <span className="text-accent font-bold text-xs">&#x2713;</span>
                              : v === false ? <span className="text-muted-2">&mdash;</span>
                              : <span className="text-text font-semibold">{v}</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-card-grad border border-border rounded-xl p-3">
              <h3 className="text-xs font-extrabold text-muted uppercase tracking-wider mb-2">FAQ</h3>
              <div className="space-y-1">
                {FAQ.slice(0, 2).map((item) => (
                  <details key={item.q} className="group">
                    <summary className="cursor-pointer list-none text-xs font-semibold text-text flex items-center justify-between gap-2 py-1">
                      <span>{item.q}</span>
                      <span className="text-accent group-open:rotate-45 transition-transform shrink-0">+</span>
                    </summary>
                    <div className="text-muted text-[0.6rem] leading-relaxed pb-1">{item.a}</div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PricingErrorBanner() {
  const params = useSearchParams();
  const error = params.get("error");
  if (!error) return null;
  return (
    <div
      role="alert"
      className="mt-4 mx-auto max-w-xl bg-[rgba(248,113,113,0.10)] text-danger border border-[rgba(248,113,113,0.3)] rounded-lg px-4 py-3 text-sm text-left"
    >
      {error}
    </div>
  );
}

function Check() {
  return (
    <span className="inline-grid place-items-center w-4 h-4 rounded-full bg-accent-dim mt-0.5 shrink-0" aria-hidden>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#bef848" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 5 5 9-11" />
      </svg>
    </span>
  );
}


