# Data & API reference

[← Back to README](../README.md) · [中文说明](../README.zh-CN.md)

## Metric definitions

| Metric | Definition |
| --- | --- |
| Commit contributions | `ContributionsCollection.totalCommitContributions`. GitHub contribution rules apply; this is not every commit on every branch. |
| Repositories | `totalRepositoriesWithContributedCommits`, not all owned repositories or newly created repositories. |
| Monthly commits | A separate `totalCommitContributions` query for each elapsed calendar month, through its month-end boundary. No daily-record pagination truncation. Earliest month wins ties. |
| Language mix | Sum current language bytes in public repositories with commit contributions during the selected year. Maximum 100 repositories and 100 languages each; incomplete coverage is labeled. Not code personally written that year or a historical language snapshot. |
| Contributions / active days | All types in GitHub’s contribution calendar, including commits, issues, PRs, and reviews. Counts and relative intensity levels come directly from GitHub; colors do not use fixed count thresholds. |
| Longest streak | Consecutive calendar dates with any contribution, within the selected year. |
| Busiest day | Date with the most calendar contributions, not the most commits. Earliest date wins ties. |
| Main quests | Top two public repositories by `commitContributionsByRepository.contributions.totalCount` among returned repositories (maximum 100). Repository name breaks ties. Incomplete coverage is labeled. |
| Weekend energy | Share of all contribution-calendar activity that falls on Saturday or Sunday. The calendar includes commits, issues, PRs, and reviews; this is not a share of commit timestamps. |
| Favorite day | Weekday with the highest contribution-calendar count. Ties use the earliest weekday in Sunday-to-Saturday order. |
| Active months | Number of months with at least one commit contribution in the selected year. |
| Consistency | Active contribution-calendar days divided by elapsed calendar days represented in the selected-year response. |
| Developer DNA | Up to three rule-based tags: one for stack, one for rhythm, and one for yearly achievement. Examples include Pythonista, Polyglot, Weekend Warrior, Monday Starter, Year-Round Coder, Streak Master, Deep Diver, Repo Ranger, Four-Digit Club, Community Contributor, and Century Club. For fun, not a productivity score. |
| Current year | Published activity for the selected year. The calendar cutoff is the current UTC date or latest nonzero GitHub contribution date, whichever is later. Future empty dates are omitted. Future months remain zero. |

Dates follow GitHub’s calendar buckets. The annual query covers the full selected year, preserving already published contributions whose GitHub date is ahead of UTC (for example, an October 3 commit while UTC is still October 2). No source dates are shifted. Daily aggregates do not establish coding hours or a user’s timezone. Publicly shared private-contribution counts may affect calendar totals as GitHub exposes them; private repository names are excluded. Configure the server token for public data only.

Live calendars preserve GraphQL API counts and intensity levels. GitHub's API and public profile page can return different values for individual dates; this application does not rewrite dates or counts to force agreement with profile HTML. The source account, fetch time, and profile link are displayed next to the calendar.

