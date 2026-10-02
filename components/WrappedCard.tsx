import type { WrappedStats } from "@/lib/types";
import { COPY, THEMES, monthName, personaText, type Theme } from "@/lib/presentation";

// One fixed-size composition powers both the responsive preview and PNG export.
export function WrappedCard({ stats, theme = "lime", avatar = stats.avatarUrl, fontFamily = "Arimo, Noto Sans SC, sans-serif", labelFontFamily = "Noto Sans SC, sans-serif", serifFontFamily = "Libre Baskerville, Georgia, serif" }: {
  stats: WrappedStats; theme?: Theme; avatar?: string | null; fontFamily?: string; labelFontFamily?: string; serifFontFamily?: string;
}) {
  const c = COPY, t = THEMES[theme];
  const name = Array.from(stats.displayName).slice(0, 30).join("");
  const fullRepo = stats.topRepository?.name ?? c.noRepo;
  const repo = fullRepo.length > 43 ? fullRepo.slice(0, 40) + "…" : fullRepo;
  return <div style={{ width: 1080, height: 1350, display: "flex", flexDirection: "column", background: t.bg, color: t.ink, padding: "55px 68px", overflow: "hidden", fontFamily, lineHeight: 1.2, flexShrink: 0 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, fontWeight: 700, letterSpacing: 2, fontFamily: labelFontFamily }}><span>GITHUB WRAPPED</span><span>{stats.isDemo ? "DEMO / " : ""}{stats.year}</span></div>
    <div style={{ display: "flex", flexDirection: "column", fontSize: 90, fontWeight: 700, letterSpacing: -5, lineHeight: 1.08, marginTop: 26 }}><span>{c.cardTitle1}</span><span style={{ display: "flex" }}>A lot of <span style={{ fontFamily: serifFontFamily, fontWeight: 400, fontStyle: "italic", marginLeft: 18, letterSpacing: -4 }}>code.</span></span></div>
    <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 25 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 80, height: 80, background: t.ink, color: t.bg, borderRadius: 40, overflow: "hidden", position: "relative", flexShrink: 0, fontSize: 35 }}>
        <span>{name.slice(0, 1).toUpperCase()}</span>{avatar && <img src={avatar} alt="" width={80} height={80} style={{ position: "absolute", width: 80, height: 80, objectFit: "cover" }} />}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ fontSize: name.length > 20 ? 27 : 32, fontWeight: 700 }}>{name}</span><span style={{ fontSize: 23 }}>@{stats.username}</span></div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", marginTop: 22 }}><span style={{ fontSize: stats.commits >= 1000000 ? 130 : 148, fontWeight: 700, lineHeight: 1, letterSpacing: -8 }}>{stats.commits.toLocaleString("en-US")}</span><span style={{ fontSize: 27, marginTop: 9 }}>{c.commits}</span></div>
    <div style={{ display: "flex", borderTop: `2px solid ${t.ink}40`, borderBottom: `2px solid ${t.ink}40`, padding: "17px 0", marginTop: 22, gap: 110 }}>
      <div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1 }}>{stats.repositories}</span><span style={{ fontSize: 24, marginTop: 6 }}>{c.repos}</span></div>
      <div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1 }}>{stats.longestStreak}d</span><span style={{ fontSize: 24, marginTop: 6 }}>{c.streak}</span></div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", marginTop: 22 }}>
      <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1, fontFamily: labelFontFamily }}>{c.codeSpeaks}</span>
      <div style={{ display: "flex", width: "100%", height: 19, borderRadius: 10, overflow: "hidden", marginTop: 12, background: `${t.ink}20` }}>{stats.languages.map(language => <div key={language.name} style={{ display: "flex", width: `${language.percentage}%`, height: "100%", background: language.color }} />)}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, fontSize: 23, marginTop: 12 }}>{stats.languages.slice(0, 3).map(language => <span key={language.name}>{language.name} {Math.round(language.percentage)}%</span>)}{stats.languages.length === 0 && <span>{c.languageEmpty}</span>}</div>
      <span style={{ fontSize: 17, marginTop: 10 }}>{c.codeBytes}{stats.languagesIncomplete ? ` · ${c.partialShort}` : ""}</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 22 }}><span style={{ fontSize: 20, fontFamily: labelFontFamily }}>{c.titleLabel}</span><span style={{ fontSize: 24, fontWeight: 700, border: `2px solid ${t.ink}50`, borderRadius: 30, padding: "8px 18px" }}>{personaText(stats)}</span></div>
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 16 }}><span style={{ fontSize: 18, fontFamily: labelFontFamily }}>{c.topRepo}</span><span style={{ fontSize: 24, fontWeight: 700 }}>{repo}</span></div>
    <div style={{ display: "flex", flexDirection: "column", background: t.panel, color: t.panelText, borderRadius: 16, padding: "19px 30px", marginTop: "auto" }}><span style={{ fontSize: 20, letterSpacing: 1, fontFamily: labelFontFamily }}>{c.biggest}</span><div style={{ display: "flex", justifyContent: "space-between", fontSize: 49, fontWeight: 700, marginTop: 6 }}><span>{monthName(stats.mostProductiveMonth?.name)}</span><svg width="52" height="52" viewBox="0 0 52 52" style={{ color: t.accent }}><path d="M9 43L43 9M15 9H43V37" fill="none" stroke={t.accent} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg></div></div>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, fontSize: 18 }}><span>github-wrapped · {stats.year}</span><span>{stats.isDemo ? c.sampleData : `${c.thru} ${stats.through}`}</span></div>
  </div>;
}
