import type { ContributionDay, DeveloperTag, Language, RawWrappedData, RepositoryLanguages, WrappedStats } from "./types";

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function contributionCutoff(days: ContributionDay[], year: number, utcThrough: string) {
  // GitHub buckets commits by their recorded date; a contribution can already
  // belong to the next date while UTC is still on the previous date.
  return days.reduce((through, day) => day.date.startsWith(`${year}-`) && day.contributionCount > 0 && day.date > through ? day.date : through, utcThrough);
}

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
  if (total === 0) return [];
  return [...totals.entries()].filter(([, l]) => l.bytes > 0)
    .map(([name, language]) => ({ name, ...language, percentage: language.bytes / total * 100 }))
    .sort((a, b) => b.bytes - a.bytes || a.name.localeCompare(b.name));
}

function calculateCodingRhythm(days: ContributionDay[], monthlyCommits: number[]) {
  const totals = Array<number>(7).fill(0);
  let weekend = 0, total = 0;
  for (const day of days) {
    if (day.contributionCount <= 0) continue;
    const weekday = new Date(`${day.date}T00:00:00Z`).getUTCDay();
    totals[weekday] += day.contributionCount;
    total += day.contributionCount;
    if (weekday === 0 || weekday === 6) weekend += day.contributionCount;
  }
  const favoriteIndex = totals.reduce((best, value, index) => value > totals[best] ? index : best, 0);
  const activeDays = days.filter(day => day.contributionCount > 0).length;
  return {
    weekendEnergy: total ? weekend / total * 100 : 0,
    favoriteDay: total ? WEEKDAYS[favoriteIndex] : null,
    activeMonths: monthlyCommits.filter(count => count > 0).length,
    consistency: days.length ? activeDays / days.length * 100 : 0,
  };
}

function stackTag(languages: Language[]): DeveloperTag | null {
  const top = languages[0];
  if (!top) return null;
  const specialists: Record<string, string> = {
    Python: "Pythonista",
    TypeScript: "TypeScript Native",
    JavaScript: "JavaScript Specialist",
    Rust: "Rustacean",
    Go: "Go Gopher",
    Java: "Java Builder",
    "C++": "C++ Crafter",
    C: "C Builder",
    Kotlin: "Kotlin Coder",
    Swift: "Swift Builder",
    Ruby: "Rubyist",
    PHP: "PHP Builder",
  };
  if (top.percentage >= 70 && specialists[top.name]) return { label: specialists[top.name], category: "stack" };
  if (languages.filter(language => language.percentage >= 5).length >= 4) return { label: "Polyglot", category: "stack" };
  if (top.percentage >= 80) return { label: `${top.name} Loyalist`, category: "stack" };
  if (languages.length >= 2) return { label: "Mixed Stack", category: "stack" };
  return { label: top.name, category: "stack" };
}

function habitTag(weekendEnergy: number, activeMonths: number, favoriteDay: string | null, activeDays: number): DeveloperTag | null {
  if (activeDays < 7) return null;
  if (weekendEnergy >= 40) return { label: "Weekend Warrior", category: "habit" };
  if (weekendEnergy >= 25) return { label: "Weekend Hacker", category: "habit" };
  if (activeMonths === 12) return { label: "Year-Round Coder", category: "habit" };
  if (activeMonths >= 10) return { label: "All-Year Coder", category: "habit" };
  if (favoriteDay === "Monday") return { label: "Monday Starter", category: "habit" };
  if (favoriteDay === "Friday") return { label: "Friday Finisher", category: "habit" };
  if (weekendEnergy <= 10) return { label: "Weekday Regular", category: "habit" };
  return { label: "Balanced Builder", category: "habit" };
}

