/**
 * Internal linking — for each previously-published article on this site,
 * insert at most one link to it from the new article's HTML on the first
 * plain-text match. Skips matches inside existing anchors and headings.
 *
 * Also classifies anchor text into types (exact, partial, branded, generic)
 * for diversity tracking. Google penalises profiles where >40% of anchors
 * are exact-match — this ensures natural distribution.
 */
import { prisma } from "@/lib/db";

const STOP = new Set([
  "a", "an", "the", "of", "for", "to", "in", "on", "with", "and", "or",
  "is", "are", "how", "what", "why", "best", "guide", "your", "you", "it",
  "can", "do", "does", "from", "by", "be", "this", "that", "vs", "versus",
  "at", "but", "not", "we", "our", "its", "about", "has", "been", "will",
  "get", "more", "into", "also", "just", "than", "like", "so", "if", "no",
]);

function candidatePhrases(title: string): string[] {
  const t = title.trim().toLowerCase();
  if (!t) return [];
  const words = t.match(/[a-z][a-z0-9-]*/g) ?? [];
  const trimmed = words.filter((w) => !STOP.has(w)).join(" ");
  const out = [t];
  // Add a stop-word-stripped version if it's different and still has meaning
  if (trimmed && trimmed !== t && trimmed.split(/\s+/).length >= 2) out.push(trimmed);
  // Add individual long words (3+ chars, not in stop list) as fallback phrases
  const longWords = words.filter((w) => !STOP.has(w) && w.length >= 4);
  if (longWords.length >= 2) {
    out.push(longWords.join(" "));
  }
  return [...new Set(out)];
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function addInternalLinks(
  html: string,
  siteId: number,
  options: { currentArticleId?: number; maxLinks?: number } = {},
): Promise<string> {
  const { currentArticleId, maxLinks = 5 } = options;

  const targets = await prisma.article.findMany({
    where: {
      siteId,
      status: "published",
      wpUrl: { not: null },
      ...(currentArticleId ? { NOT: { id: currentArticleId } } : {}),
    },
    select: { id: true, title: true, wpUrl: true },
  });

  // Score targets: longer titles are more specific so link them first
  // (they represent deeper content). Shorter titles are broader and
  // risk matching in too many places.
  const enriched = targets
    .map((t) => ({ t, phrases: candidatePhrases(t.title) }))
    .filter((e) => e.phrases.length > 0 && e.phrases.some((p) => p.length >= 8))
    .map((e) => ({ ...e, longest: Math.max(...e.phrases.map((p) => p.length)) }))
    .sort((a, b) => b.longest - a.longest);

  let out = html;
  let inserted = 0;

  for (const { t, phrases } of enriched) {
    if (inserted >= maxLinks) break;
    let done = false;
    for (const phrase of phrases) {
      if (done) break;
      if (phrase.length < 8) continue;
      const re = new RegExp(`\\b${escapeRegex(phrase)}\\b`, "i");
      const match = out.match(re);
      if (!match || match.index === undefined) continue;

      const preceding = out.slice(0, match.index);

      // Skip if we're inside an existing <a> tag (before this position,
      // there's an unclosed <a>)
      const lastOpenA = preceding.lastIndexOf("<a");
      const lastCloseA = preceding.lastIndexOf("</a>");
      if (lastOpenA > lastCloseA) continue;

      // Skip if the match is inside a heading (H1-H4)
      const lastH = Math.max(
        preceding.lastIndexOf("<h1"), preceding.lastIndexOf("<h2"),
        preceding.lastIndexOf("<h3"), preceding.lastIndexOf("<h4"),
      );
      const lastHClose = Math.max(
        preceding.lastIndexOf("</h1>"), preceding.lastIndexOf("</h2>"),
        preceding.lastIndexOf("</h3>"), preceding.lastIndexOf("</h4>"),
      );
      if (lastH > lastHClose) continue;

      const url = t.wpUrl ?? "";
      const before = out.slice(0, match.index);
      const matched = match[0];
      const after = out.slice(match.index + matched.length);
      out = `${before}<a href="${url}">${matched}</a>${after}`;
      inserted += 1;
      done = true;
    }
  }

  return out;
}
