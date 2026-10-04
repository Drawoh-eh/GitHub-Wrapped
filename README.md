<div align="center">
  <img src="public/icon.svg" width="72" alt="GitHub Wrapped logo" />
  <h1>GitHub Wrapped</h1>
  <p><strong>Your year in code. One card worth sharing.</strong></p>
  <p>A yearly GitHub recap with developer DNA, coding rhythm, languages, streaks, and main quests.</p>
  <p>
    <a href="https://git-hub-wrapped-chi.vercel.app"><strong>Make your Wrapped</strong></a>
  </p>
  <p>
    <strong>English</strong> ·
    <a href="README.zh-CN.md">简体中文</a>
  </p>
  <p>
    <a href="LICENSE"><img src="https://img.shields.io/github/license/Drawoh-eh/GitHub-Wrapped?style=flat-square&color=c8ff62" alt="MIT license" /></a>
    <a href="https://github.com/Drawoh-eh/GitHub-Wrapped/stargazers"><img src="https://img.shields.io/github/stars/Drawoh-eh/GitHub-Wrapped?style=flat-square&color=c8ff62" alt="GitHub stars" /></a>
  </p>
</div>

![GitHub Wrapped interface with a yearly recap and downloadable card](docs/screenshot.png)

## Make yours

1. Open [GitHub Wrapped](https://git-hub-wrapped-chi.vercel.app), enter your GitHub username (or paste your profile URL), and pick a year.
2. Choose a card theme: **Lime**, **Violet**, or **Mono**.
3. Download your **1080 × 1350 PNG**, copy the image in a supported browser, or share a link with a personalized preview.

Each poster includes the project address and a full-year contribution grid. Download and copy reuse the same rendered image for the selected theme. If image copying is unavailable or blocked, use **Download PNG**. Link previews keep the username, year, and theme; demo previews are labeled as sample data.

No sign-up or installation needed to use the hosted site. Want a preview first? [The demo](https://git-hub-wrapped-chi.vercel.app/wrapped/octocat?year=2025&demo=1) uses clearly labeled sample data.

## Three ways to tell your story

<table>
  <tr>
    <td align="center"><strong>Lime</strong></td>
    <td align="center"><strong>Violet</strong></td>
    <td align="center"><strong>Mono</strong></td>
  </tr>
  <tr>
    <td><a href="docs/demo-card.png"><img src="docs/demo-card.png" width="260" alt="Lime sample recap card" /></a></td>
    <td><a href="docs/demo-violet.png"><img src="docs/demo-violet.png" width="260" alt="Violet sample recap card" /></a></td>
    <td><a href="docs/demo-mono.png"><img src="docs/demo-mono.png" width="260" alt="Mono sample recap card" /></a></td>
  </tr>
</table>

All three cards show **sample data**. Click a card to see the full-size PNG.

## What’s inside

- **Your year at a glance** — commit contributions, contributed repositories, longest streak, and busiest month.
- **Developer DNA** — up to three playful tags drawn from your language mix, contribution rhythm, streaks, focus, and yearly activity.
- **Coding rhythm** — weekend energy, favorite contribution day, active months, and consistency based on GitHub’s contribution calendar.
- **Main quests** — the two public repositories with the most commit contributions in the selected year.
- **The fuller picture** — monthly activity, a contribution calendar, active days, and repository language mix. Tap or focus months and days for exact counts; browse the calendar with arrow keys.
- **A shareable result** — matching page and PNG layouts, plus links that keep your year and theme.
- **Public data, server-side access** — visitors never enter a token; self-hosters configure one on the server.
- **A small, inspectable stack** — Next.js, React, TypeScript, and GitHub’s GraphQL API. No database or AI API required.

> Language percentages describe current code bytes in public repositories you committed to, not code you personally wrote that year. Coding rhythm uses GitHub contribution-calendar dates and does not infer coding hours or timezone. Commit counts follow GitHub’s contribution rules. [See the data definitions.](docs/data-and-api.md#metric-definitions)

Quiet years get playful titles too: **Dreaming in Code**, **One-Hit Wonder**, and **Side Quest Mode**. Rhythm titles require at least seven active days. [Title rules](docs/data-and-api.md#playful-titles-and-small-samples).

## Run locally

Requires **Node.js 22+** and npm.

```bash
git clone https://github.com/Drawoh-eh/GitHub-Wrapped.git
cd GitHub-Wrapped
npm ci
cp .env.example .env.local
npm run dev
```

Open [localhost:3000](http://localhost:3000). **The demo works without a token.**

To fetch real profiles, add a public-data GitHub token to `.env.local`, then restart the server:

```env
GITHUB_TOKEN=your_server_only_token
```

Prefer a [fine-grained token](https://github.com/settings/personal-access-tokens/new) with **Public repositories** and no additional permissions. For a classic token, use only `public_repo`. Broad classic scopes (`repo`, `user`, `read:user`) are rejected. Keep the token server-side; never commit it or use a `NEXT_PUBLIC_` prefix. [Token setup details](docs/data-and-api.md#token-setup).

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDrawoh-eh%2FGitHub-Wrapped&env=GITHUB_TOKEN)

1. Deploy this repository with Vercel’s Next.js defaults and set `GITHUB_TOKEN`.
2. Set `NEXT_PUBLIC_SITE_URL` to your public HTTPS origin (for example, `https://wrapped.example.com`) so links and posters point to your instance.
3. Redeploy after changing the domain or token. Ensure your public production domain is accessible to visitors.

A GitHub connector used to edit the repository does not provide a token to the deployed app. A server runtime is required; GitHub Pages static export is not supported.

## FAQ

**Why are some commits missing?**

These are GitHub *commit contributions*, not every commit on every branch. See [GitHub’s contribution rules](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-settings-on-your-profile/troubleshooting-missing-contributions).

**Does the current year include future months?**

It is a year-to-date recap. The card shows its cutoff date; future months have zero commits.

**Why does language usage look different from what I wrote?**

It is based on current repository code bytes, with a maximum of 100 repositories and 100 languages per repository. Incomplete coverage is labeled.

**What does “Live recaps are not configured yet” mean?**

Set `GITHUB_TOKEN` in the server environment and restart or redeploy. The demo remains available without it.

**Can I show the card on my GitHub profile?**

Yes. Download the PNG, upload it to your profile repository, and embed that file with Markdown. It stays a snapshot of the year you chose.

## Contribute

Found a bug or have a theme idea? [Open an issue](https://github.com/Drawoh-eh/GitHub-Wrapped/issues) with a reproducible example, or send a focused pull request.

```bash
npm test
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

Pushes to `main` and pull requests run unit tests, a production build, and Chromium checks on GitHub Actions. Browser checks cover complete covers above the fold, separate statistics sections, mobile layouts, the scroll link, error recovery, year navigation, and PNG downloads. They use demo data and need no GitHub token. Failed checks retain screenshots and traces in the workflow artifacts.

Keep fetching separate from calculations, and update the [data documentation](docs/data-and-api.md) when metric definitions change. Please never include tokens in issues or pull requests.

[Data & API reference](docs/data-and-api.md)

## Credits & license

README organization draws inspiration from [GitHub Readme Stats](https://github.com/anuraghazra/github-readme-stats) and [GitHub Readme Streak Stats](https://github.com/DenverCoder1/github-readme-streak-stats). The application uses GitHub’s GraphQL API and Next.js `ImageResponse`. Bundled fonts are Arimo, Libre Baskerville, and Noto Sans SC via Fontsource, under their SIL Open Font Licenses.

[MIT](LICENSE). An independent project, not affiliated with GitHub or Spotify.
