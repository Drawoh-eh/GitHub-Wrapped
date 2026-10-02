import { ImageResponse } from "next/og";
import { getWrapped } from "@/lib/github";
import { parseInput } from "@/lib/input";
import { errorResponse } from "@/lib/http";
import { parsePresentation } from "@/lib/presentation";
import { cardFonts, cardAvatar } from "@/lib/card-assets";
import { WrappedCard } from "@/components/WrappedCard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const { username, year } = parseInput(params.get("username"), params.get("year"));
    const stats = await getWrapped(username, year, params.get("demo") === "1");
    const { theme, lang } = parsePresentation(params.get("theme"), params.get("lang"));
    const [font, avatar] = await Promise.all([cardFonts(stats, lang), cardAvatar(stats.avatarUrl)]);
    const response = new ImageResponse(<WrappedCard stats={stats} theme={theme} lang={lang} avatar={avatar} fontFamily={font.fontFamily} />, {
      width: 1080, height: 1350, fonts: font.fonts,
      headers: { "Cache-Control": "no-store", ...(params.get("download") === "1" ? { "Content-Disposition": `attachment; filename="github-wrapped-${stats.username}-${year}-${theme}-${lang}${stats.isDemo ? "-demo" : ""}.png"` } : {}) },
    });
    return new Response(await response.arrayBuffer(), { headers: response.headers });
  } catch (error) { console.error("Card rendering failed:", error instanceof Error ? error.message : "Unknown error"); return errorResponse(error); }
}
