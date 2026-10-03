import test from "node:test";
import assert from "node:assert/strict";
import { calculateStats } from "../lib/stats";
import { getDemoStats } from "../lib/demo";
import { heroQuote, parsePresentation, personaText, rhythmCaption } from "../lib/presentation";
import { recapPath, shareUrl, SITE_URL } from "../lib/links";
import type { RawWrappedData } from "../lib/types";

const raw: RawWrappedData = { username: "user", year: 2024, through: "2024-12-31", commits: 3, repositories: 2, monthlyCommits: [3], days: [], repositoryLanguages: [] };
test("top repository uses commit totals and never exposes a private repository", () => {
  const repositories = [{ name: "user/secret", private: true, count: 99 }, { name: "user/a", private: false, count: 2 }, { name: "user/b", private: false, count: 5 }];
  const stats = calculateStats({ ...raw, displayName: "  Nickname  ", repositoryLanguages: repositories.map(r => ({ contributions: { totalCount: r.count }, repository: { nameWithOwner: r.name, isPrivate: r.private, languages: { edges: [], pageInfo: { hasNextPage: false } } } })) });
  assert.deepEqual(stats.topRepository, { name: "user/b", commits: 5 });
  assert.deepEqual(stats.topRepositories, [{ name: "user/b", commits: 5 }, { name: "user/a", commits: 2 }]);
  assert.equal(stats.displayName, "Nickname");
  assert.equal(calculateStats(raw).displayName, "user");
  assert.equal(calculateStats(raw).topRepository, null);
  assert.equal(calculateStats(raw).topRepositoryIncomplete, true);
});
test("developer DNA combines stack, habit and achievement while coding rhythm uses contribution calendar dates", () => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = `2024-01-0${i + 1}`;
    const counts = [2, 0, 0, 0, 0, 5, 3];
    return { date, contributionCount: counts[i] };
  });
  const stats = calculateStats({
    ...raw,
    commits: 120,
    repositories: 2,
    days,
    monthlyCommits: [10, 1],
    repositoryLanguages: [
      { contributions: { totalCount: 90 }, repository: { nameWithOwner: "user/main", isPrivate: false, languages: { edges: [{ size: 800, node: { name: "Python", color: "#3572a5" } }, { size: 200, node: { name: "TypeScript", color: "#3178c6" } }], pageInfo: { hasNextPage: false } } } },
      { contributions: { totalCount: 10 }, repository: { nameWithOwner: "user/side", isPrivate: false, languages: { edges: [{ size: 100, node: { name: "Python", color: "#3572a5" } }], pageInfo: { hasNextPage: false } } } },
    ],
  });
  assert.equal(Math.round(stats.codingRhythm.weekendEnergy), 80);
  assert.equal(stats.codingRhythm.favoriteDay, "Saturday");
  assert.equal(stats.codingRhythm.activeMonths, 2);
  assert.equal(Math.round(stats.codingRhythm.consistency), 43);
  assert.deepEqual(stats.personalityTags.map(tag => tag.label), ["Pythonista", "Weekend Warrior", "Deep Diver"]);
});

test("non-commit activity is recognized as community contribution rather than an empty year", () => {
  const stats = calculateStats({
    ...raw,
    commits: 0,
    repositories: 0,
    monthlyCommits: [],
    days: [{ date: "2024-01-01", contributionCount: 1 }],
  });
  assert.equal(stats.personalityTags.at(-1)?.label, "Community Contributor");
});

test("fun titles have explicit thresholds and prioritize a seven-day streak", () => {
  assert.equal(calculateStats({ ...raw, commits: 0, repositories: 0 }).persona, "beginning");
  assert.equal(calculateStats(raw).persona, "builder");
  assert.equal(calculateStats({ ...raw, repositories: 5 }).persona, "explorer");
  const stats = calculateStats({ ...raw, repositories: 5, days: Array.from({ length: 7 }, (_, i) => ({ date: `2024-01-0${i + 1}`, contributionCount: 1 })) });
  assert.equal(stats.persona, "steady");
  assert.equal(personaText(stats), "Steady Builder");
});
test("poster storytelling copy is deterministic and follows developer DNA", () => {
  const demo = getDemoStats(2024);
  assert.deepEqual(heroQuote({
    ...demo,
    personalityTags: [
      { label: "Pythonista", category: "stack" },
      { label: "Weekend Warrior", category: "habit" },
      { label: "Deep Diver", category: "achievement" },
    ],
  }), { line1: "Weekends were", line2: "made for shipping.", note: "apparently." });
  assert.equal(rhythmCaption({ ...demo, codingRhythm: { ...demo.codingRhythm, weekendEnergy: 42 } }), "Your keyboard doesn't know weekends.");
  assert.equal(rhythmCaption({ ...demo, codingRhythm: { ...demo.codingRhythm, weekendEnergy: 8 } }), "Weekends stayed mostly untouched.");
  assert.deepEqual(heroQuote({
    ...demo,
    personalityTags: [{ label: "A New Chapter", category: "achievement" }],
  }), { line1: "Every story", line2: "starts somewhere.", note: "this one is yours." });
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

// Social crawlers must receive the same year/theme/demo identity as the shared page.
import { socialMetadata } from "../lib/social";
test("social metadata preserves demo identity and uses a stable public image URL", () => {
  const demo = socialMetadata(getDemoStats(2025), "violet");
  assert.match(String(demo.title), /Demo/);
  assert.match(String(demo.description), /Sample data/);
  const og = demo.openGraph as { url: string; images: { url: string; width: number; height: number }[] };
  const image = new URL(og.images[0].url);
  assert.equal(image.origin, SITE_URL);
  assert.deepEqual(Object.fromEntries(image.searchParams), { username: "octocat", year: "2025", theme: "violet", demo: "1" });
  assert.equal(og.images[0].width, 1200);
  assert.equal(og.images[0].height, 630);
  assert.equal(og.url, shareUrl(getDemoStats(2025), "violet"));
  const live = socialMetadata({ ...getDemoStats(2025), username: "user", isDemo: false }, "mono");
  assert.doesNotMatch(String(live.title), /Demo/);
  assert.doesNotMatch(String(live.description), /Sample data/);
  assert.equal(socialMetadata().alternates?.canonical, SITE_URL);
});
