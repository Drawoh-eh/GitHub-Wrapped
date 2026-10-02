import { ImageResponse } from "next/og";
import { SocialCard } from "@/components/SocialCard";
import { getWrapped } from "@/lib/github";
import { parseInput } from "@/lib/input";
import { parsePresentation } from "@/lib/presentation";
import { socialFonts } from "@/lib/image-fonts";
import type { WrappedStats } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const { theme } = parsePresentation(params.get("theme"));
  let stats: WrappedStats | undefined;
  let failed = false;
  if (params.has("username")) {
    try {
      const input = parseInput(params.get("username"), params.get("year"));
      stats = await getWrapped(input.username, input.year, params.get("demo") === "1");
    } catch { failed = true; } // Keep shared links useful when GitHub is temporarily unavailable.
  }
  const font = await socialFonts();
  const response = new ImageResponse(<SocialCard stats={stats} theme={theme} fontFamily={font.fontFamily} labelFontFamily={font.labelFontFamily} serifFontFamily={font.serifFontFamily} />, {
    width: 1200, height: 630, fonts: font.fonts,
    headers: { "Cache-Control": failed ? "no-store" : "public, max-age=3600" },
  });
  return new Response(await response.arrayBuffer(), { headers: response.headers });
}
