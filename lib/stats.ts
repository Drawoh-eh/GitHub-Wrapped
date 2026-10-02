import type { ContributionDay, RawWrappedData, RepositoryLanguages, WrappedStats } from "./types";

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function calculateLongestStreak(days: ContributionDay[]) {
  let longest = 0, current = 0, previous = "";
  for (const day of [...days].sort((a, b) => a.date.localeCompare(b.date))) {
    const consecutive = previous && Date.parse(day.date) - Date.parse(previous) === 86_400_000;
    current = day.contributionCount > 0 ? (consecutive ? current + 1 : 1) : 0;
    longest = Math.max(longest, current);
    previous = day.date;
  }
  return longest;
}

export function calculateLanguageStats(repos: RepositoryLanguages[]) {
  const totals = new Map<string, { bytes: number; color: string }>();
  for (const { repository } of repos) {
    if (repository.isPrivate) continue;
    for (const { size, node } of repository.languages.edges) {
      const old = totals.get(node.name);
      totals.set(node.name, { bytes: (old?.bytes ?? 0) + size, color: node.color ?? "#a3a3a3" });
    }
  }
  const total = [...totals.values()].reduce((sum, lang) => sum + lang.bytes, 0);
  return [...totals.entries()].filter(([, l]) => l.bytes > 0)
    .map(([name, language]) => ({ name, ...language, percentage: language.bytes / total * 100 }))
    .sort((a, b) => b.bytes - a.bytes || a.name.localeCompare(b.name));
}

export function calculateStats(raw: RawWrappedData, isDemo = false): WrappedStats {
  const days = raw.days.filter(day => day.date.startsWith(`${raw.year}-`) && day.date <= raw.through)
    .sort((a, b) => a.date.localeCompare(b.date));
  const months = MONTHS.map((name, i) => ({ name, count: raw.monthlyCommits[i] ?? 0 }));
  const best = months.reduce((a, b) => b.count > a.count ? b : a);
  const busiest = days.reduce<ContributionDay | null>((a, b) => !a || b.contributionCount > a.contributionCount ? b : a, null);
  return {
    username: raw.username, year: raw.year, through: raw.through, isDemo,
    commits: raw.commits, repositories: raw.repositories,
    contributions: days.reduce((n, day) => n + day.contributionCount, 0),
    activeDays: days.filter(day => day.contributionCount > 0).length,
    longestStreak: calculateLongestStreak(days),
    mostProductiveMonth: best.count > 0 ? best : null,
    busiestDay: busiest && busiest.contributionCount > 0 ? busiest : null,
    months, days, languages: calculateLanguageStats(raw.repositoryLanguages),
    languagesIncomplete: raw.repositories > raw.repositoryLanguages.length || raw.repositoryLanguages.some(r => !r.repository.isPrivate && r.repository.languages.pageInfo.hasNextPage),
  };
}
