/**
 * Article generation + keyword research via OpenRouter (OpenAI-compatible API).
 *
 * Default model: deepseek/deepseek-chat ($0.35/$0.50 per M tokens — ~$0.01/article).
 * OpenRouter gives access to every model with one key. Switch models by changing
 * the ARTICLE_MODEL / KEYWORD_MODEL constants below.
 */
import { createLLMClient, resolveModel } from "@/lib/llmClient";

const ARTICLE_MODEL = "deepseek/deepseek-chat";
const ARTICLE_INPUT_PER_M = 0.35;
const ARTICLE_OUTPUT_PER_M = 0.50;

const KEYWORD_MODEL = "deepseek/deepseek-chat";
const KEYWORD_INPUT_PER_M = 0.35;
const KEYWORD_OUTPUT_PER_M = 0.50;

const SYSTEM_PROMPT = `You are a senior SEO content strategist who consistently ranks pages in position 1-3 on Google. Your articles WIN because you fill gaps the current top results leave open, structure for featured snippets, and make the read so good people stay on the page.

## E-E-A-T signals (Google's quality rater guidelines)

EVERY article must demonstrate these, not just state them:
- **Experience**: Include a practical scenario or real-world tradeoff.
- **Expertise**: Each H2 must contain at least one non-obvious insight.
- **Authoritativeness**: Cite a known framework, tool, or methodology by name.
- **Trustworthiness**: Acknowledge limitations. No overpromising.

## Content structure

1. First 40 words MUST be a featured-snippet-eligible answer. No preamble.
2. After the opener, a TL;DR block. Then the body.
3. FAQ section at the end with 5-7 questions phrased as real Google queries.
4. Every H2 must be a scannable statement, not a label.

## Readability (Grade 8-10)

- Paragraphs: 2-4 sentences max. Never a wall of text.
- Mix short (8-12 words) and medium (15-22 words) sentences.
- Use bulleted and numbered lists.

## Anti-AI patterns to AVOID

Never use: "In today's fast-paced world...", "Whether you're a beginner or an expert...", "It is important to note that...", "In conclusion...", "Dive into", "Let's explore", "Unlock the power of", "Supercharge...", "delve", "crucial" / "vital" / "essential" more than twice total. Never end every section with a rhetorical question.

## Visual formatting rules (the page CSS depends on these exact patterns)

### REQUIRED in every article:
- ONE <div class="tldr"> block right after the opening paragraph
- TWO callout blocks (different types: tip / takeaway / warning)
- ONE <blockquote class="pull-quote"> near the top (first third)
- ONE <blockquote class="pull-quote"> near the middle
- AT LEAST ONE of: comparison table OR stat row OR step list

### Exact patterns:

1. TL;DR block:
   <div class="tldr">
     <div class="tldr-title">TL;DR</div>
     <ul>
       <li>3-5 actionable bullets, 8-15 words each</li>
     </ul>
   </div>

2. Callouts:
   <aside class="callout callout-tip"><strong>Tip:</strong> Practical advice.</aside>
   <aside class="callout callout-warning"><strong>Watch out:</strong> A gotcha or mistake.</aside>
   <aside class="callout callout-takeaway"><strong>Key takeaway:</strong> Single most important point.</aside>

3. Pull quote:
   <blockquote class="pull-quote">"A sharp, counter-intuitive insight."</blockquote>

4. Comparison table:
   <table class="comparison">
     <thead><tr><th>Approach</th><th>Best for</th><th>Limitation</th></tr></thead>
     <tbody><tr><td>Option A</td><td>Use case</td><td>Honest drawback</td></tr></tbody>
   </table>

5. Stat row (2-4 boxes):
   <div class="stat-row">
     <div class="stat-box"><div class="stat-number">42%</div><div class="stat-label">metric</div></div>
   </div>

6. Step list:
   <div class="steps">
     <div class="step"><div class="step-n">1</div><div class="step-body"><strong>Action.</strong> Why + how.</div></div>
   </div>

7. Use <mark> 10-20 times to highlight key phrases.
8. Use <code> for technical terms.
9. Use <span class="key-stat"> 3-5 times for important numbers.

## SEO specifics

- Primary keyword MUST appear in: title, first 100 words, one H2, meta description, at least one <mark>.
- URL slug: 3-5 words from title, no stop words, kebab-case.

## FAQ section quality

- Each Q phrased like a real search query.
- 2-4 sentence answers with concrete specifics.
- Mix types: "How to...", "What is...", "Why does...", "When should..."
- Place FAQ at the very end.

Call the publish_article function with the complete article. Do not output prose outside the function call.`;

