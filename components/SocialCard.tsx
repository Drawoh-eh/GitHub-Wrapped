import type { WrappedStats } from "@/lib/types";
import { THEMES, type Theme } from "@/lib/presentation";
import { SITE_URL } from "@/lib/links";

export function SocialCard({ stats, theme, fontFamily, labelFontFamily, serifFontFamily }: { stats?: WrappedStats; theme: Theme; fontFamily: string; labelFontFamily: string; serifFontFamily: string }) {
  const t = THEMES[theme];
  return <div style={{ width: 1200, height: 630, display: "flex", flexDirection: "column", padding: "48px 60px", background: t.bg, color: t.ink, fontFamily }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, fontWeight: 700, letterSpacing: 2, fontFamily: labelFontFamily }}><span>GITHUB WRAPPED</span><span>{stats ? `${stats.isDemo ? "DEMO / " : ""}${stats.year}` : "YOUR YEAR IN CODE"}</span></div>
    <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 42 }}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <span style={{ fontSize: 72, fontWeight: 700, letterSpacing: -3 }}>A year.</span>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700, letterSpacing: -3 }}>A lot of <span style={{ fontFamily: serifFontFamily, fontStyle: "italic", fontWeight: 400, marginLeft: 16 }}>code.</span></div>
        <span style={{ marginTop: 26, fontSize: stats && stats.username.length > 25 ? 23 : 30 }}>{stats ? `@${stats.username}` : "Your story. One shareable card."}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", width: 390, padding: 32, borderRadius: 24, background: t.panel, color: t.panelText }}>
        <span style={{ fontSize: stats ? 72 : 40, fontWeight: 700 }}>{stats ? stats.commits.toLocaleString("en-US") : "Make it yours."}</span>
        <span style={{ fontSize: 22, marginTop: 8 }}>{stats ? "commit contributions" : "Commits. Languages. Streaks."}</span>
        <span style={{ fontSize: 26, marginTop: 30 }}>{stats ? `${stats.longestStreak}-day streak` : "No sign-up needed."}</span>
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 19 }}><span>{new URL(SITE_URL).host}</span><span>{stats?.isDemo ? "SAMPLE DATA" : stats ? `THROUGH ${stats.through}` : "MAKE YOUR WRAPPED"}</span></div>
  </div>;
}
