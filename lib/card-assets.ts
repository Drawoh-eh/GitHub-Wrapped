import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import unicode from "@fontsource/noto-sans-sc/unicode.json";
import type { WrappedStats } from "./types";

const fontFiles = new Map<string, Promise<Buffer>>();
function covers(ranges: string, points: number[]) {
  return ranges.split(",").some(range => {
    const [start, end] = range.trim().replace(/^U\+/i, "").split("-").map(x => parseInt(x, 16));
    return points.some(point => point >= start && point <= (end ?? start));
  });
}
async function loadFont(family: string, file: string, weight: 400 | 700, style: "normal" | "italic" = "normal") {
  const path = join(process.cwd(), "node_modules/@fontsource", file);
  if (!fontFiles.has(path)) fontFiles.set(path, readFile(path));
  return { name: family, data: await fontFiles.get(path)!, weight, style };
}
export async function cardFonts(stats: WrappedStats) {
  // Arial-compatible body, serif italic accent, and a separate sans-serif label face.
  const text = stats.displayName;
  const points = [...new Set(Array.from(text).map(ch => ch.codePointAt(0)!).filter(point => point > 255))];
  const subsets = Object.entries(unicode).filter(([key, range]) => key !== "latin" && covers(range, points)).map(([key]) => key.replace(/[\[\]]/g, ""));
  const fallbackFamilies = subsets.map((_, i) => `WrappedFallback${i}`);
  const fonts = await Promise.all([
    ...([400, 700] as const).flatMap(weight => ["latin", "latin-ext"].map(subset => loadFont("WrappedSans", `arimo/files/arimo-${subset}-${weight}-normal.woff`, weight))),
    loadFont("WrappedLabel", "noto-sans-sc/files/noto-sans-sc-latin-700-normal.woff", 700),
    loadFont("WrappedSerif", "libre-baskerville/files/libre-baskerville-latin-400-italic.woff", 400, "italic"),
    ...subsets.flatMap((subset, i) => ([400, 700] as const).map(weight => loadFont(fallbackFamilies[i], `noto-sans-sc/files/noto-sans-sc-${subset}-${weight}-normal.woff`, weight))),
  ]);
  return { fonts, fontFamily: ["WrappedSans", ...fallbackFamilies].join(", "), labelFontFamily: "WrappedLabel", serifFontFamily: "WrappedSerif" };
}
export async function cardAvatar(raw: string | null) {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.hostname !== "avatars.githubusercontent.com") return null;
    const response = await fetch(url, { signal: AbortSignal.timeout(3000), redirect: "error", next: { revalidate: 86400 } });
    const type = response.headers.get("content-type")?.split(";")[0];
    if (!response.ok || !type || !["image/png", "image/jpeg", "image/webp"].includes(type)) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    return bytes.length <= 250000 ? `data:${type};base64,${bytes.toString("base64")}` : null;
  } catch { return null; }
}