const KEYWORD_SYSTEM = `You are an SEO keyword researcher. Generate long-tail keyword candidates that a NEW domain can realistically rank for within 3-6 months.

Hard rules:
- Always 4+ words. Pure short-tail rejected.
- Geographic modifiers ("in canada"), year ("in 2026"), problem framings ("how to fix"), comparison framings ("X vs Y"), buying-stage framings ("best X for Y").
- Honest commercial vs informational tagging.
- No invented brands, products, or stats.

Return a single JSON object with the get_keywords function.`;

const ARTICLE_STYLES = `<style>
.sf-article{--sf-accent:#0ea5e9;--sf-accent-dark:#0284c7;--sf-accent-darker:#0369a1;--sf-accent-2:#f59e0b;--sf-accent-2-dark:#b45309;--sf-accent-2-darkest:#451a03;--sf-accent-2-tint:#fffbeb;--sf-accent-2-tint-2:#fef3c7;--sf-accent-2-border:#fcd34d;--sf-accent-3:#22c55e;--sf-accent-3-dark:#15803d;--sf-accent-3-darkest:#14532d;--sf-accent-3-tint:#f0fdf4;--sf-accent-4:#a855f7;--sf-warning:#ef4444;--sf-warning-dark:#b91c1c;--sf-warning-darkest:#7f1d1d;--sf-warning-tint:#fef2f2;--sf-info:#3b82f6;--sf-info-dark:#1d4ed8;--sf-info-darkest:#1e3a8a;--sf-info-tint:#eff6ff;--sf-ink:#0f172a;--sf-text:#1f2937;--sf-muted:#64748b;--sf-muted-2:#94a3b8;--sf-border:#e2e8f0;--sf-surface:#f8fafc;--sf-surface-2:#f1f5f9}
.sf-article{font-size:1.1rem;line-height:1.75;color:var(--sf-text);max-width:780px;margin:0 auto;font-family:-apple-system,system-ui,"Segoe UI",Inter,sans-serif}
.sf-article > p:first-of-type::first-letter{font-size:3.4rem;font-weight:800;float:left;line-height:0.95;padding:0.5rem 0.75rem 0 0;color:var(--sf-accent);font-family:Georgia,serif}
.sf-article p{margin:1rem 0}
.sf-article p:first-of-type{font-size:1.2rem;color:#111;line-height:1.6}
.sf-article strong{font-weight:700;color:var(--sf-ink)}
.sf-article a{color:var(--sf-accent-dark);text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1.5px;font-weight:500}
.sf-article a:hover{color:var(--sf-accent-darker)}
.sf-article ul,.sf-article ol{margin:1rem 0 1rem 1.6rem;padding:0}
.sf-article li{margin:0.4rem 0;padding-left:0.25rem}
.sf-article ul li::marker{color:var(--sf-accent)}
.sf-article ol li::marker{color:var(--sf-accent);font-weight:700}
.sf-article mark{background:linear-gradient(180deg,transparent 55%,#fde047 55%);color:var(--sf-ink);padding:0 0.2em;font-weight:600}
.sf-article code{background:var(--sf-surface-2);color:#be185d;padding:0.15em 0.45em;border-radius:5px;font-size:0.92em;font-family:ui-monospace,Consolas,monospace;border:1px solid var(--sf-border)}
.sf-article hr{border:0;height:32px;margin:3rem 0;background-image:radial-gradient(circle,var(--sf-accent) 1.5px,transparent 1.5px),radial-gradient(circle,var(--sf-accent-2) 1.5px,transparent 1.5px),radial-gradient(circle,var(--sf-accent-3) 1.5px,transparent 1.5px);background-size:8px 8px,8px 8px,8px 8px;background-position:0 50%,16px 50%,32px 50%;background-repeat:no-repeat;background-position:center}
.sf-article h2{font-size:1.95rem;font-weight:800;margin:3.25rem 0 1rem;color:var(--sf-ink);letter-spacing:-0.02em;line-height:1.2;position:relative;padding:0 0 0.65rem 0;border-bottom:3px solid var(--sf-accent)}
.sf-article h2::before{content:"";display:inline-block;width:0.7em;height:0.7em;margin-right:0.55em;background:linear-gradient(135deg,var(--sf-accent),var(--sf-accent-dark));border-radius:4px;vertical-align:middle;transform:rotate(45deg);box-shadow:0 2px 8px color-mix(in srgb,var(--sf-accent) 35%,transparent)}
.sf-article h2:nth-of-type(4n+2){border-bottom-color:var(--sf-accent-2)}
.sf-article h2:nth-of-type(4n+2)::before{background:linear-gradient(135deg,var(--sf-accent-2),var(--sf-accent-2-dark));box-shadow:0 2px 8px color-mix(in srgb,var(--sf-accent-2) 35%,transparent)}
.sf-article h2:nth-of-type(4n+3){border-bottom-color:var(--sf-accent-3)}
.sf-article h2:nth-of-type(4n+3)::before{background:linear-gradient(135deg,var(--sf-accent-3),var(--sf-accent-3-dark));box-shadow:0 2px 8px color-mix(in srgb,var(--sf-accent-3) 35%,transparent)}
.sf-article h2:nth-of-type(4n+4){border-bottom-color:var(--sf-accent-4)}
.sf-article h2:nth-of-type(4n+4)::before{background:linear-gradient(135deg,var(--sf-accent-4),#7e22ce);box-shadow:0 2px 8px color-mix(in srgb,var(--sf-accent-4) 35%,transparent)}
.sf-article h3{font-size:1.32rem;font-weight:700;margin:2rem 0 0.7rem;color:var(--sf-ink);letter-spacing:-0.01em;padding-left:0.85rem;border-left:3px solid var(--sf-accent)}
.sf-article h2 + h3,.sf-article h2 + p + h3{margin-top:1.25rem}
.sf-article h2:nth-of-type(2n+1){background:linear-gradient(180deg,transparent 0%,transparent 70%,color-mix(in srgb,var(--sf-accent) 4%,transparent) 100%)}
.sf-article figure.hero-image{margin:0 0 2.25rem;border-radius:16px;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.08)}
.sf-article figure.hero-image img{border-radius:0;display:block;width:100%;height:auto}
.sf-article figure.hero-image figcaption{font-size:0.75rem;color:var(--sf-muted-2);margin:0.5rem 0.25rem 0;text-align:right}
.sf-article .hero-banner{margin:0 0 2.25rem;padding:2.5rem 2rem;border-radius:16px;background:linear-gradient(135deg,var(--sf-accent) 0%,var(--sf-accent-4) 100%);color:#fff;text-align:center;position:relative;overflow:hidden}
.sf-article .hero-banner::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at top right,rgba(255,255,255,0.25),transparent 60%);pointer-events:none}
.sf-article .hero-banner::after{content:"";position:absolute;bottom:-30px;left:-30px;width:140px;height:140px;background:radial-gradient(circle,color-mix(in srgb,var(--sf-accent-2) 60%,transparent),transparent 70%);pointer-events:none}
.sf-article .hero-banner .eyebrow{position:relative;font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.15em;opacity:0.85;margin-bottom:0.4rem}
.sf-article .hero-banner .lead{position:relative;font-size:1.15rem;line-height:1.4;font-weight:500;max-width:38rem;margin:0 auto}
.sf-article .tldr{background:linear-gradient(135deg,var(--sf-accent-2-tint) 0%,var(--sf-accent-2-tint-2) 100%);border:1px solid var(--sf-accent-2-border);border-radius:14px;padding:1.5rem 1.75rem;margin:2rem 0;box-shadow:0 1px 3px rgba(0,0,0,0.05);position:relative}
.sf-article .tldr::before{content:"\26A1";position:absolute;top:-14px;left:1.5rem;background:var(--sf-accent-2);color:#fff;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;font-size:1.1rem;box-shadow:0 2px 6px color-mix(in srgb,var(--sf-accent-2) 40%,transparent)}
.sf-article .tldr-title{font-weight:800;text-transform:uppercase;font-size:0.78rem;letter-spacing:0.1em;color:var(--sf-accent-2-dark);margin:0.25rem 0 0.65rem;padding-left:2.5rem}
.sf-article .tldr ul{margin:0;padding-left:1.25rem;list-style:none}
.sf-article .tldr li{margin:0.45rem 0;padding-left:1.5rem;position:relative;color:var(--sf-accent-2-darkest)}
.sf-article .tldr li::before{content:"\2192";position:absolute;left:0;color:var(--sf-accent-2);font-weight:700}
.sf-article .callout{position:relative;padding:1.1rem 1.4rem 1.1rem 3.25rem;border-radius:12px;margin:1.75rem 0;font-size:1rem;line-height:1.6;border-left:4px solid;box-shadow:0 1px 2px rgba(0,0,0,0.04)}
.sf-article .callout::before{position:absolute;left:1rem;top:1rem;width:1.4rem;height:1.4rem;border-radius:50%;display:grid;place-items:center;font-size:0.9rem;font-weight:800;color:#fff}
.sf-article .callout strong{display:inline-block;margin-right:0.35rem}
.sf-article .callout-tip{background:var(--sf-info-tint);border-color:var(--sf-info);color:var(--sf-info-darkest)}
.sf-article .callout-tip::before{content:"i";background:var(--sf-info)}
.sf-article .callout-warning{background:var(--sf-warning-tint);border-color:var(--sf-warning);color:var(--sf-warning-darkest)}
.sf-article .callout-warning::before{content:"!";background:var(--sf-warning)}
.sf-article .callout-takeaway{background:var(--sf-accent-3-tint);border-color:var(--sf-accent-3);color:var(--sf-accent-3-darkest)}
.sf-article .callout-takeaway::before{content:"\2605";background:var(--sf-accent-3);font-size:0.75rem}
.sf-article .pull-quote{font-size:1.65rem;font-style:italic;line-height:1.45;border:0;padding:1.75rem 2rem 1.75rem 4rem;margin:2.5rem 0;color:var(--sf-ink);background:linear-gradient(180deg,var(--sf-surface),#fff);border-radius:16px;position:relative;font-family:Georgia,"Times New Roman",serif;font-weight:500;box-shadow:0 1px 3px rgba(0,0,0,0.04);border-left:4px solid var(--sf-accent-4)}
.sf-article .pull-quote::before{content:"\\201C";position:absolute;top:0.5rem;left:1rem;font-size:5rem;color:var(--sf-accent-4);font-family:Georgia,serif;line-height:1;opacity:0.5}
.sf-article table.comparison{width:100%;border-collapse:collapse;margin:2rem 0;font-size:0.97rem;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px var(--sf-border),0 4px 12px rgba(0,0,0,0.04)}
.sf-article table.comparison th{background:linear-gradient(135deg,var(--sf-ink),#1e293b);color:#fff;text-align:left;padding:1rem 1.15rem;font-weight:700;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.06em;border-bottom:3px solid var(--sf-accent)}
.sf-article table.comparison td{padding:1rem 1.15rem;border-bottom:1px solid var(--sf-border);vertical-align:top;color:#1e293b}
.sf-article table.comparison tr:last-child td{border-bottom:0}
.sf-article table.comparison tr:nth-child(even) td{background:var(--sf-surface)}
.sf-article table.comparison tr:hover td{background:var(--sf-accent-2-tint-2)}
.sf-article .stat-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin:2rem 0}
.sf-article .stat-box{padding:1.5rem 1.25rem;background:linear-gradient(180deg,#fff,var(--sf-surface));border:1px solid var(--sf-border);border-radius:14px;text-align:center;border-top:4px solid var(--sf-accent);box-shadow:0 2px 6px rgba(0,0,0,0.04);position:relative;overflow:hidden}
.sf-article .stat-box:nth-child(2){border-top-color:var(--sf-accent-2)}
.sf-article .stat-box:nth-child(3){border-top-color:var(--sf-accent-3)}
.sf-article .stat-box:nth-child(4){border-top-color:var(--sf-accent-4)}
.sf-article .stat-number{font-size:2.5rem;font-weight:800;color:var(--sf-ink);line-height:1;letter-spacing:-0.03em}
.sf-article .stat-label{font-size:0.78rem;color:var(--sf-muted);margin-top:0.55rem;text-transform:uppercase;letter-spacing:0.06em;font-weight:700}
.sf-article .steps{display:flex;flex-direction:column;gap:0.9rem;margin:2rem 0}
.sf-article .step{display:flex;gap:1.25rem;padding:1.25rem 1.5rem;background:linear-gradient(135deg,#fff,#fafafa);border:1px solid var(--sf-border);border-radius:14px;align-items:flex-start;box-shadow:0 1px 3px rgba(0,0,0,0.04);transition:box-shadow 0.15s}
.sf-article .step:hover{box-shadow:0 4px 12px rgba(0,0,0,0.06)}
.sf-article .step-n{flex:0 0 42px;width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--sf-accent),var(--sf-accent-dark));color:#fff;display:grid;place-items:center;font-weight:800;font-size:1.05rem}
.sf-article .step-body{flex:1;line-height:1.6}
.sf-article .step-body strong{display:block;margin-bottom:0.3rem;font-size:1.05rem;color:var(--sf-ink)}
.sf-article .key-stat{display:inline-block;background:linear-gradient(135deg,var(--sf-accent-2-tint-2),#fde68a);padding:0.15em 0.6em;border-radius:6px;font-weight:700;color:#78350f;border:1px solid var(--sf-accent-2-border)}
.sf-article aside.cta{padding:0;margin:2.5rem 0}
.sf-article .author-bio{margin-top:2rem;padding:1.5rem;background:var(--sf-surface);border-radius:14px;border-left:4px solid var(--sf-accent);color:#475569;font-size:0.97rem}
@media (max-width:600px){
  .sf-article{font-size:1rem;line-height:1.65}
  .sf-article h2{font-size:1.45rem}
  .sf-article > p:first-of-type::first-letter{font-size:2.6rem}
  .sf-article .pull-quote{font-size:1.2rem;padding:1.25rem 1.25rem 1.25rem 3rem}
  .sf-article .stat-number{font-size:1.85rem}
  .sf-article .hero-banner{padding:1.75rem 1.25rem}
}
</style>`;

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function stripJsonFence(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) t = t.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  return t;
}

