"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDemoStats } from "@/lib/demo";
import type { WrappedStats } from "@/lib/types";
import { COPY, THEMES, personaText, type Theme } from "@/lib/presentation";
import { recapPath, shareUrl } from "@/lib/links";
import { CardPreview } from "./CardPreview";
import { MonthlyChart } from "./MonthlyChart";
import { ContributionCalendar } from "./ContributionCalendar";
import { ArrowIcon, DownloadIcon, GitHubIcon } from "./Icons";

const REPOSITORY = "https://github.com/Drawoh-eh/GitHub-Wrapped";
export function WrappedExperience({ initialStats, initialUsername = "", initialError = "", initialTheme = "lime" }: {
  initialStats?: WrappedStats; initialUsername?: string; initialError?: string; initialTheme?: Theme;
}) {
  const router = useRouter();
  const currentYear = new Date().getUTCFullYear();
  const [username, setUsername] = useState(initialStats?.isDemo ? "" : initialStats?.username ?? initialUsername);
  const [year, setYear] = useState(initialStats?.year ?? currentYear);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);
  const [notice, setNotice] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [canCopyImage, setCanCopyImage] = useState(false);
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
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/wrapped?${new URLSearchParams({ username: username.trim(), year: String(year) })}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Couldn't generate your recap.");
      router.push(recapPath(result, theme));
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); }
    finally { setBusy(false); }
  }
  async function cardBlob() {
    const params = new URLSearchParams({ username: stats.username, year: String(stats.year), theme, ...(stats.isDemo ? { demo: "1" } : {}) });
    const response = await fetch(`/api/card?${params}`);
    if (!response.ok || !response.headers.get("content-type")?.startsWith("image/png")) throw new Error(c.downloadError);
    return response.blob();
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
  return <div className="site-shell" lang="en">
    <header className="site-header"><a className="wordmark" href={`/?theme=${theme}`}><span className="brand-mark">&lt;/&gt;</span>github<span className="wordmark-light">wrapped</span><span className="version">v0.2</span></a><div className="header-actions"><a className="repo-link" href={REPOSITORY} target="_blank" rel="noreferrer"><GitHubIcon /><span>{c.star}</span><span className="star">☆</span></a></div></header>
    <main>
      <div className="hero-layout">
        <section className="hero-copy">
          <div className="eyebrow"><span className="status-dot" /> {isResult ? `${stats.year} / ${c.recap}` : `${currentYear} / ${c.yearCode}`}</div>
          <h1>{isResult ? c.result1 : c.title1}<br /><span>{isResult ? c.result2 : c.title2}</span></h1>
          <p className="hero-description">{c.intro}</p>
          <form className="username-form" onSubmit={generate} aria-busy={busy}>
            <div className="form-heading"><span>{c.form}</span><span>{c.noSignup}</span></div>
            <div className="form-fields"><div className="username-field"><label htmlFor="username">{c.username}</label><div className="input-wrap"><span>@</span><input id="username" name="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Drawoh-eh" required maxLength={39} autoCapitalize="none" autoCorrect="off" spellCheck={false} disabled={busy} /></div></div><div className="year-field"><label htmlFor="year">{c.year}</label><select id="year" value={year} onChange={e => setYear(Number(e.target.value))} disabled={busy}>{Array.from({ length: currentYear - 2007 }, (_, i) => currentYear - i).map(y => <option key={y} value={y}>{y}</option>)}</select></div></div>
            <button className="generate-button" type="submit" disabled={busy}><span>{busy ? c.generating : c.generate}</span>{busy ? <span className="spinner" /> : <ArrowIcon />}</button>
            {error && <p className="form-error" role="alert">{error}</p>}
          </form>
          <div className="demo-line">{c.justLooking} <a href={recapPath(getDemoStats(year), theme)}>{c.demo} <span>↗</span></a></div>
          <div className="small-promises"><span><i>✓</i> {c.open}</span><span><i>✓</i> {c.account}</span><span><i>✓</i> {c.free}</span></div>
          <div className="customize-panel"><div className="form-heading"><span>{c.customize}</span><span>{c.theme}</span></div><div className="theme-controls" role="group" aria-label={c.theme}>{(Object.keys(THEMES) as Theme[]).map(key => <button key={key} aria-pressed={theme === key} onClick={() => customize(key)}><i style={{ background: THEMES[key].bg }} />{c.themes[key]}</button>)}</div></div>
          {isResult && <div className="result-actions"><button className="download-button" onClick={download} disabled={downloading}><DownloadIcon />{downloading ? c.downloading : c.download}</button>{canCopyImage && <button className="share-button" onClick={copyImage} disabled={copying}>{copying ? c.copyingImage : c.copyImage}</button>}<button className="share-button" onClick={share}>{c.share} <ArrowIcon /></button><p className="action-notice" role="status">{notice}</p></div>}
        </section>
        <section className="hero-preview" aria-label={c.preview}><div className="preview-caption"><span>{stats.isDemo ? c.demoCard : `@${stats.username.toUpperCase()} · ${c.recap}`}</span><span>1080 × 1350</span></div><div className="card-shadow"><CardPreview stats={stats} theme={theme} /></div><div className="preview-footnote"><span className="tiny-spark">✳</span> {c.cardFoot}</div></section>
      </div>
      <section className="data-section" aria-label={c.calendarNote}>
        <div className="section-title"><div className="eyebrow">{c.closer}</div><h2>{c.adds}</h2><p>{stats.isDemo ? c.sample : `${stats.year === currentYear ? c.ytd : c.full} · ${c.through} ${stats.through} · ${c.dates}`}</p></div>
        <div className="insight-grid"><div><span>{c.total}</span><strong>{stats.contributions.toLocaleString("en-US")}</strong><small>{c.allTypes}</small></div><div><span>{c.active}</span><strong>{stats.activeDays}</strong><small>{c.activeNote}</small></div><div><span>{c.streak}</span><strong>{stats.longestStreak}<em> {c.days}</em></strong><small>{c.streakNote}</small></div><div><span>{c.busiest}</span><strong className="date-stat">{stats.busiestDay?.date.slice(5) ?? "—"}</strong><small>{stats.busiestDay ? `${stats.busiestDay.contributionCount} ${c.contributions} · MM-DD` : c.next}</small></div></div>
        <div className="personalized-panel"><div><span>{c.titleLabel}</span><h3>{personaText(stats)}</h3><p>{c.titleNote}</p></div><div><span>{c.topRepo}</span><h3>{stats.topRepository ? <a href={`https://github.com/${stats.topRepository.name}`} target="_blank" rel="noreferrer">{stats.topRepository.name} ↗</a> : c.noRepo}</h3><p>{stats.topRepository ? `${stats.topRepository.commits.toLocaleString("en-US")} ${c.commits} · ` : ""}{c.topRepoNote}{stats.topRepositoryIncomplete ? ` ${c.partialShort}` : ""}</p></div></div>
        <div className="activity-panels"><div className="month-panel"><h3 className="chart-title">{c.monthTitle}{stats.isDemo && <span className="sample-badge">SAMPLE DATA</span>}</h3><p>{c.monthNote}</p><MonthlyChart key={`${stats.username}-${stats.year}`} months={stats.months} bestMonth={stats.mostProductiveMonth?.name} /></div>
        <div className="language-panel"><h3 className="chart-title">{c.languageTitle}{stats.isDemo && <span className="sample-badge">SAMPLE DATA</span>}</h3><p>{c.languageNote}</p>{stats.languages.length ? stats.languages.slice(0, 5).map(l => <div className="language-row" key={l.name}><i style={{ background: l.color }} /><span>{l.name}</span><b>{l.percentage.toFixed(1)}%</b></div>) : <div className="empty-data">{c.languageEmpty}</div>}{stats.languagesIncomplete && <small className="coverage-note">{c.partial}</small>}</div></div>
        <div className="calendar-panel"><div className="calendar-heading"><h3 className="chart-title">{c.calendar}{stats.isDemo && <span className="sample-badge">SAMPLE DATA</span>}</h3><span>{c.calendarNote}</span></div><p className="calendar-source">{stats.isDemo ? "Generated example · not actual GitHub activity" : <>GitHub API · <a href={`https://github.com/${stats.username}?tab=overview&from=${stats.year}-01-01&to=${stats.through}`} target="_blank" rel="noreferrer">@{stats.username} · {stats.year} ↗</a>{" · "}{c.allTypes}{stats.fetchedAt && <> · Updated {new Date(stats.fetchedAt).toLocaleString("en-US", { timeZone: "UTC", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })} UTC</>}</>}</p><ContributionCalendar key={`${stats.username}-${stats.year}`} days={stats.days} /></div>
      </section>
      <section className="method-section">{c.methods.map((title, i) => <div key={i}><span className="method-number">0{i + 1} / {c.methodLabels[i]}</span><h3>{title}</h3><p>{c.methodTexts[i]}</p></div>)}</section>
    </main>
    <footer className="site-footer"><span>{c.footer}</span><a href={REPOSITORY} target="_blank" rel="noreferrer">{c.source} ↗</a><span>{c.unofficial}</span></footer>
  </div>;
}
