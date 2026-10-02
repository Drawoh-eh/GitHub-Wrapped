import type { WrappedStats } from "./types";
import type { Theme, Locale } from "./presentation";

// Always use the public production origin, never a preview host or forwarded header.
export const SITE_URL = "https://git-hub-wrapped-chi.vercel.app";
export function recapPath(stats: Pick<WrappedStats, "username" | "year" | "isDemo">, theme: Theme, lang: Locale) {
  const query = new URLSearchParams({ year: String(stats.year), theme, lang });
  if (stats.isDemo) query.set("demo", "1");
  return `/wrapped/${encodeURIComponent(stats.username)}?${query}`;
}
export function shareUrl(stats: Pick<WrappedStats, "username" | "year" | "isDemo">, theme: Theme, lang: Locale) {
  return SITE_URL + recapPath(stats, theme, lang);
}
