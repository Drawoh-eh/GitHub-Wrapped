# GitHub Wrapped

**Turn your GitHub year into a story.**

The commits. The languages. The days you kept going. Generate a yearly recap and download a **1080 × 1350 PNG** to share.

![GitHub Wrapped recap interface](docs/screenshot.png)

[View the downloadable sample card](docs/demo-card.png)

## What v0.2 does

- Enter a GitHub username and choose a year from 2008 to the current year.
- See commit contributions, repositories committed to, top languages, and most productive month.
- Explore monthly commits, the contribution calendar, active days, busiest day, and longest contribution streak.
- Download a PNG or share a public production link that preserves the year, theme, and language.
- Choose Lime, Violet, or Mono card themes and switch between English and Chinese.
- See your GitHub avatar and display name, a rule-based builder title, and your most-contributed public repository.
- Use the same card composition for the responsive preview and the PNG export.
- Try a clearly labeled demo without a GitHub token.
- No login, database, or paid AI API required.

## Run locally

Requires **Node.js 22+** and npm.

```bash
git clone https://github.com/Drawoh-eh/GitHub-Wrapped.git
cd GitHub-Wrapped
npm ci
cp .env.example .env.local
npm run dev
```

Open [localhost:3000](http://localhost:3000). The demo works immediately. To enable real recaps, add a GitHub token to `.env.local` and restart the dev server:

```env
GITHUB_TOKEN=your_server_only_token
```

For public-data hosting, prefer a **fine-grained personal access token** with **Public repositories** selected and no additional account or repository permissions. GitHub grants fine-grained tokens read access to public repositories. If you use a classic token instead, select only `public_repo`, as required by GitHub’s GraphQL documentation. Never commit the token or prefix it with `NEXT_PUBLIC_`. The connected GitHub app used to edit this repository does **not** automatically give the deployed application an API token. Broad classic tokens with `repo`, `user`, or `read:user` scope are rejected. If using a fine-grained token, grant only the minimum public access; do not grant private-repository or private-user permissions.

Create a fine-grained token from [GitHub token settings](https://github.com/settings/personal-access-tokens/new). See [GraphQL authentication requirements](https://docs.github.com/en/graphql/guides/forming-calls-with-graphql). Follow [GitHub's token guidance](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).

## Deploy to Vercel

1. Import `Drawoh-eh/GitHub-Wrapped` into Vercel and keep its Next.js defaults.
2. Add the server environment variable `GITHUB_TOKEN` for the environments where you want real recaps.
3. Deploy. If you add or change the token after deployment, redeploy.

You can deploy without a token to preview the app and use the demo; real requests show a configuration message. This app needs a server runtime, so it cannot be deployed as a plain GitHub Pages static export.

## Metric definitions

| Metric | Definition |
| --- | --- |
| Commit contributions | `ContributionsCollection.totalCommitContributions`; GitHub's contribution rules apply. This is not every commit on every branch. |
| Repositories | `totalRepositoriesWithContributedCommits`; not all owned repos or newly created repos. |
| Monthly commits | A separate `totalCommitContributions` query for each elapsed calendar month. No daily-record pagination truncation. Earliest month wins ties. |
| Language mix | Sum current language bytes in public repositories with commit contributions during the selected year. Up to 100 repositories and 100 languages each; incomplete coverage is labeled. It is not a measure of code personally written that year or a historical language snapshot. |
| Contributions / active days | All types in GitHub's contribution calendar, including commits, issues, PRs and reviews. |
| Longest streak | Consecutive calendar dates with any contribution, within the selected year. |
| Busiest day | Date with most calendar contributions, not most commits. Earliest date wins ties. |
| Top public repository | Highest `commitContributionsByRepository.contributions.totalCount` among the returned public repositories (up to 100). Repository name breaks ties. Missing coverage is labeled. |
| Builder title | In priority order: streak ≥ 7 days → Steady Builder; ≥ 5 contributed repositories → Project Explorer; any commits → Code Builder; otherwise A New Chapter. These are fun labels, not productivity scores. |
| Current year | Year to date, through the query date. Future months remain zero. |

Dates follow GitHub's calendar buckets. We do not infer coding hours or a timezone from daily aggregates. Publicly shared private-contribution counts may affect the calendar as GitHub exposes them; the application never returns private repository names. The token must be configured for public data only.

More: [GitHub contribution rules](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-settings-on-your-profile/troubleshooting-missing-contributions), [GraphQL user reference](https://docs.github.com/en/graphql/reference/users).

## Architecture

```text
app/                        Home, shareable recap route, JSON and PNG APIs
components/                 Interactive form, share actions, recap card
lib/github.ts               Server-only GitHub fetching, cache and error handling
lib/stats.ts                Pure calculations
lib/demo.ts                 Clearly marked, deterministic sample data
lib/input.ts                Username and year validation
lib/presentation.ts         Themes, localized copy, presentation validation
lib/links.ts                Canonical public sharing origin
lib/card-assets.ts          Bundled font subsets and bounded avatar fetching
tests/                      Metric and input tests
```

Next.js App Router + TypeScript + React + CSS. PNGs use [`ImageResponse`](https://nextjs.org/docs/app/api-reference/functions/image-response). Fonts are bundled locally using [Noto Sans SC](https://fonts.google.com/noto/specimen/Noto+Sans+SC) via Fontsource (SIL Open Font License). PNG rendering loads only the required Unicode subsets. Avatars are fetched only from `avatars.githubusercontent.com`, with a three-second timeout and a monogram fallback.

### API

```text
GET /api/wrapped?username=Drawoh-eh&year=2026
GET /api/card?username=Drawoh-eh&year=2026&download=1
GET /wrapped/Drawoh-eh?year=2026
```

Append `&theme=lime|violet|mono&lang=en|zh` to PNG and recap URLs. Invalid presentation options fall back to Lime and English. The homepage also accepts these options.

Share links use `SITE_URL` in `lib/links.ts`, currently [the public production site](https://git-hub-wrapped-chi.vercel.app). Update this constant if moving to another production domain; preview deployment URLs are never used in share links.

Append `&demo=1` to use sample data. Demo stats always belong to the sample `octocat` profile and are explicitly labeled in the UI and downloaded image.

Successful real responses are cached in memory for an hour, with up to 100 entries; identical concurrent requests are coalesced. New GitHub fetches are capped at 30 per minute **per process**. These are MVP controls, not shared quotas across serverless instances. For a high-traffic public launch, add a shared cache and distributed rate limiting/WAF rules. Respect GitHub's API limits. Card errors are JSON; downloaded successes are PNG.

## Validation

```bash
npm test
npm run typecheck
npm run build
```

## Contributing

Bug reports and small pull requests are welcome. Include a reproducible example, keep data-fetching logic separate from calculations, and document any change to metric definitions. Never attach a personal access token to an issue or PR.

## Roadmap

- [x] Three card themes
- [x] English and Chinese UI and PNGs
- [x] Canonical public share links
- [x] Avatar, builder title and top public repository
- [ ] Story-style slides
- [ ] OAuth with opt-in private recaps
- [ ] Timezone-aware coding hours from paginated individual commits
- [ ] Shared caching and rate limits for larger deployments

MIT licensed. Unofficial project; not affiliated with GitHub or Spotify.
