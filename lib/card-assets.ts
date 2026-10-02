import "server-only";
import { join } from "node:path";
import unicode from "@fontsource/noto-sans-sc/unicode.json";
import { fontData, socialFonts } from "./image-fonts";
import { nicknameFonts } from "./nickname-fonts";
import type { WrappedStats } from "./types";

function covers(ranges: string, points: number[]) {
  return ranges.split(",").some(range => {
    const [start, end] = range.trim().replace(/^U\+/i, "").split("-").map(x => parseInt(x, 16));
    return points.some(point => point >= start && point <= (end ?? start));
  });
}
export async function cardFonts(stats: WrappedStats) {
  // Arial-compatible body, serif italic accent, and a separate sans-serif label face.
  const text = stats.displayName;
  const points = [...new Set(Array.from(text).map(ch => ch.codePointAt(0)!).filter(point => point > 255))];
  const subsets = Object.entries(unicode).filter(([key, range]) => key !== "latin" && covers(range, points)).map(([key]) => key.replace(/[\[\]]/g, ""));
  const fallbackFamilies = subsets.map((_, i) => `WrappedFallback${i}`);
  const [base, extended, fallback] = await Promise.all([
    socialFonts(),
    Promise.all([
      fontData(join(process.cwd(), "node_modules/@fontsource/arimo/files/arimo-latin-ext-400-normal.woff")),
      fontData(join(process.cwd(), "node_modules/@fontsource/arimo/files/arimo-latin-ext-700-normal.woff")),
    ]),
    Promise.all(subsets.map(async (subset, i) => {
      const data = await nicknameFonts[subset]();
      return ([400, 700] as const).map((weight, index) => ({ name: fallbackFamilies[i], weight, style: "normal" as const, data: data[index] }));
    })).then(fonts => fonts.flat()),
  ]);
  // Satori selects one font per family/weight, so disjoint subsets need distinct names.
  return { ...base, fonts: [...base.fonts, ...extended.map((data, i) => ({ name: "WrappedSansExtended", data, weight: i === 0 ? 400 as const : 700 as const, style: "normal" as const })), ...fallback], fontFamily: ["WrappedSans", "WrappedSansExtended", ...fallbackFamilies].join(", ") };
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
