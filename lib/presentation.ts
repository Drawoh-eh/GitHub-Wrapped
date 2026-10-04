import type { WrappedStats } from "./types";
export type Theme = "lime" | "violet" | "mono";
export const THEMES: Record<Theme, { bg: string; ink: string; panel: string; accent: string; panelText: string }> = {
  lime: { bg: "#c8ff62", ink: "#121411", panel: "#121411", accent: "#c0a4fb", panelText: "#c8ff62" },
  violet: { bg: "#d0b5ff", ink: "#201335", panel: "#38204f", accent: "#c8ff62", panelText: "#f2e9ff" },
  mono: { bg: "#f4f1e9", ink: "#191a18", panel: "#191a18", accent: "#f4f1e9", panelText: "#f4f1e9" },
};
export function parsePresentation(theme?: string | null): { theme: Theme } {
  return { theme: theme === "violet" || theme === "mono" ? theme : "lime" };
}
export const COPY = {
    star: "Star on GitHub", yearCode: "YOUR YEAR IN CODE", recap: "THE RECAP", title1: "You wrote code.", title2: "Make it a story.", result1: "You shipped.", result2: "Here’s the story.",
    intro: "Your developer DNA, coding rhythm, languages, and main quests. One shareable card.", form: "MAKE YOUR WRAPPED", noSignup: "NO SIGN-UP NEEDED", username: "GitHub username", year: "Year", generate: "Generate my Wrapped", generating: "Rewinding your year…", justLooking: "Just looking?", demo: "Explore the demo", open: "Open source", account: "No account required", free: "Free PNG download", download: "Download PNG", downloading: "Creating PNG…", share: "Share recap", ready: "Your card is ready. Go share your year!", copied: "Recap link copied to clipboard.", shareLink: "Share this link:", downloadError: "Couldn't download your card. Please try again.", copyImage: "Copy image", copyingImage: "Copying…", imageCopied: "Image copied. Paste it into your post or message.", copyImageError: "Couldn't copy the image. Use Download PNG instead.",
    customize: "MAKE IT YOURS", theme: "Card theme", themes: { lime: "Lime", violet: "Violet", mono: "Mono" }, preview: "Share card preview", demoCard: "DEMO CARD · SAMPLE DATA", cardFoot: "Made to be saved. Built to be shared.",
    closer: "THE YEAR, A LITTLE CLOSER", adds: "Every little push adds up.", sample: "Illustrative sample data. This is not Octocat's actual GitHub activity. Generate your own recap for real data.", ytd: "Year to date", full: "Full-year recap", through: "through", dates: "GitHub contribution dates", total: "Total contributions", allTypes: "commits, issues, PRs & reviews", active: "Active days", activeNote: "days with any contribution", streak: "Longest streak", streakNote: "consecutive contribution days", days: "days", busiest: "Busiest day", contributions: "contributions", next: "Your next chapter awaits",
    monthTitle: "When you shipped", monthNote: "Commit contributions by month", languageTitle: "Your language mix", languageNote: "Current code bytes in repositories you committed to", languageEmpty: "No repository language data available.", partial: "Partial coverage: up to 100 repositories and 100 languages per repository.", calendar: "The days you showed up", calendarNote: "Contribution activity", less: "Less", more: "More", dnaTitle: "Your developer DNA", dnaNote: "Three playful tags from your stack, rhythm, and year.", rhythmTitle: "Your coding rhythm", weekendEnergy: "Weekend energy", favoriteDay: "Favorite day", activeMonths: "Active months", consistency: "Consistency", mainQuests: "Your main quests", mainQuestsNote: "Most commit contributions among public repositories returned (up to 100).", noRepo: "No public commit repository this year.", titleNote: "For fun, based on documented thresholds — not a productivity score.",
    methods: ["Work that counts.", "Your code’s palette.", "Keep showing up."], methodTexts: ["GitHub’s contribution rules apply. These are commit contributions, not every commit on every branch.", "Language percentages describe current code bytes in public repositories you committed to that year. They don’t measure code you personally wrote.", "Streaks include all contribution types on GitHub’s calendar, including publicly shared private activity counts. Current-year recaps cover the year so far."], methodLabels: ["COMMITS", "LANGUAGES", "STREAKS"], footer: "Built for the love of building.", source: "Open source on GitHub", unofficial: "Unofficial. Not affiliated with GitHub.",
    cardTitle1: "A year.", cardTitle2: "A lot of code.", commits: "commit contributions", repos: "repositories", codeSpeaks: "YOUR CODE SPEAKS", codeBytes: "Current repository code bytes", partialShort: "partial coverage", biggest: "YOUR BIGGEST MONTH", emptyMonth: "Your next chapter", sampleData: "SAMPLE DATA", thru: "THROUGH", titleLabel: "YOUR DEVELOPER DNA", cardRhythm: "WEEKEND ENERGY", cardQuests: "MAIN QUEST",
} as const;
export function monthName(name: string | undefined) { return name ?? COPY.emptyMonth; }

export function heroQuote(stats: WrappedStats) {
  const tags = new Set(stats.personalityTags.map(tag => tag.label));
  if (tags.has("Dreaming in Code")) return { line1: "Plotting the", line2: "next big thing.", note: "a quiet calendar, an open chapter." };
  if (tags.has("One-Hit Wonder")) return { line1: "One commit.", line2: "A plot twist.", note: "every story has a first scene." };
  if (tags.has("Side Quest Mode")) return { line1: "A little code.", line2: "A side quest.", note: "small adventures count too." };
  if (tags.has("Streak Master") || tags.has("On a Roll") || tags.has("Steady Builder")) {
    return { line1: "You just", line2: "kept going.", note: "one contribution at a time." };
  }
  if (tags.has("Weekend Warrior") || tags.has("Weekend Hacker")) {
    return { line1: "Weekends were", line2: "made for shipping.", note: "apparently." };
  }
  if (tags.has("Deep Diver")) {
    return { line1: "One project.", line2: "All in.", note: "focus looks good on you." };
  }
  if (tags.has("Pythonista")) {
    return { line1: "A little more", line2: "Python, please.", note: "your stack had a favorite." };
  }
  if (tags.has("Repo Ranger") || tags.has("Project Explorer") || tags.has("Multi-Repo Builder")) {
    return { line1: "One repo?", line2: "Never enough.", note: "you kept exploring." };
  }
  if (tags.has("Community Contributor")) {
    return { line1: "Code wasn't", line2: "the whole story.", note: "showing up still counts." };
  }
  if (tags.has("A New Chapter")) {
    return { line1: "Every story", line2: "starts somewhere.", note: "this one is yours." };
  }
  return { line1: "You wrote code.", line2: "It became a year.", note: "every little push added up." };
}

export function rhythmCaption(stats: WrappedStats) {
  const energy = stats.codingRhythm.weekendEnergy;
  if (energy >= 40) return "Your keyboard doesn't know weekends.";
  if (energy >= 25) return "Weekends made the roadmap.";
  if (energy <= 10) return "Weekends stayed mostly untouched.";
  return "A fairly balanced week in code.";
}

export function personaText(stats: WrappedStats) {
  return { steady: "Steady Builder", explorer: "Project Explorer", builder: "Code Builder", beginning: "A New Chapter" }[stats.persona];
}
