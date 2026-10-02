import type { WrappedStats } from "@/lib/types";

export function WrappedCard({ stats }: { stats: WrappedStats }) {
  return <div className="recap-card" aria-label={`${stats.username}'s ${stats.year} GitHub Wrapped${stats.isDemo ? ' demo' : ''}`}>
    <div className="card-topline"><span>GITHUB WRAPPED</span><span>{stats.isDemo ? "DEMO / " : ""}{stats.year}</span></div>
    <div className="card-title">A year.<br />A lot of <em>code.</em></div>
    <div className="card-identity"><span className="avatar-code">&lt;/&gt;</span><span>@{stats.username}</span></div>
    <div className="card-commits"><strong>{stats.commits.toLocaleString("en-US")}</strong><span>commit contributions</span></div>
    <div className="card-metrics"><div><strong>{stats.repositories}</strong><span>repositories</span></div><div><strong>{stats.longestStreak}<small>d</small></strong><span>contribution streak</span></div></div>
    <div className="card-language"><span className="card-label">YOUR CODE SPEAKS</span><div className="language-track">{stats.languages.map(language => <span key={language.name} style={{ width: `${language.percentage}%`, background: language.color }} />)}</div><div className="language-legend">{stats.languages.slice(0, 3).map(l => <span key={l.name}><i style={{ background: l.color }} />{l.name} <b>{Math.round(l.percentage)}%</b></span>)}</div>{stats.languages.length === 0 && <span className="muted-card">No language data this year</span>}</div>
    <div className="card-best"><span>YOUR BIGGEST MONTH</span><strong>{stats.mostProductiveMonth?.name ?? "Your next chapter"}<span>↗</span></strong></div>
    <div className="card-bottom"><span>YOUR YEAR IN CODE.</span><span>{stats.isDemo ? "SAMPLE DATA" : `THROUGH ${stats.through}`}</span></div>
  </div>;
}