function cost(input: number, output: number, inPerM: number, outPerM: number): number {
  return (input / 1_000_000) * inPerM + (output / 1_000_000) * outPerM;
}

export type GeneratedArticle = {
  title: string;
  slug: string;
  meta_description: string;
  html: string;
  category: string;
  tags: string[];
  faq: { q: string; a: string }[];
  key_takeaway: string;
  word_count: number;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
};

export type SiteContext = {
  name: string;
  niche?: string | null;
  audience?: string | null;
  expertVoice?: string | null;
  authorBioHtml?: string | null;
  ctaHtml?: string | null;
  heroImageHtml?: string | null;
  themeAccent?: string | null;
  themeAccent2?: string | null;
  themeAccent3?: string | null;
  themeAccent4?: string | null;
};

function buildThemeOverride(site: SiteContext): string {
  const a1 = site.themeAccent ?? "", a2 = site.themeAccent2 ?? "", a3 = site.themeAccent3 ?? "", a4 = site.themeAccent4 ?? "";
  if (!a1 && !a2 && !a3 && !a4) return "";
  const lines: string[] = [];
  if (a1) lines.push(`--sf-accent:${a1};--sf-accent-dark:${a1};--sf-accent-darker:${a1}`);
  if (a2) lines.push(`--sf-accent-2:${a2};--sf-accent-2-dark:${a2}`);
  if (a3) lines.push(`--sf-accent-3:${a3};--sf-accent-3-dark:${a3}`);
  if (a4) lines.push(`--sf-accent-4:${a4}`);
  return `<style>.sf-article{${lines.join(";")}}</style>`;
}

