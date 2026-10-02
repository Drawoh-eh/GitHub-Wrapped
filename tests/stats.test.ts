import test from "node:test";
import assert from "node:assert/strict";
import { calculateLanguageStats, calculateLongestStreak, calculateStats } from "../lib/stats";
import { parseInput } from "../lib/input";
import { getDemoStats } from "../lib/demo";
import type { RawWrappedData, RepositoryLanguages } from "../lib/types";

test("streaks break on zero-contribution and missing days, including leap days", () => {
  assert.equal(calculateLongestStreak([
    { date: "2024-03-01", contributionCount: 1 },
    { date: "2024-02-28", contributionCount: 3 },
    { date: "2024-02-29", contributionCount: 2 },
    { date: "2024-03-03", contributionCount: 7 },
    { date: "2024-03-04", contributionCount: 0 },
    { date: "2024-03-05", contributionCount: 1 },
  ]), 3);
});

const repo = (isPrivate: boolean, edges: { size: number; node: { name: string; color: string | null } }[]): RepositoryLanguages => ({ repository: { isPrivate, languages: { edges, pageInfo: { hasNextPage: false } } } });

test("languages are byte-weighted across public repositories, not averages of percentages", () => {
  const result = calculateLanguageStats([
    repo(false, [{ size: 100, node: { name: "Python", color: null } }]),
    repo(false, [{ size: 900, node: { name: "TypeScript", color: "#3178c6" } }]),
    repo(true, [{ size: 99999, node: { name: "Secret", color: null } }]),
  ]);
  assert.deepEqual(result.map(l => [l.name, l.percentage]), [["TypeScript", 90], ["Python", 10]]);
  assert.deepEqual(calculateLanguageStats([]), []);
  assert.deepEqual(calculateLanguageStats([repo(false, [{ size: 0, node: { name: "Python", color: null } }])]), []);
});

test("no activity produces honest empty results, and calendar excludes adjacent years and future dates", () => {
  const raw: RawWrappedData = { username: "test", year: 2024, through: "2024-01-02", commits: 0, repositories: 0, monthlyCommits: [], repositoryLanguages: [], days: [
    { date: "2023-12-31", contributionCount: 9 }, { date: "2024-01-01", contributionCount: 0 },
    { date: "2024-01-02", contributionCount: 0 }, { date: "2024-01-03", contributionCount: 9 },
  ] };
  const result = calculateStats(raw);
  assert.equal(result.activeDays, 0); assert.equal(result.contributions, 0);
  assert.equal(result.mostProductiveMonth, null); assert.equal(result.busiestDay, null);
  assert.equal(result.months.length, 12); assert.equal(result.days.length, 2);
});

test("most productive month uses commits while streaks and busiest day use all contributions", () => {
  const result = calculateStats({ username: "test", year: 2024, through: "2024-12-31", commits: 20, repositories: 101,
    monthlyCommits: [10, 10], repositoryLanguages: [], days: [{ date: "2024-01-01", contributionCount: 99 }] });
  assert.deepEqual(result.mostProductiveMonth, { name: "January", count: 10 });
  assert.equal(result.commits, 20); assert.equal(result.contributions, 99);
  assert.equal(result.languagesIncomplete, true);
});

test("username and year validation prevents malformed or future requests", () => {
  const now = new Date("2026-10-02T13:00:00Z");
  assert.equal(parseInput(" Drawoh-eh ", "2026", now).to, now.toISOString());
  assert.equal(parseInput("a", 2024, now).to, "2024-12-31T23:59:59Z");
  for (const username of ["", "-user", "user-", "a--b", "https://github.com/a", "a/b", "a".repeat(40)]) assert.throws(() => parseInput(username, 2026, now));
  for (const year of [2007, 2027, "2026abc", "NaN", ""]) assert.throws(() => parseInput("octocat", year, now));
});

test("demo is clearly marked and internally consistent", () => {
  const demo = getDemoStats(2024);
  assert.equal(demo.isDemo, true); assert.equal(demo.days.length, 366);
  assert.equal(demo.commits, demo.months.reduce((sum, m) => sum + m.count, 0));
  assert.equal(demo.commits, demo.contributions);
  assert.equal(demo.languagesIncomplete, false);
});
