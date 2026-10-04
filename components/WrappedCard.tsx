import type { ContributionDay, WrappedStats } from "@/lib/types";
import { COPY, THEMES, heroQuote, type Theme } from "@/lib/presentation";
import { SITE_URL } from "@/lib/links";
import { annualCalendarWeeks, contributionIntensity } from "@/lib/calendar";

function gridColor(day: ContributionDay | null, ink: string) {
  if (!day) return "transparent";
  return `${ink}${["12", "2f", "50", "7f", "b8"][contributionIntensity(day)]}`;
}

function ContributionBand({ stats, ink }: { stats: WrappedStats; ink: string }) {
  const weeks = annualCalendarWeeks(stats.days, stats.year);
  return <div style={{ display: "flex", justifyContent: "center", gap: 5, opacity: .68 }}>
    {weeks.map((week, weekIndex) => <div key={weekIndex} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {week.map((day, dayIndex) => <span key={day?.date ?? `${weekIndex}-${dayIndex}`} style={{ width: 12, height: 12, borderRadius: 2, background: gridColor(day, ink) }} />)}
    </div>)}
  </div>;
}

export function WrappedCard({ stats, theme = "lime", avatar = stats.avatarUrl, fontFamily = "Arimo, Noto Sans SC, sans-serif", labelFontFamily = "Noto Sans SC, sans-serif" }: {
  stats: WrappedStats; theme?: Theme; avatar?: string | null; fontFamily?: string; labelFontFamily?: string; serifFontFamily?: string;
}) {
  const c = COPY, t = THEMES[theme];
  const quote = heroQuote(stats);
  const name = Array.from(stats.displayName).slice(0, 28).join("");
  const mainQuest = stats.topRepositories[0];
  const fullRepo = mainQuest?.name ?? c.noRepo;
  const repo = fullRepo.length > 38 ? fullRepo.slice(0, 35) + "…" : fullRepo;
  const topLanguage = stats.languages[0];
  const tagCategory = { stack: "STACK", habit: "RHYTHM", achievement: "ACHIEVEMENT" } as const;
  const languagePalette = theme === "mono"
    ? [t.ink, `${t.ink}b0`, `${t.ink}78`, `${t.ink}42`]
    : [t.ink, t.accent, `${t.ink}88`, `${t.accent}99`];

  return <div style={{
    width: 1080, height: 1350, display: "flex", flexDirection: "column",
    background: t.bg, color: t.ink, padding: "54px 66px 44px", overflow: "hidden",
    fontFamily, lineHeight: 1.1, flexShrink: 0, position: "relative",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: labelFontFamily }}>
      <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: 2 }}>GITHUB WRAPPED®</span>
      <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>{stats.isDemo ? "DEMO / " : ""}{stats.year}</span>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 15, marginTop: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, background: t.ink, color: t.bg, borderRadius: 28, overflow: "hidden", position: "relative", flexShrink: 0, fontSize: 25, fontWeight: 700 }}>
        <span>{name.slice(0, 1).toUpperCase()}</span>
        {avatar && <img src={avatar} alt="" width={56} height={56} style={{ position: "absolute", width: 56, height: 56, objectFit: "cover" }} />}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0 }}>
        <span style={{ fontSize: name.length > 20 ? 23 : 27, fontWeight: 700 }}>{name}</span>
        <span style={{ fontSize: 18, opacity: .58 }}>@{stats.username}</span>
      </div>
    </div>

    <div style={{ display: "flex", flexDirection: "column", marginTop: 46 }}>
      <span style={{ fontSize: 84, fontWeight: 700, letterSpacing: -5, lineHeight: .96 }}>{quote.line1}</span>
      <span style={{ fontSize: 84, fontWeight: 700, letterSpacing: -5, lineHeight: .96 }}>{quote.line2}</span>
    </div>

    <div style={{ display: "flex", flexDirection: "column", marginTop: 44 }}>
      <span style={{ fontSize: stats.commits >= 1000000 ? 146 : 180, fontWeight: 700, lineHeight: .86, letterSpacing: -9 }}>{stats.commits.toLocaleString("en-US")}</span>
      <span style={{ fontSize: 25, fontWeight: 700, letterSpacing: 1.6, marginTop: 14 }}>COMMIT CONTRIBUTIONS</span>
    </div>

    <div style={{ display: "flex", marginTop: 40, padding: "20px 0 21px" }}>
      {stats.personalityTags.map((tag, index) => <div key={tag.category} style={{
        display: "flex", flexDirection: "column", minWidth: 0, flex: 1,
        paddingLeft: index === 0 ? 0 : 22, paddingRight: index === stats.personalityTags.length - 1 ? 0 : 22,
        borderLeft: index === 0 ? "none" : `1px solid ${t.ink}2f`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: 4, background: index === 0 ? t.accent : t.ink, opacity: index === 0 ? 1 : .45 }} />
          <span style={{ fontSize: 11, letterSpacing: 1.8, opacity: .5, fontFamily: labelFontFamily }}>{tagCategory[tag.category]}</span>
        </div>
        <span style={{ fontSize: tag.label.length > 17 ? 20 : 23, fontWeight: 700, lineHeight: 1.04, marginTop: 12 }}>{tag.label}</span>
      </div>)}
    </div>

    <div style={{ display: "flex", gap: 22, marginTop: 42 }}>
      <div style={{ display: "flex", flexDirection: "column", width: "44%", borderTop: `2px solid ${t.ink}38`, paddingTop: 20 }}>
        <span style={{ fontSize: 14, letterSpacing: 2, opacity: .55, fontFamily: labelFontFamily }}>TOP LANGUAGE</span>
        {topLanguage ? <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: topLanguage.name.length > 14 ? 38 : 52, fontWeight: 700, letterSpacing: -2, marginTop: 10 }}>{topLanguage.name}</span>
          <span style={{ fontSize: 40, fontWeight: 700, marginTop: 2 }}>{Math.round(topLanguage.percentage)}%</span>
          <div style={{ display: "flex", width: "100%", height: 8, borderRadius: 4, overflow: "hidden", marginTop: 14, background: `${t.ink}18` }}>
            {stats.languages.map((language, index) => <span key={language.name} style={{ display: "flex", width: `${language.percentage}%`, height: "100%", background: languagePalette[index % languagePalette.length] }} />)}
          </div>
        </div> : <span style={{ fontSize: 25, marginTop: 14, opacity: .62 }}>NO DATA</span>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", width: "56%", borderTop: `2px solid ${t.ink}38`, paddingTop: 20 }}>
        <span style={{ fontSize: 14, letterSpacing: 2, opacity: .55, fontFamily: labelFontFamily }}>MAIN QUEST</span>
        <span style={{ fontSize: repo.length > 30 ? 29 : 36, fontWeight: 700, marginTop: 10, lineHeight: 1.06 }}>{repo}</span>
        <span style={{ fontSize: 16, marginTop: 12, opacity: .6 }}>{mainQuest ? `${mainQuest.commits.toLocaleString("en-US")} commits` : "No public repository"}</span>
      </div>
    </div>

    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 190, marginTop: 34, borderTop: `2px solid ${t.ink}24`, borderBottom: `2px solid ${t.ink}24` }}>
      <ContributionBand stats={stats} ink={t.ink} />
    </div>

    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "auto", paddingTop: 22 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: 1.3 }}>EVERY LITTLE PUSH ADDS UP.</span>
        <span style={{ fontSize: 13, opacity: .55 }}>{new URL(SITE_URL).host}</span>
      </div>
      <span style={{ fontSize: 13, opacity: .55 }}>{stats.isDemo ? c.sampleData : `${c.thru} ${stats.through}`}</span>
    </div>
  </div>;
}
