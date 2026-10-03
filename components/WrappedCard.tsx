import type { ContributionDay, WrappedStats } from "@/lib/types";
import { COPY, THEMES, heroQuote, rhythmCaption, type Theme } from "@/lib/presentation";
import { SITE_URL } from "@/lib/links";

function gridColor(day: ContributionDay | null, ink: string) {
  if (!day || day.contributionCount <= 0) return `${ink}16`;
  if (day.contributionLevel === "FOURTH_QUARTILE" || day.contributionCount >= 7) return `${ink}dd`;
  if (day.contributionLevel === "THIRD_QUARTILE" || day.contributionCount >= 4) return `${ink}a8`;
  if (day.contributionLevel === "SECOND_QUARTILE" || day.contributionCount >= 2) return `${ink}72`;
  return `${ink}42`;
}

function MiniContributionGrid({ stats, ink }: { stats: WrappedStats; ink: string }) {
  const recent = stats.days.slice(-98);
  const padded: (ContributionDay | null)[] = [
    ...Array(Math.max(0, 98 - recent.length)).fill(null),
    ...recent,
  ];
  const weeks = Array.from({ length: 14 }, (_, index) => padded.slice(index * 7, index * 7 + 7));
  return <div style={{ display: "flex", gap: 7, opacity: .9 }}>
    {weeks.map((week, weekIndex) => <div key={weekIndex} style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {week.map((day, dayIndex) => <span key={day?.date ?? `${weekIndex}-${dayIndex}`} style={{ width: 12, height: 12, borderRadius: 2, background: gridColor(day, ink) }} />)}
    </div>)}
  </div>;
}

