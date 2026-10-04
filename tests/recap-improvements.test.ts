import test from "node:test";
import assert from "node:assert/strict";
import { parseInput } from "../lib/input";
import { annualCalendarWeeks, contributionIntensity } from "../lib/calendar";
import { createImageCache } from "../lib/image-cache";
import { calculateStats } from "../lib/stats";
import { heroQuote } from "../lib/presentation";
import { resolveSiteUrl } from "../lib/links";
import type { RawWrappedData } from "../lib/types";

test("self-hosted links accept one explicit HTTPS origin", () => {
  assert.equal(resolveSiteUrl(" https://wrapped.example.com/ "), "https://wrapped.example.com");
  assert.equal(resolveSiteUrl(), "https://git-hub-wrapped-chi.vercel.app");
  for (const invalid of ["javascript:alert(1)", "http://example.com", "https://a:b@example.com", "https://example.com/path", "https://example.com?x=1"]) assert.throws(() => resolveSiteUrl(invalid));
});

test("profile inputs normalize safely and reject repositories and lookalike hosts", () => {
  for (const input of ["Drawoh-eh", " @Drawoh-eh ", "https://github.com/Drawoh-eh/", "github.com/Drawoh-eh", "https://www.github.com/Drawoh-eh?tab=repositories#top"]) {
    assert.equal(parseInput(input, 2025).username, "Drawoh-eh");
  }
  for (const input of ["https://github.com.evil.test/user", "https://evil.test/user", "https://github.com/user/repo", "https://user@github.com/user", "https://github.com:8443/user", "@@user", "https://github.com/", "https://github.com/a%2Fb"]) {
    assert.throws(() => parseInput(input, 2025));
  }
});

test("poster calendar retains every date, including leap years and early contributions", () => {
  for (const year of [2024, 2025, 2028]) {
    const length = year === 2025 ? 365 : 366;
    const days = Array.from({ length }, (_, i) => ({ date: new Date(Date.UTC(year, 0, i + 1)).toISOString().slice(0, 10), contributionCount: i === 0 ? 99 : 0 }));
    const weeks = annualCalendarWeeks(days, year);
    assert.deepEqual(weeks.flat().filter(Boolean), days);
    assert.equal(weeks.flat().findIndex(Boolean), new Date(Date.UTC(year, 0, 1)).getUTCDay());
    assert.ok(weeks.length <= 54);
    assert.ok(weeks.every(week => week.length === 7));
  }
  assert.equal(annualCalendarWeeks([{ date: "2026-01-01", contributionCount: 1 }], 2026).flat().filter(Boolean).length, 1);
  assert.equal(contributionIntensity({ date: "2025-01-01", contributionCount: 100, contributionLevel: "FIRST_QUARTILE" }), 1);
});

const base: RawWrappedData = { username: "test", year: 2025, through: "2025-12-31", commits: 0, repositories: 0, monthlyCommits: [], repositoryLanguages: [], days: [] };
test("quiet recaps get friendly titles without inferring a habit from one day", () => {
  const empty = calculateStats(base);
  assert.equal(empty.personalityTags.at(-1)?.label, "Dreaming in Code");
  assert.equal(heroQuote(empty).line1, "Plotting the");
  for (const count of [1, 2, 10, 11]) {
    const stats = calculateStats({ ...base, commits: count, days: [{ date: "2025-01-04", contributionCount: count }] });
    assert.equal(stats.personalityTags.some(tag => tag.category === "habit"), false);
    assert.equal(stats.personalityTags.at(-1)?.label, count === 1 ? "One-Hit Wonder" : count <= 10 ? "Side Quest Mode" : "Code Builder");
  }
  assert.equal(calculateStats({ ...base, days: [{ date: "2025-01-04", contributionCount: 1 }] }).personalityTags.at(-1)?.label, "Community Contributor");
});

test("weekend and focus titles require enough activity and complete repository coverage", () => {
  const days = Array.from({ length: 7 }, (_, i) => ({ date: `2025-01-${String(4 + i * 7).padStart(2, "0")}`, contributionCount: 3 }));
  // Seven Saturdays spread across January and February.
  days.forEach((day, i) => { day.date = new Date(Date.UTC(2025, 0, 4 + i * 7)).toISOString().slice(0, 10); });
  const raw = { ...base, commits: 21, repositories: 1, days, repositoryLanguages: [{ contributions: { totalCount: 21 }, repository: { nameWithOwner: "test/main", isPrivate: false, languages: { edges: [], pageInfo: { hasNextPage: false } } } }] };
  assert.deepEqual(calculateStats(raw).personalityTags.map(tag => tag.label), ["Weekend Warrior", "Deep Diver"]);
  assert.equal(calculateStats({ ...raw, days: days.slice(0, 6) }).personalityTags.some(tag => tag.category === "habit" || tag.label === "Deep Diver"), false);
  assert.equal(calculateStats({ ...raw, repositories: 2 }).personalityTags.some(tag => tag.label === "Deep Diver"), false);
});

test("image cache shares pending and completed renders, isolates keys and retries failures", async () => {
  const cached = createImageCache();
  let renders = 0;
  const render = async () => { renders++; return new Blob(["png"]); };
  const first = cached("user:2025:lime:snapshot1", render);
  assert.equal(cached("user:2025:lime:snapshot1", render), first);
  await first;
  await cached("user:2025:lime:snapshot1", render);
  assert.equal(renders, 1);
  await cached("user:2025:violet:snapshot1", render);
  await cached("user:2025:lime:snapshot2", render);
  assert.equal(renders, 3);
  await assert.rejects(cached("failed", async () => { throw new Error("offline"); }));
  await cached("failed", render);
  assert.equal(renders, 4);
});