function extractAuthorName(b: string | null | undefined, site: string): string {
  if (!b) return `${site} Team`;
  const m = b.match(/<strong[^>]*>(?:Written by\s+)?([^<]+)<\/strong>/i);
  return m ? m[1].replace(/Written by\s+/i, "").trim() : `${site} Team`;
}

function extractAuthorUrl(b: string | null | undefined): string | null {
  if (!b) return null;
  const m = b.match(/<a[^>]+href=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function articleJsonLd(o: { title: string; meta: string; siteName: string; authorBioHtml?: string | null; url?: string | null; publishedAt?: Date }): string {
  const an = extractAuthorName(o.authorBioHtml, o.siteName);
  const au = extractAuthorUrl(o.authorBioHtml);
  const now = (o.publishedAt ?? new Date()).toISOString();
  const author: Record<string, unknown> = { "@type": "Person", name: an };
  if (au) author.url = au;
  const payload: Record<string, unknown> = {
    "@context": "https://schema.org", "@type": "Article",
    headline: o.title, description: o.meta, author,
    publisher: { "@type": "Organization", name: o.siteName },
    datePublished: now, dateModified: now,
  };
  if (o.url) { payload.mainEntityOfPage = { "@type": "WebPage", "@id": o.url }; payload.url = o.url; }
  return `<script type="application/ld+json">${JSON.stringify(payload)}</script>`;
}

function faqJsonLd(faq: { q: string; a: string }[]): string {
  if (!faq?.length) return "";
  const items = faq.filter((f) => f.q && f.a).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }));
  if (!items.length) return "";
  return `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items })}</script>`;
}

