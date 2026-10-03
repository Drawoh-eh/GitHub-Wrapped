import type { ContributionDay, WrappedStats } from "@/lib/types";
import { COPY, THEMES, heroQuote, type Theme } from "@/lib/presentation";
import { SITE_URL } from "@/lib/links";

function gridColor(day: ContributionDay | null, ink: string) {
  if (!day || day.contributionCount <= 0) return `${ink}12`;
  if (day.contributionLevel === "FOURTH_QUARTILE" || day.contributionCount >= 7) return `${ink}b8`;
  if (day.contributionLevel === "THIRD_QUARTILE" || day.contributionCount >= 4) return `${ink}7f`;
  if (day.contributionLevel === "SECOND_QUARTILE" || day.contributionCount >= 2) return `${ink}50`;
  return `${ink}2f`;
}

function MiniContributionGrid({ stats, ink }: { stats: WrappedStats; ink: string }) {
  const recent = stats.days.slice(-84);
  const padded: (ContributionDay | null)[] = [
    ...Array(Math.max(0, 84 - recent.length)).fill(null),
    ...recent,
  ];
  const weeks = Array.from({ length: 12 }, (_, index) => padded.slice(index * 7, index * 7 + 7));
  return <div style={{ display: "flex", gap: 8, opacity: .72 }}>
    {weeks.map((week, weekIndex) => <div key={weekIndex} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {week.map((day, dayIndex) => <span key={day?.date ?? `${weekIndex}-${dayIndex}`} style={{ width: 14, height: 14, borderRadius: 2, background: gridColor(day, ink) }} />)}
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
  const tagTransforms = ["rotate(-2deg)", "rotate(2deg)", "rotate(-1deg)"];

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

    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 34, marginTop: 46 }}>
      <div style={{ display: "flex", flexDirection: "column", width: 610, position: "relative", zIndex: 2 }}>
        <span style={{ fontSize: 82, fontWeight: 700, letterSpacing: -4.8, lineHeight: .96 }}>{quote.line1}</span>
        <span style={{ fontSize: 82, fontWeight: 700, letterSpacing: -4.8, lineHeight: .96 }}>{quote.line2}</span>
      </div>
      <div style={{ display: "flex", width: 270, justifyContent: "flex-end", paddingTop: 8 }}>
        <MiniContributionGrid stats={stats} ink={t.ink} />
      </div>
    </div>

    <div style={{ display: "flex", flexDirection: "column", position: "relative", marginTop: 46, minHeight: 250 }}>
      <span style={{ position: "absolute", right: 2, top: -36, fontSize: 196, fontWeight: 700, letterSpacing: -10, opacity: .06 }}>PUSH</span>
      <span style={{ fontSize: stats.commits >= 1000000 ? 142 : 176, fontWeight: 700, lineHeight: .88, letterSpacing: -9, position: "relative", zIndex: 2 }}>{stats.commits.toLocaleString("en-US")}</span>
      <span style={{ fontSize: 25, fontWeight: 700, letterSpacing: 1.6, marginTop: 13, position: "relative", zIndex: 2 }}>COMMIT CONTRIBUTIONS</span>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 15, minHeight: 64, marginTop: 20 }}>
      {stats.personalityTags.map((tag, index) => {
        const filled = index === 0;
        return <span key={tag.category} style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: 46, padding: "10px 18px", border: `2px solid ${t.ink}72`,
          borderRadius: index === 2 ? 6 : 28, fontSize: 18, fontWeight: 700,
          background: filled ? t.ink : "transparent", color: filled ? t.bg : t.ink,
          transform: tagTransforms[index] ?? "none", letterSpacing: .35,
        }}>{tag.label.toUpperCase()}</span>;
      })}
    </div>

    <div style={{ display: "flex", gap: 22, marginTop: 42 }}>
      <div style={{ display: "flex", flexDirection: "column", width: "44%", borderTop: `2px solid ${t.ink}38`, paddingTop: 20 }}>
        <span style={{ fontSize: 14, letterSpacing: 2, opacity: .55, fontFamily: labelFontFamily }}>TOP LANGUAGE</span>
        {topLanguage ? <>
          <span style={{ fontSize: topLanguage.name.length > 14 ? 38 : 52, fontWeight: 700, letterSpacing: -2, marginTop: 10 }}>{topLanguage.name.toUpperCase()}</span>
          <span style={{ fontSize: 40, fontWeight: 700, marginTop: 2 }}>{Math.round(topLanguage.percentage)}%</span>
          <div style={{ display: "flex", width: "100%", height: 8, borderRadius: 4, overflow: "hidden", marginTop: 14, background: `${t.ink}18` }}>
            {stats.languages.map(language => <span key={language.name} style={{ display: "flex", width: `${language.percentage}%`, height: "100%", background: language.color }} />)}
          </div>
        </> : <span style={{ fontSize: 25, marginTop: 14, opacity: .62 }}>NO DATA</span>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", width: "56%", borderTop: `2px solid ${t.ink}38`, paddingTop: 20 }}>
        <span style={{ fontSize: 14, letterSpacing: 2, opacity: .55, fontFamily: labelFontFamily }}>MAIN QUEST</span>
        <span style={{ fontSize: repo.length > 30 ? 29 : 36, fontWeight: 700, marginTop: 10, lineHeight: 1.06 }}>{repo}</span>
        <span style={{ fontSize: 16, marginTop: 12, opacity: .6 }}>{mainQuest ? `${mainQuest.commits.toLocaleString("en-US")} commits` : "No public repository"}</span>
      </div>
    </div>

    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "auto", paddingTop: 26, borderTop: `2px solid ${t.ink}24` }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: 1.3 }}>EVERY LITTLE PUSH ADDS UP.</span>
        <span style={{ fontSize: 13, opacity: .55 }}>{new URL(SITE_URL).host}</span>
      </div>
      <span style={{ fontSize: 13, opacity: .55 }}>{stats.isDemo ? c.sampleData : `${c.thru} ${stats.through}`}</span>
    </div>
  </div>;
}
