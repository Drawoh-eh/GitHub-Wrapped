"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getDemoStats } from "@/lib/demo";
import type { WrappedStats } from "@/lib/types";
import { COPY, THEMES, type Theme } from "@/lib/presentation";
import { recapPath, shareUrl } from "@/lib/links";
import { withRequestTimeout } from "@/lib/client-request";
import { createImageCache } from "@/lib/image-cache";
import { CardPreview } from "./CardPreview";
import { MonthlyChart } from "./MonthlyChart";
import { ContributionCalendar } from "./ContributionCalendar";
import { ArrowIcon, DownloadIcon, GitHubIcon } from "./Icons";

const REPOSITORY = "https://github.com/Drawoh-eh/GitHub-Wrapped";
export function WrappedExperience({ initialStats, initialUsername = "", initialYear, initialError = "", initialTheme = "lime" }: {
  initialStats?: WrappedStats; initialUsername?: string; initialYear?: number; initialError?: string; initialTheme?: Theme;
}) {
  const router = useRouter();
  const currentYear = new Date().getUTCFullYear();
  const [username, setUsername] = useState(initialStats?.isDemo ? "" : initialStats?.username ?? initialUsername);
  const [year, setYear] = useState(initialStats?.year ?? initialYear ?? currentYear);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [busy, setBusy] = useState(false);
  const [navigating, startTransition] = useTransition();
  const generating = busy || navigating;
  const [error, setError] = useState(initialError);
  const [notice, setNotice] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [canCopyImage, setCanCopyImage] = useState(false);
  const imageCache = useRef<ReturnType<typeof createImageCache> | null>(null);
  if (!imageCache.current) imageCache.current = createImageCache();
  useEffect(() => { setCanCopyImage(Boolean(window.isSecureContext && typeof navigator.clipboard?.write === "function" && typeof window.ClipboardItem === "function" && (typeof ClipboardItem.supports !== "function" || ClipboardItem.supports("image/png")))); }, []);
  const stats = initialStats ?? getDemoStats(year);
  const isResult = Boolean(initialStats), c = COPY;
  useEffect(() => { setTheme(initialTheme); }, [initialTheme]);
  function customize(nextTheme: Theme) {
    setTheme(nextTheme); setNotice("");
    const url = new URL(window.location.href);
    url.searchParams.set("theme", nextTheme); url.searchParams.delete("lang");
    window.history.replaceState(null, "", url);
  }
  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (generating) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const result = await withRequestTimeout(async signal => {
        const response = await fetch(`/api/wrapped?${new URLSearchParams({ username: username.trim(), year: String(year) })}`, { signal });
        const result = await response.json().catch(() => null);
        if (!response.ok || !result || typeof result.username !== "string" || !Number.isInteger(result.year)) {
          throw new Error(typeof result?.error === "string" ? result.error : "Couldn't generate your recap. Please try again.");
        }
        return result;
      });
      startTransition(() => router.push(recapPath(result, theme)));
    } catch (e) {
      setError(e instanceof Error && e.name === "TimeoutError" ? "The request took too long. Please try again."
        : e instanceof TypeError ? "Couldn't connect. Check your connection and try again."
        : e instanceof Error ? e.message : "Please try again.");
    }
    finally { setBusy(false); }
  }
  async function cardBlob() {
    const params = new URLSearchParams({ username: stats.username, year: String(stats.year), theme, ...(stats.isDemo ? { demo: "1" } : {}) });
    const key = `${params}:${stats.fetchedAt ?? stats.through}`;
    return imageCache.current!(key, () => withRequestTimeout(async signal => {
      const response = await fetch(`/api/card?${params}`, { signal });
      if (!response.ok || !response.headers.get("content-type")?.startsWith("image/png")) throw new Error(c.downloadError);
      return response.blob();
    }, 40_000));
  }
  async function copyImage() {
    setCopying(true); setNotice("");
    try {
      // Pass the promise immediately: Safari requires write() during the click gesture.
      const image = cardBlob();
      void image.catch(() => {});
      await navigator.clipboard.write([new ClipboardItem({ "image/png": image })]);
      setNotice(c.imageCopied);
    } catch { setNotice(c.copyImageError); }
    finally { setCopying(false); }
  }
  async function download() {
    setDownloading(true); setNotice("");
    try {
      const url = URL.createObjectURL(await cardBlob()), anchor = document.createElement("a");
      anchor.href = url; anchor.download = `github-wrapped-${stats.username}-${stats.year}-${theme}${stats.isDemo ? "-demo" : ""}.png`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice(c.ready);
    } catch { setNotice(c.downloadError); }
    finally { setDownloading(false); }
  }
  async function share() {
    const url = shareUrl(stats, theme);
    try {
      if (navigator.share) await navigator.share({ title: `${stats.year} GitHub Wrapped`, url });
      else { await navigator.clipboard.writeText(url); setNotice(c.copied); }
    } catch (e) { if (!(e instanceof Error && e.name === "AbortError")) setNotice(`${c.shareLink} ${url}`); }
  }
  return <div className={`site-shell ${isResult ? "is-result" : "is-home"}`} lang="en">
    <header className="site-header"><a className="wordmark" href={`/?theme=${theme}`}><span className="brand-mark">&lt;/&gt;</span>github<span className="wordmark-light">wrapped</span></a><div className="header-actions"><a className="repo-link" href={REPOSITORY} target="_blank" rel="noreferrer" aria-label={c.star}><GitHubIcon /><span>Star</span></a></div></header>
    <main>
      <div className="hero-layout">
        <section className="hero-copy">
          <div className="eyebrow"><span className="status-dot" /> {isResult ? `${stats.year} / ${c.recap}` : `${currentYear} / ${c.yearCode}`}</div>
          <h1>{isResult ? c.result1 : c.title1}<br /><span>{isResult ? c.result2 : c.title2}</span></h1>
          <p className="hero-description">{c.intro}</p>
          <form className="username-form" onSubmit={generate} aria-busy={generating}>
            <div className="form-fields"><div className="username-field"><label htmlFor="username">{c.username}</label><div className="input-wrap"><span>@</span><input id="username" name="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="username or GitHub profile URL" required maxLength={256} autoCapitalize="none" autoCorrect="off" spellCheck={false} disabled={generating} /></div></div><div className="year-field"><label htmlFor="year">{c.year}</label><select id="year" value={year} onChange={e => setYear(Number(e.target.value))} disabled={generating}>{Array.from({ length: currentYear - 2007 }, (_, i) => currentYear - i).map(y => <option key={y} value={y}>{y}</option>)}</select></div></div>
            <button className="generate-button" type="submit" disabled={generating}><span>{generating ? c.generating : c.generate}</span>{generating ? <span className="spinner" /> : <ArrowIcon />}</button>
            {error && <p className="form-error" role="alert">{error}</p>}
          </form>
          <div className="demo-line">{c.justLooking} <a href={recapPath(getDemoStats(year), theme)}>{c.demo} <span>↗</span></a></div>
          <div className="customize-panel"><div className="form-heading"><span>{c.theme}</span></div><div className="theme-controls" role="group" aria-label={c.theme}>{(Object.keys(THEMES) as Theme[]).map(key => <button key={key} aria-pressed={theme === key} onClick={() => customize(key)}><i style={{ background: THEMES[key].bg }} />{c.themes[key]}</button>)}</div></div>
          {isResult && <div className="result-actions"><button className="download-button" onClick={download} disabled={downloading}><DownloadIcon />{downloading ? c.downloading : c.download}</button>{canCopyImage && <button className="share-button" onClick={copyImage} disabled={copying}>{copying ? c.copyingImage : c.copyImage}</button>}<button className="share-button" onClick={share}>{c.share} <ArrowIcon /></button><p className="action-notice" role="status">{notice}</p></div>}
        </section>
        <section className="hero-preview" aria-label={c.preview}><div className="preview-caption"><span>{stats.isDemo ? c.demoCard : `@${stats.username.toUpperCase()} · ${c.recap}`}</span></div><div className="card-shadow"><CardPreview stats={stats} theme={theme} /></div></section>
        <a className="scroll-cue" href="#year-details">Explore the stats <ArrowIcon /></a>
      </div>
      <section id="year-details" className="data-section" tabIndex={-1} aria-label={c.calendarNote}>
        <div className="section-title"><div className="eyebrow">{c.closer}</div><h2>{c.adds}</h2><p>{stats.isDemo ? c.sample : `${stats.year === currentYear ? c.ytd : c.full} · ${c.through} ${stats.through} · ${c.dates}`}</p></div>
        <div className="insight-grid"><div><span>{c.total}</span><strong>{stats.contributions.toLocaleString("en-US")}</strong><small>{c.allTypes}</small></div><div><span>{c.active}</span><strong>{stats.activeDays}</strong><small>{c.activeNote}</small></div><div><span>{c.streak}</span><strong>{stats.longestStreak}<em> {c.days}</em></strong><small>{c.streakNote}</small></div><div><span>{c.busiest}</span><strong className="date-stat">{stats.busiestDay?.date.slice(5) ?? "—"}</strong><small>{stats.busiestDay ? `${stats.busiestDay.contributionCount} ${c.contributions} · MM-DD` : c.next}</small></div></div>
        <div className="story-grid">
          <div className="story-panel dna-panel"><span>{c.dnaTitle}</span><div className="tag-list">{stats.personalityTags.map(tag => <strong key={tag.category}>{tag.label}</strong>)}</div><p>{c.titleNote} <a href={`${REPOSITORY}/blob/main/docs/data-and-api.md#playful-titles-and-small-samples`} target="_blank" rel="noreferrer">Title rules ↗</a></p></div>
          <div className="story-panel rhythm-panel"><span>{c.rhythmTitle}</span><div className="rhythm-stats"><div><strong>{Math.round(stats.codingRhythm.weekendEnergy)}%</strong><small>{c.weekendEnergy}</small></div><div><strong>{stats.codingRhythm.favoriteDay ?? "—"}</strong><small>{c.favoriteDay}</small></div><div><strong>{stats.codingRhythm.activeMonths}/12</strong><small>{c.activeMonths}</small></div></div><p>{Math.round(stats.codingRhythm.consistency)}% of elapsed calendar days were active contribution days.</p></div>
          <div className="story-panel quests-panel"><span>{c.mainQuests}</span><div className="quest-list">{stats.topRepositories.length ? stats.topRepositories.map((repo, index) => <div key={repo.name}><b>0{index + 1}</b><div><h3><a href={`https://github.com/${repo.name}`} target="_blank" rel="noreferrer">{repo.name} ↗</a></h3><small>{repo.commits.toLocaleString("en-US")} {c.commits}</small></div></div>) : <h3>{c.noRepo}</h3>}</div><p>{c.mainQuestsNote}{stats.topRepositoryIncomplete ? ` ${c.partialShort}` : ""}</p></div>
        </div>
        <div className="activity-panels"><div className="month-panel"><h3 className="chart-title">{c.monthTitle}{stats.isDemo && <span className="sample-badge">SAMPLE DATA</span>}</h3><p>{c.monthNote}</p><MonthlyChart key={`${stats.username}-${stats.year}`} months={stats.months} bestMonth={stats.mostProductiveMonth?.name} /></div>
        <div className="language-panel"><h3 className="chart-title">{c.languageTitle}{stats.isDemo && <span className="sample-badge">SAMPLE DATA</span>}</h3><p>{c.languageNote}</p>{stats.languages.length ? stats.languages.slice(0, 5).map(l => <div className="language-row" key={l.name}><i style={{ background: l.color }} /><span>{l.name}</span><b>{l.percentage.toFixed(1)}%</b></div>) : <div className="empty-data">{c.languageEmpty}</div>}{stats.languagesIncomplete && <small className="coverage-note">{c.partial}</small>}</div></div>
        <div className="calendar-panel"><div className="calendar-heading"><h3 className="chart-title">{c.calendar}{stats.isDemo && <span className="sample-badge">SAMPLE DATA</span>}</h3><span>{c.calendarNote}</span></div><p className="calendar-source">{stats.isDemo ? "Generated example · not actual GitHub activity" : <>GitHub API · <a href={`https://github.com/${stats.username}?tab=overview&from=${stats.year}-01-01&to=${stats.through}`} target="_blank" rel="noreferrer">@{stats.username} · {stats.year} ↗</a>{" · "}{c.allTypes}{stats.fetchedAt && <> · Updated {new Date(stats.fetchedAt).toLocaleString("en-US", { timeZone: "UTC", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })} UTC</>}</>}</p><ContributionCalendar key={`${stats.username}-${stats.year}`} days={stats.days} /></div>
      </section>
      <section className="method-section">{c.methods.map((title, i) => <div key={i}><span className="method-number">0{i + 1} / {c.methodLabels[i]}</span><h3>{title}</h3><p>{c.methodTexts[i]}</p></div>)}</section>
    </main>
    <footer className="site-footer"><span>{c.footer}</span><a href={REPOSITORY} target="_blank" rel="noreferrer">{c.source} ↗</a><span>{c.unofficial}</span></footer>
  </div>;
}
