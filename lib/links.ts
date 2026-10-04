import type { WrappedStats } from "./types";
import type { Theme } from "./presentation";

// Always use the public production origin, never a preview host or forwarded header.
export function resolveSiteUrl(configured?: string) {
  const url = new URL(configured?.trim() || "https://git-hub-wrapped-chi.vercel.app");
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a public HTTPS origin without a path, query or credentials.");
  }
  return url.origin;
}
export const SITE_URL = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
export function recapPath(stats: Pick<WrappedStats, "username" | "year" | "isDemo">, theme: Theme) {
  const query = new URLSearchParams({ year: String(stats.year), theme });
  if (stats.isDemo) query.set("demo", "1");
  return `/wrapped/${encodeURIComponent(stats.username)}?${query}`;
}
export function shareUrl(stats: Pick<WrappedStats, "username" | "year" | "isDemo">, theme: Theme) {
  return SITE_URL + recapPath(stats, theme);
}
