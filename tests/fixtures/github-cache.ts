import assert from "node:assert/strict";
import { getWrapped } from "../../lib/github";

// Run in a child process so server-only imports and the fake clock stay isolated.
async function main() {
const RealDate = Date;
let now = RealDate.parse("2026-10-02T12:00:00Z");
class Clock extends RealDate {
  constructor(value?: string | number) { super(value ?? now); }
  static now() { return now; }
}
globalThis.Date = Clock as DateConstructor;
process.env.GITHUB_TOKEN = "test-only-placeholder";
let calls = 0;
globalThis.fetch = async (_url, options) => {
  calls++;
  const body = JSON.parse(String(options?.body));
  assert.match(body.query, /contributionDays \{ date contributionCount contributionLevel \}/);
  const day = new RealDate(now).toISOString().slice(0, 10);
  return Response.json({ data: { user: { login: "test", name: "Test", avatarUrl: null, annual: {
    totalCommitContributions: 0, totalRepositoriesWithContributedCommits: 0,
    contributionCalendar: { weeks: [{ contributionDays: [{ date: day, contributionCount: calls, contributionLevel: "FIRST_QUARTILE" }] }] },
    commitContributionsByRepository: [],
  } } } });
};

const [first, coalesced] = await Promise.all([getWrapped("test", 2026), getWrapped("TEST", 2026)]);
assert.equal(calls, 1);
assert.equal(first, coalesced);
assert.equal(first.isDemo, false);
assert.equal(first.days[0].contributionLevel, "FIRST_QUARTILE");
assert.equal(first.fetchedAt, "2026-10-02T12:00:00.000Z");
now += 4 * 60_000;
assert.equal(await getWrapped("test", 2026), first);
assert.equal(calls, 1);
now += 2 * 60_000;
assert.notEqual(await getWrapped("test", 2026), first);
assert.equal(calls, 2);

now = RealDate.parse("2026-10-02T23:59:00Z");
await getWrapped("test", 2026);
assert.equal(calls, 3);
now += 2 * 60_000;
const tomorrow = await getWrapped("test", 2026);
assert.equal(calls, 4);
assert.equal(tomorrow.through, "2026-10-03");

const past = await getWrapped("test", 2025);
assert.equal(calls, 5);
now += 6 * 60_000;
assert.equal(await getWrapped("test", 2025), past);
assert.equal(calls, 5);
now += 60 * 60_000;
assert.notEqual(await getWrapped("test", 2025), past);
assert.equal(calls, 6);
console.log("GitHub levels, concurrent lookups, 5-minute freshness, UTC rollover and past-year caching verified");

}
main().catch(error => { console.error(error); process.exit(1); });