// One fixed-size composition powers both the responsive preview and PNG export.
export function WrappedCard({ stats, theme = "lime", avatar = stats.avatarUrl, fontFamily = "Arimo, Noto Sans SC, sans-serif", labelFontFamily = "Noto Sans SC, sans-serif", serifFontFamily = "Libre Baskerville, Georgia, serif" }: {
  stats: WrappedStats; theme?: Theme; avatar?: string | null; fontFamily?: string; labelFontFamily?: string; serifFontFamily?: string;
}) {
  const c = COPY, t = THEMES[theme];
  const quote = heroQuote(stats);
  const rhythm = rhythmCaption(stats);
  const name = Array.from(stats.displayName).slice(0, 28).join("");
  const mainQuest = stats.topRepositories[0];
  const fullRepo = mainQuest?.name ?? c.noRepo;
  const repo = fullRepo.length > 42 ? fullRepo.slice(0, 39) + "…" : fullRepo;
  const topLanguage = stats.languages[0];
  const otherLanguages = stats.languages.slice(1, 4);
  const tagTransforms = ["rotate(-2deg)", "rotate(2deg)", "rotate(-1deg)"];

  return <div style={{
    width: 1080, height: 1350, display: "flex", flexDirection: "column",
    background: t.bg, color: t.ink, padding: "48px 62px 42px", overflow: "hidden",
    fontFamily, lineHeight: 1.15, flexShrink: 0, position: "relative",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontFamily: labelFontFamily }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <span style={{ fontSize: 25, fontWeight: 700, letterSpacing: 2 }}>GITHUB WRAPPED®</span>
        <span style={{ fontSize: 15, letterSpacing: 2, opacity: .62 }}>YOUR YEAR IN CODE</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 7 }}>
        <span style={{ fontSize: 21, fontWeight: 700, letterSpacing: 2 }}>{stats.isDemo ? "DEMO / " : ""}ISSUE {stats.year}</span>
        <span style={{ fontSize: 15, letterSpacing: 1.5, opacity: .62 }}>365 DAYS / ONE RECAP</span>
      </div>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 17, marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 58, height: 58, background: t.ink, color: t.bg, borderRadius: 29, overflow: "hidden", position: "relative", flexShrink: 0, fontSize: 26, fontWeight: 700 }}>
        <span>{name.slice(0, 1).toUpperCase()}</span>
        {avatar && <img src={avatar} alt="" width={58} height={58} style={{ position: "absolute", width: 58, height: 58, objectFit: "cover" }} />}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: name.length > 20 ? 23 : 27, fontWeight: 700 }}>{name}</span>
        <span style={{ fontSize: 18, opacity: .7 }}>@{stats.username}</span>
      </div>
    </div>

    <div style={{ display: "flex", justifyContent: "space-between", gap: 32, marginTop: 28, minHeight: 202 }}>
      <div style={{ display: "flex", flexDirection: "column", width: 600, position: "relative", zIndex: 2 }}>
        <span style={{ fontSize: 69, fontWeight: 700, letterSpacing: -3.5, lineHeight: .98 }}>{quote.line1}</span>
        <span style={{ fontSize: 69, fontWeight: 700, letterSpacing: -3.5, lineHeight: .98 }}>{quote.line2}</span>
        <span style={{ marginTop: 14, fontSize: 25, fontFamily: serifFontFamily, fontStyle: "italic", opacity: .78 }}>{quote.note}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", width: 300 }}>
        <MiniContributionGrid stats={stats} ink={t.ink} />
        <span style={{ fontSize: 13, letterSpacing: 1.4, marginTop: 12, opacity: .55, fontFamily: labelFontFamily }}>RECENT CONTRIBUTION RHYTHM</span>
      </div>
    </div>

    <div style={{ display: "flex", position: "relative", borderTop: `2px solid ${t.ink}35`, borderBottom: `2px solid ${t.ink}35`, padding: "20px 0 18px", overflow: "hidden" }}>
      <span style={{ position: "absolute", right: 2, top: -23, fontSize: 162, fontWeight: 700, letterSpacing: -8, opacity: .075 }}>PUSH</span>
      <div style={{ display: "flex", flexDirection: "column", position: "relative", zIndex: 2 }}>
        <span style={{ fontSize: 15, letterSpacing: 2, fontFamily: labelFontFamily, opacity: .6 }}>01 / THE OUTPUT</span>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 18, marginTop: 3 }}>
          <span style={{ fontSize: stats.commits >= 1000000 ? 104 : 120, fontWeight: 700, lineHeight: .95, letterSpacing: -6 }}>{stats.commits.toLocaleString("en-US")}</span>
          <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: 1, paddingBottom: 12 }}>COMMITS</span>
        </div>
      </div>
      <div style={{ display: "flex", marginLeft: "auto", alignItems: "flex-end", gap: 42, position: "relative", zIndex: 2, paddingBottom: 8 }}>
        <div style={{ display: "flex", flexDirection: "column" }}><strong style={{ fontSize: 36 }}>{stats.longestStreak}d</strong><span style={{ fontSize: 13, opacity: .62 }}>LONGEST STREAK</span></div>
        <div style={{ display: "flex", flexDirection: "column" }}><strong style={{ fontSize: 36 }}>{stats.repositories}</strong><span style={{ fontSize: 13, opacity: .62 }}>REPOSITORIES</span></div>
      </div>
    </div>

    <div style={{ display: "flex", flexDirection: "column", marginTop: 20 }}>
      <span style={{ fontSize: 15, fontFamily: labelFontFamily, letterSpacing: 2, opacity: .62 }}>02 / YOUR DEVELOPER DNA</span>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 13, minHeight: 55 }}>
        {stats.personalityTags.map((tag, index) => {
          const filled = index === 0;
          return <span key={tag.category} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            minHeight: 43, padding: "9px 17px", border: `2px solid ${t.ink}70`,
            borderRadius: index === 2 ? 5 : 28, fontSize: 18, fontWeight: 700,
            background: filled ? t.ink : "transparent", color: filled ? t.bg : t.ink,
            transform: tagTransforms[index] ?? "none", letterSpacing: .4,
          }}>{tag.label.toUpperCase()}</span>;
        })}
        {stats.personalityTags.length === 0 && <span style={{ fontSize: 19, opacity: .6 }}>YOUR STORY IS JUST GETTING STARTED</span>}
      </div>
    </div>

    <div style={{ display: "flex", gap: 22, marginTop: 19 }}>
      <div style={{ display: "flex", flexDirection: "column", width: "56%", border: `2px solid ${t.ink}35`, borderRadius: 15, padding: "18px 21px" }}>
        <span style={{ fontSize: 14, letterSpacing: 2, opacity: .6, fontFamily: labelFontFamily }}>03 / YOUR STACK</span>
        {topLanguage ? <>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 7 }}>
            <span style={{ fontSize: topLanguage.name.length > 14 ? 40 : 49, fontWeight: 700, letterSpacing: -2, maxWidth: 330 }}>{topLanguage.name.toUpperCase()}</span>
            <span style={{ fontSize: 51, fontWeight: 700, letterSpacing: -2 }}>{Math.round(topLanguage.percentage)}%</span>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 9, fontSize: 16 }}>
            {otherLanguages.map(language => <span key={language.name}>{language.name} {Math.round(language.percentage)}%</span>)}
          </div>
          <div style={{ display: "flex", width: "100%", height: 8, borderRadius: 4, overflow: "hidden", marginTop: 13, background: `${t.ink}18` }}>
            {stats.languages.map(language => <span key={language.name} style={{ display: "flex", width: `${language.percentage}%`, height: "100%", background: language.color }} />)}
          </div>
        </> : <span style={{ fontSize: 24, marginTop: 17, opacity: .62 }}>NO PUBLIC STACK DATA</span>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", width: "44%", background: t.ink, color: t.bg, borderRadius: 15, padding: "18px 21px" }}>
        <span style={{ fontSize: 14, letterSpacing: 2, opacity: .65, fontFamily: labelFontFamily }}>04 / WEEKEND ENERGY</span>
        <span style={{ fontSize: 69, fontWeight: 700, letterSpacing: -4, marginTop: 3 }}>{Math.round(stats.codingRhythm.weekendEnergy)}%</span>
        <span style={{ fontSize: 16, lineHeight: 1.32, opacity: .88, maxWidth: 290 }}>{rhythm}</span>
        <span style={{ fontSize: 13, marginTop: "auto", opacity: .62 }}>{stats.codingRhythm.favoriteDay ?? "—"} · {stats.codingRhythm.activeMonths}/12 active months</span>
      </div>
    </div>

    <div style={{ display: "flex", alignItems: "center", borderTop: `2px solid ${t.ink}35`, marginTop: 20, paddingTop: 16, minHeight: 103 }}>
      <div style={{ display: "flex", flexDirection: "column", width: 135 }}>
        <span style={{ fontSize: 14, letterSpacing: 2, opacity: .6, fontFamily: labelFontFamily }}>05 / MAIN</span>
        <span style={{ fontSize: 14, letterSpacing: 2, opacity: .6, fontFamily: labelFontFamily }}>QUEST</span>
        <span style={{ fontSize: 34, fontWeight: 700, marginTop: 6 }}>01 ↗</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: repo.length > 32 ? 27 : 32, fontWeight: 700, overflow: "hidden" }}>{repo}</span>
        <span style={{ fontSize: 14, marginTop: 7, opacity: .62 }}>{mainQuest ? `${mainQuest.commits.toLocaleString("en-US")} commit contributions · MOST CONTRIBUTED` : "NO PUBLIC MAIN QUEST THIS YEAR"}</span>
      </div>
    </div>

    <div style={{ display: "flex", flexDirection: "column", background: t.panel, color: t.panelText, borderRadius: 14, padding: "16px 21px", marginTop: 16, fontFamily: labelFontFamily }}>
      <span style={{ fontSize: 14, opacity: .65 }}>$ git status --year {stats.year}</span>
      <span style={{ fontSize: 17, marginTop: 6 }}>On branch: keep-building</span>
      <span style={{ fontSize: 17, marginTop: 3 }}>{stats.commits > 0 ? "Nothing to commit. A lot to remember." : "Working tree quiet. Story still loading."}</span>
      <span style={{ fontSize: 11, marginTop: 5, opacity: .55 }}>annual recap / just for fun</span>
    </div>

    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "auto", paddingTop: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: 1.5 }}>EVERY LITTLE PUSH ADDS UP.</span>
        <span style={{ fontSize: 13, opacity: .62 }}>{new URL(SITE_URL).host}</span>
      </div>
      <span style={{ fontSize: 13, opacity: .62 }}>{stats.isDemo ? c.sampleData : `${c.thru} ${stats.through}`}</span>
    </div>
  </div>;
}
