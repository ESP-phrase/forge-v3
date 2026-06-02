import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { LinkButton } from "@/components/Button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New — SEOForge",
  description: "SEO articles, written and published. $1 start. No writing required.",
  alternates: { canonical: "/new" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "SEOForge — SEO articles, written and published",
    description: "Ranked articles on autopilot. $1 to start. ProductHunt launch.",
    type: "website",
  },
};

export default function NewPage() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <MarketingHeader />

      {/* Hero */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 md:py-16">
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 bg-accent-dim text-accent border border-accent-border rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-wider font-bold mb-5">
            New on ProductHunt
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] max-w-2xl mx-auto">
            SEO articles, written and published.
            <br />
            <span className="text-accent">$1 start.</span>
          </h1>
          <p className="text-muted text-lg mt-5 max-w-xl mx-auto leading-relaxed">
            No writing. Just articles that rank and publish to your site. 
            Built for operators who want traffic without the typing.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
            <a
              href="https://www.producthunt.com/posts/seoforge"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#da552f] text-white px-5 py-3 rounded-xl font-extrabold text-sm no-underline hover:brightness-110 transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M13.604 8.4h-3.405V12h3.405c.995 0 1.801-.807 1.801-1.8 0-.993-.806-1.8-1.801-1.8zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H8.801V6h4.803c2.319 0 4.2 1.881 4.2 4.2 0 2.319-1.881 4.2-4.2 4.2z" />
              </svg>
              Upvote on ProductHunt
            </a>
            <LinkButton href="/pricing?utm_source=producthunt" size="lg">
              Try for $1 →
            </LinkButton>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {[
            { v: "1,000+", l: "articles published" },
            { v: "10 min", l: "first article live" },
            { v: "14 days", l: "median time to rank" },
            { v: "<$0.50", l: "per article" },
          ].map((m) => (
            <div key={m.l} className="bg-card-grad border border-border rounded-2xl p-4 text-center">
              <div className="text-2xl md:text-3xl font-extrabold text-accent tracking-tight">{m.v}</div>
              <div className="text-muted text-[0.65rem] mt-1 uppercase tracking-wider font-semibold">{m.l}</div>
            </div>
          ))}
        </section>

        {/* Testimonials */}
        <section className="mb-12">
          <h2 className="text-2xl font-extrabold text-center mb-6">What operators say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                quote: "I run 18 niche sites with one keyboard. This is the difference between a hobby and a job.",
                name: "Alex P.", role: "Affiliate site owner",
              },
              {
                quote: "It paid for itself in the first month. I have hours back every week.",
                name: "Diego M.", role: "Freelance SEO",
              },
              {
                quote: "We went from 4 sites to 47 in a quarter. The pipeline just runs.",
                name: "Maya R.", role: "Founder, programmatic SaaS",
              },
            ].map((t) => (
              <div key={t.name} className="bg-card-grad border border-border rounded-2xl p-5 flex flex-col">
                <div className="text-accent text-2xl font-bold mb-1">&ldquo;</div>
                <blockquote className="text-text text-sm leading-relaxed flex-1">{t.quote}</blockquote>
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent grid place-items-center text-black font-black text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-text text-xs">{t.name}</div>
                    <div className="text-muted text-[0.65rem]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Maker section */}
        <section className="bg-card-grad border border-accent-border rounded-2xl p-8 mb-12 text-center">
          <div className="w-16 h-16 rounded-full bg-accent text-black grid place-items-center text-2xl font-extrabold mx-auto mb-4">
            AN
          </div>
          <h2 className="text-2xl font-extrabold mb-2">Built by Aubrey</h2>
          <p className="text-muted text-sm max-w-lg mx-auto leading-relaxed mb-1">
            Solo indie developer. Bootstrapped. No VC, no team, no hype.
          </p>
          <p className="text-muted text-sm max-w-lg mx-auto leading-relaxed">
            I built SEOForge because I was tired of writing blog posts. Now 1,000+ articles 
            later, operators run their content on autopilot. I answer every support email myself.
          </p>
        </section>

        {/* Shoutouts — made with these */}
        <section className="mb-12">
          <h2 className="text-xl font-extrabold text-center mb-2">Built on great tools</h2>
          <p className="text-muted text-sm text-center mb-6">Each one gets a shoutout on their ProductHunt review page.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-xl mx-auto">
            {[
              { name: "Stripe", url: "https://www.producthunt.com/products/stripe", desc: "Payments & subscriptions engine" },
              { name: "Resend", url: "https://www.producthunt.com/products/resend", desc: "Transactional email delivery" },
              { name: "Creatify.ai", url: "https://www.producthunt.com/products/creatify", desc: "Ad creative generation" },
            ].map((tool) => (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noreferrer"
                className="bg-card-grad border border-border rounded-xl p-4 text-center hover:border-accent-border transition-colors no-underline group"
              >
                <div className="font-bold text-text text-sm group-hover:text-accent transition-colors">{tool.name}</div>
                <div className="text-muted text-xs mt-1">{tool.desc}</div>
              </a>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center">
          <div className="bg-card-grad border border-accent-border rounded-2xl p-8 shadow-glow">
            <h2 className="text-2xl font-extrabold mb-2">
              Launch offer: <span className="text-accent">50% off</span> first month
            </h2>
            <p className="text-muted text-sm mb-1">
              Use code <code className="bg-surface-2 px-2 py-0.5 rounded text-accent font-bold">PH2026</code> at checkout
            </p>
            <p className="text-muted-2 text-xs mb-6">Valid for the first 50 customers</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <LinkButton href="/pricing?utm_source=producthunt&coupon=PH2026" size="lg">
                Start for $1 →
              </LinkButton>
              <a
                href="https://www.producthunt.com/posts/seoforge"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 text-sm font-semibold text-muted hover:text-text no-underline border border-border rounded-xl bg-surface-2/40 hover:bg-surface-2"
              >
                Upvote on ProductHunt
              </a>
            </div>
          </div>
          <p className="text-muted-2 text-xs mt-4">3-day trial · cancel anytime · 7-day money-back guarantee</p>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
