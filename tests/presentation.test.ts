import test from "node:test";
import assert from "node:assert/strict";
import { calculateStats } from "../lib/stats";
import { getDemoStats } from "../lib/demo";
import { parsePresentation, personaText } from "../lib/presentation";
import { recapPath, shareUrl, SITE_URL } from "../lib/links";
import type { RawWrappedData } from "../lib/types";

const raw: RawWrappedData = { username: "user", year: 2024, through: "2024-12-31", commits: 3, repositories: 2, monthlyCommits: [3], days: [], repositoryLanguages: [] };
test("top repository uses commit totals and never exposes a private repository", () => {
  const repositories = [{ name: "user/secret", private: true, count: 99 }, { name: "user/a", private: false, count: 2 }, { name: "user/b", private: false, count: 5 }];
  const stats = calculateStats({ ...raw, displayName: "  Nickname  ", repositoryLanguages: repositories.map(r => ({ contributions: { totalCount: r.count }, repository: { nameWithOwner: r.name, isPrivate: r.private, languages: { edges: [], pageInfo: { hasNextPage: false } } } })) });
  assert.deepEqual(stats.topRepository, { name: "user/b", commits: 5 });
  assert.equal(stats.displayName, "Nickname");
  assert.equal(calculateStats(raw).displayName, "user");
  assert.equal(calculateStats(raw).topRepository, null);
  assert.equal(calculateStats(raw).topRepositoryIncomplete, true);
});
test("fun titles have explicit thresholds and prioritize a seven-day streak", () => {
  assert.equal(calculateStats({ ...raw, commits: 0, repositories: 0 }).persona, "beginning");
  assert.equal(calculateStats(raw).persona, "builder");
  assert.equal(calculateStats({ ...raw, repositories: 5 }).persona, "explorer");
  const stats = calculateStats({ ...raw, repositories: 5, days: Array.from({ length: 7 }, (_, i) => ({ date: `2024-01-0${i + 1}`, contributionCount: 1 })) });
  assert.equal(stats.persona, "steady");
  assert.equal(personaText(stats), "Steady Builder");
});
test("share links use the public origin and preserve year, theme and demo mode", () => {
  const stats = getDemoStats(2024);
  const url = new URL(shareUrl(stats, "violet"));
  assert.equal(url.origin, SITE_URL);
  assert.equal(url.pathname, "/wrapped/octocat");
  assert.deepEqual(Object.fromEntries(url.searchParams), { year: "2024", theme: "violet", demo: "1" });
  assert.equal(new URL(SITE_URL + recapPath({ username: "a", year: 2024, isDemo: false }, "mono")).searchParams.has("demo"), false);
  assert.deepEqual(parsePresentation("bad"), { theme: "lime" });
});