const ARTICLE_TOOL = {
  type: "function" as const,
  function: {
    name: "publish_article",
    description: "Publish the generated SEO article with complete metadata.",
    parameters: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Title tag, 50-65 chars, primary keyword near the front." },
        slug: { type: "string", description: "URL slug, 3-5 words, kebab-case, no stop words." },
        meta_description: { type: "string", description: "Meta description, 140-160 chars. Include keyword + soft CTA." },
        html: { type: "string", description: "Full article body as valid HTML (no <html>/<body>). Include TL;DR, callouts, pull-quotes, visual elements, <mark> tags, <span class='key-stat'>, H2/H3 structure, FAQ at end." },
        category: { type: "string", description: "Single broad topic phrase, kebab-case." },
        tags: { type: "array", items: { type: "string" }, description: "4-7 specific topic tags, kebab-case." },
        faq: { type: "array", items: { type: "object", properties: { q: { type: "string" }, a: { type: "string" } }, required: ["q", "a"] }, description: "5-7 FAQ entries with concrete answers." },
        key_takeaway: { type: "string", description: "One sentence (max 160 chars) capturing the single most important insight." },
      },
      required: ["title", "slug", "meta_description", "html", "category", "tags", "faq", "key_takeaway"],
    },
  },
};

export async function generateArticle(keyword: string, intent: string, site: SiteContext, serpContext?: string | null): Promise<GeneratedArticle> {
  const parts: string[] = [`Keyword: ${keyword}`, `Search intent: ${intent}`];
  if (site.niche) parts.push(`Site niche: ${site.niche}`);
  if (site.audience) parts.push(`Target audience: ${site.audience}`);
  if (site.expertVoice) parts.push(`Expert voice:\n${site.expertVoice}`);
  if (serpContext) parts.push(`\n${serpContext}`);

  const client = createLLMClient();
  const resp = await client.chat.completions.create({
    model: resolveModel(ARTICLE_MODEL),
    max_tokens: 8000,
    temperature: 0.7,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: parts.join("\n") }],
    tools: [ARTICLE_TOOL],
    tool_choice: { type: "function", function: { name: "publish_article" } },
  });

  const msg = resp.choices[0]?.message;
  const tc = msg?.tool_calls?.[0];
  let data: Record<string, unknown> = {};

  if (tc?.function?.arguments) {
    try { data = JSON.parse(tc.function.arguments) as Record<string, unknown>; } catch { /* fall through */ }
  }
  if (!data.title && !data.html && msg?.content) {
    try { data = JSON.parse(stripJsonFence(msg.content)) as Record<string, unknown>; } catch { throw new Error(`No tool call and unparseable content: ${msg.content.slice(0, 200)}`); }
  }

  return finalizeArticle(data, site, resp);
}

