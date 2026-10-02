import type { Metadata } from "next";
import type { WrappedStats } from "./types";
import type { Theme } from "./presentation";
import { SITE_URL, shareUrl } from "./links";

export function socialMetadata(stats?: WrappedStats, theme: Theme = "lime"): Metadata {
  const title = stats ? `${stats.isDemo ? "Demo · " : ""}@${stats.username}’s ${stats.year} GitHub Wrapped` : "GitHub Wrapped — Your year in code";
  const description = stats ? `${stats.isDemo ? "Sample data: " : ""}${stats.commits.toLocaleString("en-US")} commit contributions. ${stats.longestStreak}-day streak. See the year in code and make your own recap.` : "Turn your GitHub year into a story. Explore your commits, languages and streaks, then download a shareable recap.";
  const image = new URL("/api/og", SITE_URL);
  if (stats) {
    image.search = new URLSearchParams({ username: stats.username, year: String(stats.year), theme, ...(stats.isDemo ? { demo: "1" } : {}) }).toString();
  }
  const url = stats ? shareUrl(stats, theme) : SITE_URL;
  const images = [{ url: image.toString(), width: 1200, height: 630, alt: title }];
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, type: "website", siteName: "GitHub Wrapped", url, images }, twitter: { card: "summary_large_image", title, description, images: images.map(image => ({ url: image.url, alt: image.alt })) } };
}