References: [GitHub contribution rules](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-settings-on-your-profile/troubleshooting-missing-contributions), [GraphQL user reference](https://docs.github.com/en/graphql/reference/users).

## Token setup

Set `GITHUB_TOKEN` on the server. Locally, use `.env.local`; on Vercel, use project environment variables and redeploy after changes.

Prefer a fine-grained personal access token with **Public repositories** selected and no additional account or repository permissions. For a classic token, use only `public_repo`, as required by GitHub’s GraphQL authentication documentation. Broad classic scopes (`repo`, `user`, `read:user`) are rejected. Fine-grained tokens must also be configured with minimum public access and no private permissions.

Never commit the token, expose it to the browser, or prefix it with `NEXT_PUBLIC_`. The GitHub connector used for repository editing does not supply the hosted application’s token.

References: [Create a fine-grained token](https://github.com/settings/personal-access-tokens/new), [GraphQL authentication](https://docs.github.com/en/graphql/guides/forming-calls-with-graphql), [Token guidance](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).

## Routes

```text
GET /api/wrapped?username=Drawoh-eh&year=2025
GET /api/card?username=Drawoh-eh&year=2025&theme=lime&download=1
GET /wrapped/Drawoh-eh?year=2025&theme=lime
GET /api/og?username=Drawoh-eh&year=2025&theme=lime
GET /api/og
```

| Parameter | Routes | Meaning |
| --- | --- | --- |
| `username` | JSON and PNG APIs; path segment for recap pages | A valid GitHub username. |
| `year` | All recap routes | From 2008 to the current year; defaults to the current year when omitted. |
| `theme` | Homepage, recap page, PNG and social preview APIs | `lime`, `violet`, or `mono`. Invalid values fall back to `lime`. |
| `demo=1` | JSON API, PNG and social preview APIs, recap page | Deterministic sample data for `octocat`, explicitly labeled as a demo. |
| `download=1` | PNG API | Adds an attachment filename to the response. |

The interface and exported cards are English-only. Legacy `lang` parameters are ignored. A theme change removes `lang` from the page URL; new share links do not include it.

JSON successes return `WrappedStats` ([schema](../lib/types.ts)). PNG successes use `image/png` at 1080 × 1350. Errors return JSON. Share URLs always use `SITE_URL` in [`lib/links.ts`](../lib/links.ts), never a preview host or forwarded header; update it for your own public domain.

Social previews use `/api/og` at **1200 × 630**, with Open Graph and Twitter metadata on recap pages. Without a username it renders a generic project preview. If a lookup fails, it returns a generic image with `no-store`; successful previews may be cached for one hour. Social platforms may cache previews independently. Demo previews are explicitly labeled.

Image copying uses the browser’s PNG clipboard API in a secure context. Unsupported browsers keep the PNG download action; permission and rendering failures show a download fallback message.

## Runtime & caching

Current-year responses are cached in memory for five minutes; past years for one hour, with at most 100 entries. Cache keys include the UTC cutoff date, preventing reuse of yesterday's year-to-date response. The calendar displays the account, year, and fetch time. Identical concurrent queries are coalesced. New GitHub fetches are capped at 30 per minute **per process**; these controls are not distributed across serverless instances. A larger public service needs shared caching and distributed request limits.

Homepage and demo charts use generated illustrative data, not Octocat's actual GitHub activity. Each chart is labeled **SAMPLE DATA**. Only a successful non-demo lookup displays real account activity. On lookup failure, an error is shown and the preview remains explicitly labeled as sample data.

PNGs use Next.js [`ImageResponse`](https://nextjs.org/docs/app/api-reference/functions/image-response). Fonts are bundled with Fontsource; required Noto Sans SC subsets provide fallback glyphs for profile display names. Avatars are fetched only from `avatars.githubusercontent.com`, with a three-second timeout, accepted image types, a 250 KB size check, and a monogram fallback.

## Project layout

| Path | Responsibility |
| --- | --- |
| `app/` | Homepage, recap pages, JSON and PNG routes. |
| `components/` | Interactive form, theme controls, sharing, shared card layout. |
| `lib/github.ts` | Server-only GitHub queries, caching, request limits. |
| `lib/stats.ts` | Pure metric calculations. |
| `lib/demo.ts` | Clearly marked deterministic sample data. |
| `lib/input.ts` | Username and year validation. |
| `lib/presentation.ts` | English copy, themes, and developer-story labels. |
| `lib/links.ts` | Canonical public share URLs. |
| `lib/card-assets.ts` | Nickname font selection and avatar fetching. |
| `lib/image-fonts.ts` | Four shared image fonts; social images omit nickname subsets. |
| `lib/nickname-fonts.ts` | Generated literal paths for the two nickname font weights. |
| `lib/calendar.ts` | UTC month alignment and calendar keyboard navigation. |
| `tests/` | Metric, validation, sharing, and calendar tests. |

After updating `@fontsource/noto-sans-sc`, run `node scripts/generate-font-manifest.mjs` and commit the regenerated manifest. It preserves non-Latin display names while keeping unused font weights and WOFF2 files out of image functions. Fonts are read once per running process; only the subsets needed by each nickname are loaded.

Potential next steps: story-style slides, more themes, and shared caching. Private recaps and coding-hour estimates are not implemented; contribution dates are intentionally not treated as reliable commit-time data.