function finalizeArticle(data: Record<string, unknown>, site: SiteContext, resp: { usage?: { prompt_tokens?: number; completion_tokens?: number } | null }): GeneratedArticle {
  const title = String(data.title ?? "");
  if (!title) throw new Error("Article missing title.");
  const htmlBody = String(data.html ?? "");
  if (!htmlBody) throw new Error("Article missing html.");
  const slug = (typeof data.slug === "string" && data.slug.length > 0) ? data.slug : slugify(title);
  const tags = Array.isArray(data.tags) ? data.tags.map((t) => String(t)) : [];
  const faq = Array.isArray(data.faq) ? data.faq.filter((f) => typeof f === "object" && f !== null).map((f) => ({ q: String((f as Record<string, unknown>).q ?? ""), a: String((f as Record<string, unknown>).a ?? "") })) : [];

  const schema = articleJsonLd({ title, meta: String(data.meta_description ?? ""), siteName: site.name, authorBioHtml: site.authorBioHtml }) + faqJsonLd(faq);
  const bio = site.authorBioHtml?.trim(), cta = site.ctaHtml?.trim(), hero = site.heroImageHtml?.trim();

  let body = hero ? `${hero}\n` : `<div class="hero-banner"><div class="eyebrow">${(site.niche || "Article").toUpperCase()}</div><div class="lead">${String(data.meta_description ?? "").replace(/"/g, "&quot;")}</div></div>\n`;
  body += htmlBody;
  if (cta) body += `\n<hr/>\n<aside class="cta">${cta}</aside>`;
  if (bio) body += `\n<hr/>\n<div class="author-bio">${bio}</div>`;

  const themeOverride = buildThemeOverride(site);
  const html = `${ARTICLE_STYLES}\n${themeOverride}\n<div class="sf-article">\n${body}\n</div>\n${schema}`;

  const plain = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");
  const wc = plain.split(/\s+/).filter(Boolean).length;
  const u = resp.usage;
  const inTok = u?.prompt_tokens ?? 0, outTok = u?.completion_tokens ?? 0;

  return { title, slug, meta_description: String(data.meta_description ?? ""), html, category: String(data.category ?? ""), tags, faq, key_takeaway: String(data.key_takeaway ?? ""), word_count: wc, input_tokens: inTok, output_tokens: outTok, cost_usd: cost(inTok, outTok, ARTICLE_INPUT_PER_M, ARTICLE_OUTPUT_PER_M) };
}