function achievementTag(raw: RawWrappedData, streak: number, topRepoFocus: number, activeDays: number): DeveloperTag {
  if (raw.commits === 0 && activeDays === 0) return { label: "Dreaming in Code", category: "achievement" };
  if (raw.commits === 0) return { label: "Community Contributor", category: "achievement" };
  const contributions = raw.days.filter(day => day.date.startsWith(`${raw.year}-`) && day.date <= raw.through).reduce((sum, day) => sum + day.contributionCount, 0);
  if (raw.commits === 1 && contributions === 1) return { label: "One-Hit Wonder", category: "achievement" };
  if (raw.commits <= 10 && contributions <= 10) return { label: "Side Quest Mode", category: "achievement" };
  if (streak >= 30) return { label: "Streak Master", category: "achievement" };
  if (streak >= 14) return { label: "On a Roll", category: "achievement" };
  if (activeDays >= 250) return { label: "Always Shipping", category: "achievement" };
  if (activeDays >= 150) return { label: "Frequent Shipper", category: "achievement" };
  if (topRepoFocus >= 70 && raw.commits >= 20 && activeDays >= 7 && raw.repositories <= raw.repositoryLanguages.length) return { label: "Deep Diver", category: "achievement" };
  if (raw.repositories >= 20) return { label: "Repo Ranger", category: "achievement" };
  if (raw.repositories >= 10) return { label: "Project Explorer", category: "achievement" };
  if (raw.commits >= 1000) return { label: "Four-Digit Club", category: "achievement" };
  if (raw.commits >= 500) return { label: "Commit Machine", category: "achievement" };
  if (raw.commits >= 250) return { label: "High Output", category: "achievement" };
  if (raw.commits >= 100) return { label: "Century Club", category: "achievement" };
  if (streak >= 7) return { label: "Steady Builder", category: "achievement" };
  if (raw.repositories >= 5) return { label: "Multi-Repo Builder", category: "achievement" };
  return { label: "Code Builder", category: "achievement" };
}

export function calculateStats(raw: RawWrappedData, isDemo = false): WrappedStats {
  const days = raw.days.filter(day => day.date.startsWith(`${raw.year}-`) && day.date <= raw.through)
    .sort((a, b) => a.date.localeCompare(b.date));
  const months = MONTHS.map((name, i) => ({ name, count: raw.monthlyCommits[i] ?? 0 }));
  const best = months.reduce((a, b) => b.count > a.count ? b : a);
  const busiest = days.reduce<ContributionDay | null>((a, b) => !a || b.contributionCount > a.contributionCount ? b : a, null);
  const publicRepositories = raw.repositoryLanguages
    .filter(r => !r.repository.isPrivate && r.repository.nameWithOwner && (r.contributions?.totalCount ?? 0) > 0)
    .sort((a, b) => (b.contributions?.totalCount ?? 0) - (a.contributions?.totalCount ?? 0) || a.repository.nameWithOwner!.localeCompare(b.repository.nameWithOwner!));
  const topRepositories = publicRepositories.slice(0, 2).map(repo => ({ name: repo.repository.nameWithOwner!, commits: repo.contributions!.totalCount }));
  const publicRepoCommits = publicRepositories.reduce((sum, repo) => sum + (repo.contributions?.totalCount ?? 0), 0);
  const topRepoFocus = publicRepoCommits && topRepositories[0] ? topRepositories[0].commits / publicRepoCommits * 100 : 0;
  const streak = calculateLongestStreak(days);
  const languages = calculateLanguageStats(raw.repositoryLanguages);
  const codingRhythm = calculateCodingRhythm(days, raw.monthlyCommits);
  const activeDays = days.filter(day => day.contributionCount > 0).length;
  const personalityTags = [
    stackTag(languages),
    habitTag(codingRhythm.weekendEnergy, codingRhythm.activeMonths, codingRhythm.favoriteDay, activeDays),
    achievementTag(raw, streak, topRepoFocus, activeDays),
  ].filter((tag): tag is DeveloperTag => Boolean(tag));

  return {
    displayName: raw.displayName?.trim() || raw.username,
    avatarUrl: raw.avatarUrl ?? null,
    topRepository: topRepositories[0] ?? null,
    topRepositories,
    topRepositoryIncomplete: raw.repositories > raw.repositoryLanguages.length,
    persona: streak >= 7 ? "steady" : raw.repositories >= 5 ? "explorer" : raw.commits > 0 ? "builder" : "beginning",
    personalityTags,
    codingRhythm,
    username: raw.username, year: raw.year, through: raw.through, isDemo,
    commits: raw.commits, repositories: raw.repositories,
    contributions: days.reduce((n, day) => n + day.contributionCount, 0),
    activeDays,
    longestStreak: streak,
    mostProductiveMonth: best.count > 0 ? best : null,
    busiestDay: busiest && busiest.contributionCount > 0 ? busiest : null,
    months, days, languages,
    languagesIncomplete: raw.repositories > raw.repositoryLanguages.length || raw.repositoryLanguages.some(r => !r.repository.isPrivate && r.repository.languages.pageInfo.hasNextPage),
  };
}
