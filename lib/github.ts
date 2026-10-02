import "server-only";
import { parseInput, WrappedError } from "./input";
import { calculateStats, contributionCutoff } from "./stats";
import { getDemoStats } from "./demo";
import type { ContributionDay, RepositoryLanguages, WrappedStats } from "./types";

type Collection = {
  totalCommitContributions: number;
  totalRepositoriesWithContributedCommits: number;
  contributionCalendar: { weeks: { contributionDays: ContributionDay[] }[] };
  commitContributionsByRepository: RepositoryLanguages[];
};
type User = { login: string; name: string | null; avatarUrl: string; annual: Collection } & Record<string, { totalCommitContributions: number }>;
const cache = new Map<string, { until: number; stats: WrappedStats }>();
const pending = new Map<string, Promise<WrappedStats>>();
let windowStart = 0, requests = 0;

function buildQuery(year: number, to: string) {
  // Separate monthly totals avoid truncating daily commit nodes at first:100.
  const monthly = Array.from({ length: 12 }, (_, i) => {
    const from = new Date(Date.UTC(year, i, 1)).toISOString();
    if (from > to) return "";
    const last = new Date(Date.UTC(year, i + 1, 1) - 1000).toISOString();
    // Query the full elapsed month so date buckets ahead of UTC are retained.
    return `month${i}: contributionsCollection(from: "${from}", to: "${last}") { totalCommitContributions }`;
  }).join("\n");
  return `query Wrapped($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      login
      name
      avatarUrl(size: 128)
      annual: contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalRepositoriesWithContributedCommits
        contributionCalendar { weeks { contributionDays { date contributionCount contributionLevel } } }
        commitContributionsByRepository(maxRepositories: 100) {
          contributions(first: 1) { totalCount }
          repository {
            nameWithOwner
            isPrivate
            languages(first: 100, orderBy: { field: SIZE, direction: DESC }) {
              edges { size node { name color } }
              pageInfo { hasNextPage }
            }
          }
        }
      }
      ${monthly}
    }
  }`;
}

async function fetchStats(username: string, year: number) {
  const input = parseInput(username, year);
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new WrappedError("Live recaps are not configured yet. Try the demo, or set GITHUB_TOKEN on the server.", 503);
  const now = Date.now();
  if (now - windowStart >= 60_000) { windowStart = now; requests = 0; }
  if (++requests > 30) throw new WrappedError("Lots of recaps are being made. Please try again in a minute.", 429);
  let response: Response;
  try {
    response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "User-Agent": "GitHub-Wrapped" },
      body: JSON.stringify({ query: buildQuery(year, input.to), variables: { login: input.username, from: input.from, to: `${year}-12-31T23:59:59Z` } }),
      cache: "no-store", signal: AbortSignal.timeout(25_000),
    });
  } catch { throw new WrappedError("GitHub took too long to respond. Please try again.", 502); }
  if (response.status === 401) throw new WrappedError("The server's GitHub token is invalid. The site owner needs to update it.", 503);
  if (response.status === 403 || response.status === 429) throw new WrappedError("GitHub's API limit was reached. Please try again later.", 429);
  if (!response.ok) throw new WrappedError("GitHub is unavailable right now. Please try again.", 502);
  // Public deployments must not use broad classic tokens that expose private activity.
  const scopes = (response.headers.get("x-oauth-scopes") ?? "").split(",").map(s => s.trim());
  if (scopes.some(s => ["repo", "user", "read:user"].includes(s))) {
    throw new WrappedError("Use a GitHub token with public-only access. Broad private-data tokens are not supported.", 503);
  }
  const result = await response.json() as { data?: { user: User | null }; errors?: { type?: string }[] };
  if (result.errors?.length) {
    if (result.errors.some(e => e.type === "NOT_FOUND")) throw new WrappedError("That GitHub account could not be found. Check the username.", 404);
    if (result.errors.some(e => e.type === "RATE_LIMITED")) throw new WrappedError("GitHub's API limit was reached. Please try again later.", 429);
    throw new WrappedError("GitHub couldn't generate this recap. Please try again later.", 502);
  }
  if (!result.data?.user) throw new WrappedError("That GitHub account could not be found. Check the username.", 404);
  const user = result.data.user, annual = user.annual;
  const days = annual.contributionCalendar.weeks.flatMap(w => w.contributionDays);
  return { ...calculateStats({
    displayName: user.name, avatarUrl: user.avatarUrl,
    username: user.login, year, through: contributionCutoff(days, year, input.to.slice(0, 10)),
    commits: annual.totalCommitContributions, repositories: annual.totalRepositoriesWithContributedCommits,
    days,
    monthlyCommits: Array.from({ length: 12 }, (_, i) => user[`month${i}`]?.totalCommitContributions ?? 0),
    repositoryLanguages: annual.commitContributionsByRepository,
  }), fetchedAt: new Date().toISOString() };
}

export async function getWrapped(username: string, year: number, demo = false) {
  const input = parseInput(username, year);
  if (demo) return getDemoStats(input.year);
  // A new UTC date must not reuse yesterday's year-to-date cutoff.
  const key = `${input.username.toLowerCase()}:${year}:${input.to.slice(0, 10)}`;
  const hit = cache.get(key);
  if (hit && hit.until > Date.now()) return hit.stats;
  const running = pending.get(key);
  if (running) return running;
  const promise = fetchStats(input.username, year).then(stats => {
    cache.delete(key);
    if (cache.size >= 100) cache.delete(cache.keys().next().value!);
    const ttl = year === new Date().getUTCFullYear() ? 300_000 : 3_600_000;
    cache.set(key, { until: Date.now() + ttl, stats });
    return stats;
  }).finally(() => pending.delete(key));
  pending.set(key, promise);
  return promise;
}
