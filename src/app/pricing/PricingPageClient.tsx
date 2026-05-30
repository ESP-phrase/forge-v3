"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { LinkButton } from "@/components/Button";
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
      "AI keyword research",
      "AI-powered article generation",
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
      "Priority AI capacity",
      "API access",
      "Slack support · 4h",
      "Overage $0.15 / article",
    ],
  },
];

const COMPARE: { label: string; values: (string | boolean)[] }[] = [
  { label: "WordPress auto-publish", values: [true, true, true] },
  { label: "AI keyword research", values: [true, true, true] },
  { label: "SERP gap analysis", values: [true, true, true] },
  { label: "Internal linking", values: [true, true, true] },
  { label: "Page-view analytics", values: [false, true, true] },
  { label: "Google Search Console", values: [false, false, true] },
  { label: "Backlink outreach AI drafts", values: [false, true, true] },
  { label: "Daily cron auto-publish", values: [false, true, true] },
  { label: "Team seats", values: ["1", "3", "up to 5"] },
  { label: "Support SLA", values: ["Community", "Email · 24h", "Slack · 4h"] },
];

const FAQ = [
  {
    q: "Do I bring my own AI keys, or is it included?",
    a: "All paid plans include managed AI capacity — no API key needed. We absorb the cost of generation as part of your plan.",
  },
  {
    q: "Can I exceed my monthly cap?",
    a: "Yes — overage is $0.45/article on Creator, $0.30/article on Operator, $0.15/article on Agency. We notify at 80% so nothing catches you by surprise.",
  },
  {
    q: "What's the $1 hold?",
    a: "When you start a trial we charge a small upfront fee — $1 on Creator, $10 on Operator, $30 on Agency — to prevent abuse and confirm intent. You get 3 days of full premium access. Cancel before day 3 and you're never charged the monthly rate.",
  },
  {
    q: "Is the content actually good, or is it generic AI slop?",
    a: "Every article is built from real SERP analysis, runs through quality gates (word count, headings, FAQ, schema, internal links), and uses top-tier AI — not a cheap model. Generic AI tools produce 600-word fluff; SEOForge produces 1,500-word articles with TL;DR boxes, callouts, comparison tables, and pull-quotes.",
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

  // Auto-resume checkout after login: when returning from /login with
  // ?plan=X&cadence=Y in the URL, fire the checkout action immediately
  // so the user doesn't have to re-click their plan button.
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
    <div className="min-h-screen bg-bg text-text">
      <MarketingHeader />
      <main className="max-w-[1200px] mx-auto px-6 md:px-10 py-12 md:py-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 bg-accent-dim text-accent border border-accent-border rounded-full px-3 py-1 text-[0.7rem] uppercase tracking-wider font-bold mb-4">
            Starts at $1 today
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Pick your plan. <span className="text-accent">Start in 30 seconds.</span>
          </h1>
          <p className="text-muted text-base mt-3">
            3-day trial · cancel anytime before day 3 · monthly billing starts after.
          </p>
          <div className="inline-flex items-center gap-2 mt-3 bg-surface border border-border rounded-full px-4 py-1.5 text-xs text-muted">
            <LockIcon className="text-accent" />
            7-day money-back guarantee · Secured by Stripe
          </div>
          <Suspense fallback={null}>
            <PricingErrorBanner />
          </Suspense>
        </div>

        {/* Billing toggle — true switch with sliding knob */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={`text-sm font-bold transition-colors ${
              !annual ? "text-text" : "text-muted hover:text-text"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            role="switch"
            aria-checked={annual}
            onClick={() => setAnnual(!annual)}
            className="relative w-14 h-7 rounded-full bg-surface-2 border border-border transition-colors"
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-accent shadow-glow transition-all ${
                annual ? "left-[30px]" : "left-0.5"
              }`}
            />
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={`text-sm font-bold transition-colors flex items-center gap-2 ${
              annual ? "text-text" : "text-muted hover:text-text"
            }`}
          >
            Annual
            <span className="bg-accent text-black text-[0.6rem] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded">
              Save 20%
            </span>
          </button>
        </div>

        {/* Tier cards */}
        <div id="plans" className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {TIERS.map((t, idx) => {
            const price = annual ? t.priceYr : t.priceMo;
            const strike = annual ? t.priceMo : null;
            // Map array index → internal plan slug. Both variants use the
            // same 3 slugs under the hood: [hobby, operator, agency].
            const slug = (["hobby", "operator", "agency"] as const)[idx];
            return (
              <div
                key={t.name}
                className={`relative rounded-2xl p-7 border ${
                  t.accent
                    ? "border-accent bg-card-grad shadow-glow"
                    : "border-border bg-card-grad"
                }`}
              >
                {t.accent ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-black text-[0.65rem] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
                    Most popular
                  </div>
                ) : null}
                <div className="text-xs text-muted font-bold uppercase tracking-wider">
                  {t.name}
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-5xl font-extrabold tracking-tight text-accent">
                    ${t.trialFee}
                  </span>
                  <span className="text-muted text-sm">Today</span>
                </div>
                <div className="text-muted text-xs mt-1.5">
                  then{" "}
                  <span className="text-text font-bold">
                    ${Number.isInteger(price) ? price : price.toFixed(2)}/mo
                  </span>{" "}
                  {strike ? (
                    <span className="text-muted-2 line-through">
                      ${Number.isInteger(strike) ? strike : strike.toFixed(2)}/mo
                    </span>
                  ) : null}
                </div>
                <p className="text-muted text-sm mt-4 mb-5">{t.tagline}</p>

                <div className="bg-accent-dim border border-accent-border rounded-xl p-3 mb-5">
                  <div className="text-accent text-base font-extrabold">{t.articles}</div>
                  <div className="text-muted text-xs mt-0.5">{t.sites}</div>
                </div>

                <ul className="space-y-2 text-sm mb-6">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check />
                      <span className="text-text/90">{f}</span>
                    </li>
                  ))}
                </ul>
                <form
                  action={startCheckoutAction}
                  onSubmit={() => {
                    console.log(`[pricing] Start trial click plan=${slug} cadence=${annual ? "annual" : "monthly"}`);
                    const value = t.trialFee;
                    try {
                      const w = window as unknown as { ttq?: { track?: (e: string, p: Record<string, unknown>) => void } };
                      const props = {
                        value,
                        currency: "USD",
                        content_name: `${t.name} plan`,
                        content_id: slug,
                        content_type: "product",
                      };
                      w.ttq?.track?.("AddToCart", props);
                      w.ttq?.track?.("InitiateCheckout", props);
                      w.ttq?.track?.("AddPaymentInfo", props);
                    } catch { /* ignore */ }
                    try {
                      const w = window as unknown as { rdt?: (e: string, a: string, p: Record<string, unknown>) => void };
                      w.rdt?.("track", "AddToCart", { value, currency: "USD", itemCount: 1 });
                    } catch { /* ignore */ }
                  }}
                >
                  <input type="hidden" name="plan" value={slug} />
                  <input type="hidden" name="cadence" value={annual ? "annual" : "monthly"} />
                  <button
                    type="submit"
                    className={`w-full px-4 py-3 text-sm font-extrabold rounded-xl transition-all ${
                      t.accent
                        ? "bg-accent text-black hover:bg-accent/90 shadow-glow"
                        : "bg-surface-2 text-text border border-border hover:bg-surface-3"
                    }`}
                  >
                    {t.cta}
                  </button>
                </form>
                <div className="mt-3 text-center text-muted-2 text-xs">
                  Cancel anytime during trial
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison matrix */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-2 tracking-tight">
            Compare features
          </h2>
          <p className="text-muted text-center mb-8">
            Everything you get on each plan, side by side.
          </p>
          {/* Horizontal scroll wrapper so the 4-column table doesn't squish
              into unreadable mush on phones. min-w[640px] keeps each column
              wide enough to read; users swipe horizontally on mobile. */}
          <div className="bg-card-grad border border-border rounded-2xl overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2/30">
                  <th className="text-left py-4 px-5 text-muted text-xs uppercase tracking-wider font-bold">
                    Feature
                  </th>
                  {TIERS.map((t) => (
                    <th
                      key={t.name}
                      className={`text-center py-4 px-3 text-sm font-extrabold ${
                        t.accent ? "text-accent" : "text-text"
                      }`}
                    >
                      <div className="inline-flex flex-col items-center gap-1">
                        {t.name}
                        {t.accent ? (
                          <span className="bg-accent text-black text-[0.55rem] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                            Most popular
                          </span>
                        ) : null}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={row.label} className={i % 2 ? "bg-surface-2/20" : ""}>
                    <td className="py-3.5 px-5 text-text">{row.label}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className="py-3.5 px-3 text-center">
                        {v === true ? (
                          <span className="text-accent font-bold text-lg">✓</span>
                        ) : v === false ? (
                          <span className="text-muted-2">—</span>
                        ) : (
                          <span className="text-text text-xs font-semibold">{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ schema for Google rich result */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQ.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: { "@type": "Answer", text: item.a },
              })),
            }),
          }}
        />

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-2 tracking-tight">
            Frequently asked questions
          </h2>
          <p className="text-muted text-center mb-8">
            Still on the fence? These usually help.
          </p>
          <div className="space-y-2">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group bg-card-grad border border-border rounded-xl overflow-hidden"
              >
                <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3 font-semibold text-text">
                  <span>{item.q}</span>
                  <span className="text-accent text-xl group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-muted text-sm leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-3xl mx-auto text-center bg-card-grad border border-accent-border rounded-2xl p-10 shadow-glow">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Stop writing. <span className="text-accent">Start ranking.</span>
          </h2>
          <p className="text-muted text-lg mb-6">
            Spin up your first site, queue a handful of keywords,
            <br className="hidden md:inline" />
            and have your first article live on WordPress in under 10 minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="#plans" variant="primary">
              See plans →
            </LinkButton>
            <Link
              href="/features"
              className="px-5 py-2.5 text-sm font-semibold text-muted hover:text-text no-underline border border-border rounded-xl bg-surface-2/40 hover:bg-surface-2"
            >
              See how it works
            </Link>
          </div>
          <p className="text-muted-2 text-xs mt-6">
            3-day trial · cancel anytime before day 3.
          </p>
        </div>
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


