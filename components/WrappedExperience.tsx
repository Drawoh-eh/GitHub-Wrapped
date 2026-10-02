"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDemoStats } from "@/lib/demo";
import type { WrappedStats } from "@/lib/types";
import { WrappedCard } from "./WrappedCard";
import { ArrowIcon, DownloadIcon, GitHubIcon } from "./Icons";

const REPOSITORY = "https://github.com/Drawoh-eh/GitHub-Wrapped";

export function WrappedExperience({ initialStats, initialUsername = "", initialError = "" }: {
  initialStats?: WrappedStats; initialUsername?: string; initialError?: string;
}) {
  const router = useRouter();
  const currentYear = new Date().getUTCFullYear();
  const [username, setUsername] = useState(initialStats?.isDemo ? "" : initialStats?.username ?? initialUsername);
  const [year, setYear] = useState(initialStats?.year ?? currentYear);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);
  const [notice, setNotice] = useState("");
  const [downloading, setDownloading] = useState(false);
  const demo = getDemoStats(year);
  const stats = initialStats ?? demo;
  const isResult = Boolean(initialStats);

  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/wrapped?${new URLSearchParams({ username: username.trim(), year: String(year) })}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Couldn't generate your recap.");
      router.push(`/wrapped/${encodeURIComponent(result.username)}?year=${year}`);
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); }
    finally { setBusy(false); }
  }

  function cardUrl() {
    return `/api/card?${new URLSearchParams({ username: stats.username, year: String(stats.year), ...(stats.isDemo ? { demo: "1" } : {}), download: "1" })}`;
  }

  async function download() {
    setDownloading(true); setNotice("");
    try {
      const response = await fetch(cardUrl());
      if (!response.ok) { const data = await response.json(); throw new Error(data.error ?? "Couldn't download your card."); }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = `github-wrapped-${stats.username}-${stats.year}${stats.isDemo ? '-demo' : ''}.png`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("Your card is ready. Go share your year!");
    } catch (e) { setNotice(e instanceof Error ? e.message : "Download failed. Please try again."); }
    finally { setDownloading(false); }
  }

  async function share() {
    const url = `${window.location.origin}/wrapped/${encodeURIComponent(stats.username)}?year=${stats.year}${stats.isDemo ? '&demo=1' : ''}`;
    try {
      if (navigator.share) await navigator.share({ title: `${stats.year} GitHub Wrapped`, text: stats.isDemo ? "Try GitHub Wrapped — your year in code." : `My year in code: ${stats.commits.toLocaleString()} commits.`, url });
      else { await navigator.clipboard.writeText(url); setNotice("Recap link copied to clipboard."); }
    } catch (e) { if (!(e instanceof Error && e.name === "AbortError")) setNotice(`Share this link: ${url}`); }
  }

  return <div className="site-shell">
    <header className="site-header"><a className="wordmark" href="/"><span className="brand-mark">&lt;/&gt;</span>github<span className="wordmark-light">wrapped</span><span className="version">v0.1</span></a><a className="repo-link" href={REPOSITORY} target="_blank" rel="noreferrer"><GitHubIcon /><span>Star on GitHub</span><span className="star">☆</span></a></header>
    <main>
      <div className="hero-layout">
        <section className="hero-copy">
          <div className="eyebrow"><span className="status-dot" /> {isResult ? `${stats.year} / THE RECAP` : `${currentYear} / YOUR YEAR IN CODE`}</div>
          <h1>{isResult ? <>You shipped.<br /><span>Here’s the story.</span></> : <>You wrote code.<br /><span>Make it a story.</span></>}</h1>
          <p className="hero-description">The commits. The languages. The days you kept going.<br className="desktop-break" /> Your GitHub year, wrapped into one shareable card.</p>
          <form className="username-form" onSubmit={generate} aria-busy={busy}>
            <div className="form-heading"><span>MAKE YOUR WRAPPED</span><span>NO SIGN-UP NEEDED</span></div>
            <div className="form-fields"><div className="username-field"><label htmlFor="username">GitHub username</label><div className="input-wrap"><span>@</span><input id="username" name="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Drawoh-eh" required maxLength={39} autoCapitalize="none" autoCorrect="off" spellCheck={false} disabled={busy} /></div></div><div className="year-field"><label htmlFor="year">Year</label><select id="year" value={year} onChange={e => setYear(Number(e.target.value))} disabled={busy}>{Array.from({ length: currentYear - 2007 }, (_, i) => currentYear - i).map(y => <option key={y} value={y}>{y}</option>)}</select></div></div>
            <button className="generate-button" type="submit" disabled={busy}><span>{busy ? "Rewinding your year…" : "Generate my Wrapped"}</span>{busy ? <span className="spinner" /> : <ArrowIcon />}</button>
            {error && <p className="form-error" role="alert">{error}</p>}
          </form>
          <div className="demo-line">Just looking? <a href={`/wrapped/octocat?year=${year}&demo=1`}>Explore the demo <span>↗</span></a></div>
          <div className="small-promises"><span><i>✓</i> Open source</span><span><i>✓</i> No account required</span><span><i>✓</i> Free PNG download</span></div>
          {isResult && <div className="result-actions"><button className="download-button" onClick={download} disabled={downloading}><DownloadIcon />{downloading ? "Creating PNG…" : "Download PNG"}</button><button className="share-button" onClick={share}>Share recap <ArrowIcon /></button><p className="action-notice" role="status">{notice}</p></div>}
        </section>
        <section className="hero-preview" aria-label="Share card preview"><div className="preview-caption"><span>{stats.isDemo ? "DEMO CARD · SAMPLE DATA" : `@${stats.username.toUpperCase()} · YOUR RECAP`}</span><span>1080 × 1350</span></div><div className="card-shadow"><WrappedCard stats={stats} /></div><div className="preview-footnote"><span className="tiny-spark">✳</span> {stats.isDemo ? "A little preview of your next humble brag." : "Made to be saved. Built to be shared."}</div></section>
      </div>
      {isResult && <section className="data-section" aria-label="Your yearly activity">
        <div className="section-title"><div className="eyebrow">THE YEAR, A LITTLE CLOSER</div><h2>Every little push adds up.</h2><p>{stats.isDemo ? "Illustrative sample data. Generate your own to see real activity." : `${stats.year === currentYear ? 'Year to date' : 'Full-year recap'} · through ${stats.through} · GitHub contribution dates`}</p></div>
        <div className="insight-grid"><div><span>Total contributions</span><strong>{stats.contributions.toLocaleString("en-US")}</strong><small>commits, issues, PRs & reviews</small></div><div><span>Active days</span><strong>{stats.activeDays}</strong><small>days with any contribution</small></div><div><span>Longest streak</span><strong>{stats.longestStreak}<em> days</em></strong><small>consecutive contribution days</small></div><div><span>Busiest day</span><strong className="date-stat">{stats.busiestDay?.date.slice(5) ?? "—"}</strong><small>{stats.busiestDay ? `${stats.busiestDay.contributionCount} contributions · MM-DD` : "Your next chapter awaits"}</small></div></div>
        <div className="activity-panels"><div className="month-panel"><h3>When you shipped</h3><p>Commit contributions by month</p><div className="month-chart" role="img" aria-label={stats.months.map(m => `${m.name}: ${m.count} commits`).join(', ')}>{stats.months.map(m => <div className="month-column" key={m.name} title={`${m.name}: ${m.count} commits`}><div className={`month-bar ${m.name === stats.mostProductiveMonth?.name ? 'best' : ''}`} style={{ height: `${Math.max(m.count > 0 ? 3 : 0, m.count / Math.max(...stats.months.map(m => m.count), 1) * 100)}%` }} /><span>{m.name.slice(0, 1)}</span></div>)}</div></div>
        <div className="language-panel"><h3>Your language mix</h3><p>Current code bytes in repositories you committed to</p>{stats.languages.length ? stats.languages.slice(0, 5).map(l => <div className="language-row" key={l.name}><i style={{ background: l.color }} /><span>{l.name}</span><b>{l.percentage.toFixed(1)}%</b></div>) : <div className="empty-data">No repository language data available.</div>}{stats.languagesIncomplete && <small className="coverage-note">Partial coverage: up to 100 repositories and 100 languages per repository.</small>}</div></div>
        <div className="calendar-panel"><div className="calendar-heading"><h3>The days you showed up</h3><span>Contribution activity</span></div><div className="contribution-calendar" role="img" aria-label={`${stats.activeDays} active days in ${stats.year}`}>{Array.from({ length: new Date(`${stats.year}-01-01T00:00:00Z`).getUTCDay() }, (_, i) => <span key={`pad${i}`} className="calendar-pad" />)}{stats.days.map(day => <span key={day.date} title={`${day.date}: ${day.contributionCount} contributions`} className={`calendar-cell level-${day.contributionCount === 0 ? 0 : day.contributionCount < 3 ? 1 : day.contributionCount < 6 ? 2 : day.contributionCount < 10 ? 3 : 4}`} />)}</div><div className="calendar-legend">Less {[0,1,2,3,4].map(i => <span key={i} className={`calendar-cell level-${i}`} />)} More</div></div>
      </section>}
      <section className="method-section"><div><span className="method-number">01 / COMMITS</span><h3>Work that counts.</h3><p>GitHub’s contribution rules apply. These are commit contributions, not every commit on every branch.</p></div><div><span className="method-number">02 / LANGUAGES</span><h3>Your code’s palette.</h3><p>Language percentages describe current code bytes in up to 100 public repositories you committed to that year. They don’t measure code you personally wrote.</p></div><div><span className="method-number">03 / STREAKS</span><h3>Keep showing up.</h3><p>Streaks include all contribution types on GitHub’s calendar. Current-year recaps cover the year so far.</p></div></section>
    </main>
    <footer className="site-footer"><span>Built for the love of building.</span><a href={REPOSITORY} target="_blank" rel="noreferrer">Open source on GitHub ↗</a><span>Unofficial. Not affiliated with GitHub.</span></footer>
  </div>;
}
