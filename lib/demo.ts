import { calculateStats } from "./stats";
import { parseInput } from "./input";
import type { ContributionDay } from "./types";

export function getDemoStats(year = new Date().getUTCFullYear()) {
  const { from, to } = parseInput("octocat", year);
  const days: ContributionDay[] = [];
  const monthlyCommits = Array<number>(12).fill(0);
  let index = 0;
  for (let timestamp = Date.parse(from); timestamp <= Date.parse(to); timestamp += 86_400_000) {
    const date = new Date(timestamp).toISOString().slice(0, 10);
    const month = Number(date.slice(5, 7)) - 1;
    const count = index % 17 === 0 || index % 9 === 0 ? 0 : (index * 7 % 8) + 1 + (month === 7 ? 4 : 0);
    days.push({ date, contributionCount: count });
    monthlyCommits[month] += count;
    index++;
  }
  return calculateStats({
    displayName: "The Octocat", avatarUrl: null,
    username: "octocat", year, through: to.slice(0, 10),
    commits: monthlyCommits.reduce((a, b) => a + b, 0), repositories: 18, days, monthlyCommits,
    repositoryLanguages: Array.from({ length: 18 }, (_, i) => ({ contributions: { totalCount: i === 0 ? Math.ceil(monthlyCommits.reduce((a,b)=>a+b,0) / 2) : 1 }, repository: { nameWithOwner: i === 0 ? "octocat/hello-world" : `octocat/demo-${i}`, isPrivate: false, languages: {
      edges: [
        { size: 6100, node: { name: "Python", color: "#3572a5" } },
        { size: 2300, node: { name: "TypeScript", color: "#3178c6" } },
        { size: 900, node: { name: "JavaScript", color: "#f1e05a" } },
        { size: 700, node: { name: "Other", color: "#b89cff" } },
      ], pageInfo: { hasNextPage: false },
    } } })),
  }, true);
}
