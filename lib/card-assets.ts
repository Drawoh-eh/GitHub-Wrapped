import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import unicode from "@fontsource/noto-sans-sc/unicode.json";
import { COPY, personaText, type Locale } from "./presentation";
import type { WrappedStats } from "./types";

const fontFiles = new Map<string, Promise<Buffer>>();
function covers(ranges: string, points: number[]) {
  return ranges.split(",").some(range => {
    const [start, end] = range.trim().replace(/^U\+/i, "").split("-").map(x => parseInt(x, 16));
    return points.some(point => point >= start && point <= (end ?? start));
  });
}
export async function cardFonts(stats: WrappedStats, lang: Locale) {
  const c = COPY[lang];
  const text = [stats.displayName, stats.username, stats.topRepository?.name, personaText(stats, lang), c.cardTitle1, c.cardTitle2, c.commits, c.repos, c.streak, c.codeSpeaks, c.codeBytes, c.partialShort, c.biggest, c.emptyMonth, c.sampleData, c.thru, c.titleLabel, c.topRepo, c.noRepo, "月个天"].join("");
  const points = [...new Set(Array.from(text).map(ch => ch.codePointAt(0)!).filter(point => point > 255))];
  const subsets = ["latin", ...Object.entries(unicode).filter(([key, range]) => key !== "latin" && covers(range, points)).map(([key]) => key.replace(/[\[\]]/g, ""))];
  const families = subsets.map((_, i) => `WrappedFont${i}`);
  const fonts = await Promise.all(subsets.flatMap((subset, i) => ([400, 700] as const).map(async weight => {
    const file = `noto-sans-sc-${subset}-${weight}-normal.woff`;
    if (!fontFiles.has(file)) fontFiles.set(file, readFile(join(process.cwd(), "node_modules/@fontsource/noto-sans-sc/files", file)));
    return { name: families[i], data: await fontFiles.get(file)!, weight, style: "normal" as const };
  })));
  return { fonts, fontFamily: families.join(", ") };
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
