"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type ScoredArticle = {
  id: number;
  title: string;
  wpUrl: string | null;
  score: number;
  grade: string;
  passed: number;
  total: number;
  issues: string[];
};

const LOCK_CLASS = "overflow-hidden";

function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    document.documentElement.classList.add(LOCK_CLASS);
    document.body.classList.add(LOCK_CLASS);
    return () => {
      document.documentElement.classList.remove(LOCK_CLASS);
      document.body.classList.remove(LOCK_CLASS);
    };
  }, [locked]);
}

function gradeColor(grade: string) {
  if (grade === "A") return { bg: "rgba(34,197,94,0.2)", fg: "#22c55e" };
  if (grade === "B") return { bg: "rgba(14,165,233,0.2)", fg: "#0ea5e9" };
  if (grade === "C") return { bg: "rgba(245,158,11,0.2)", fg: "#f59e0b" };
  return { bg: "rgba(239,68,68,0.2)", fg: "#ef4444" };
}

/**
 * Modal showing the top-scoring published articles for a site. Pulls scored
 * data from /api/site-scores. Locks body scroll, traps Escape, closes on
 * backdrop click. Uses a ref-based fetch guard to prevent duplicate requests.
 */
export function TopScoresModal({ siteId, siteName }: { siteId: number; siteName: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ScoredArticle[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);
  const fetchedForRef = useRef<number | null>(null);

  useBodyScrollLock(open);

  const fetchScores = useCallback(async () => {
    if (fetchingRef.current) return;
    if (fetchedForRef.current === siteId && items !== null) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/site-scores?siteId=${siteId}`, { cache: "no-store" });
      if (!r.ok) throw new Error(await r.text().catch(() => `HTTP ${r.status}`));
      const j = (await r.json()) as { articles: ScoredArticle[] };
      setItems(j.articles);
      fetchedForRef.current = siteId;
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed to load");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [siteId, items]);

  useEffect(() => {
    if (!open) return;
    fetchScores();
  }, [open, fetchScores]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3.5 py-2 bg-surface border border-border-strong rounded-lg text-sm font-semibold text-text hover:bg-surface-2 transition-colors"
      >
        🏆 Top scores →
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`Top scoring articles for ${siteName}`}
        >
          <div
            className="bg-bg border border-border rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-baseline justify-between p-5 border-b border-border shrink-0">
              <div>
                <div className="text-[0.65rem] font-extrabold uppercase tracking-wider text-accent mb-0.5">
                  Top scoring articles
                </div>
                <h2 className="text-xl font-extrabold text-text">{siteName}</h2>
              </div>
              <button
                onClick={close}
                className="text-muted hover:text-text text-2xl leading-none px-2"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {loading ? (
                <div className="text-muted text-sm text-center py-12">Scoring articles…</div>
              ) : error ? (
                <div className="bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              ) : items && items.length === 0 ? (
                <div className="text-muted text-sm text-center py-12">
                  No published articles yet. Run a few first.
                </div>
              ) : items ? (
                <div className="space-y-3">
                  {items.map((a, i) => {
                    const c = gradeColor(a.grade);
                    return (
                      <div
                        key={a.id}
                        className="flex items-start gap-4 p-4 bg-card-grad border border-border rounded-xl"
                      >
                        <div className="shrink-0 text-center">
                          <div
                            className="w-14 h-14 rounded-xl grid place-items-center text-2xl font-extrabold"
                            style={{ background: c.bg, color: c.fg }}
                          >
                            {a.grade}
                          </div>
                          <div className="text-muted text-[0.65rem] mt-1 font-bold uppercase tracking-wider">
                            #{i + 1}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2 mb-1">
                            <div className="font-bold text-text text-sm truncate">{a.title}</div>
                            <div className="text-accent font-bold text-sm shrink-0">{a.score}/100</div>
                          </div>
                          <div className="text-muted text-xs mb-2">
                            {a.passed}/{a.total} on-page checks passed
                          </div>
                          {a.issues.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {a.issues.slice(0, 4).map((issue, j) => (
                                <span
                                  key={j}
                                  className="text-[0.65rem] px-2 py-0.5 bg-surface-2 border border-border rounded text-muted"
                                >
                                  {issue}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-accent text-xs font-semibold">✓ All checks passed</span>
                          )}
                          {a.wpUrl ? (
                            <a
                              href={a.wpUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block mt-2 text-accent text-xs font-semibold hover:underline"
                            >
                              View live →
                            </a>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-surface-2 flex items-center justify-between shrink-0">
              <span className="text-muted text-xs">
                Scored on weighted on-page SEO checks. Updated live.
              </span>
              <a
                href={`/sites/${siteId}/analysis`}
                className="text-accent text-xs font-bold hover:underline no-underline"
              >
                Full analysis →
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