export type Suggestion = { keyword: string; intent: string };

export async function suggestKeywords(seed: string, site: SiteContext, count = 30): Promise<{ keywords: Suggestion[]; cost_usd: number; input_tokens: number; output_tokens: number }> {
  const parts = [`Seed term: ${seed}`, `Generate ${count} long-tail keyword candidates.`];
  if (site.niche) parts.push(`Site niche: ${site.niche}`);
  if (site.audience) parts.push(`Target audience: ${site.audience}`);

  const client = createLLMClient();
  const resp = await client.chat.completions.create({
    model: resolveModel(KEYWORD_MODEL),
    max_tokens: 2500,
    temperature: 0.7,
    messages: [{ role: "system", content: KEYWORD_SYSTEM }, { role: "user", content: parts.join("\n") }],
    response_format: { type: "json_object" },
  });

  const text = resp.choices[0]?.message?.content ?? "";
  const data = JSON.parse(stripJsonFence(text)) as { keywords?: Suggestion[] };
  const items = (data.keywords ?? []).map((k) => ({ keyword: (k.keyword ?? "").trim(), intent: (k.intent ?? "informational").toLowerCase() })).filter((k) => k.keyword.length > 0 && k.keyword.split(/\s+/).length >= 3);

  const u = resp.usage;
  const inTok = u?.prompt_tokens ?? 0, outTok = u?.completion_tokens ?? 0;
  return { keywords: items, input_tokens: inTok, output_tokens: outTok, cost_usd: cost(inTok, outTok, KEYWORD_INPUT_PER_M, KEYWORD_OUTPUT_PER_M) };
}
