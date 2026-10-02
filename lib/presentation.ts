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
    intro: "The commits. The languages. The days you kept going. Your GitHub year, wrapped into one shareable card.", form: "MAKE YOUR WRAPPED", noSignup: "NO SIGN-UP NEEDED", username: "GitHub username", year: "Year", generate: "Generate my Wrapped", generating: "Rewinding your year…", justLooking: "Just looking?", demo: "Explore the demo", open: "Open source", account: "No account required", free: "Free PNG download", download: "Download PNG", downloading: "Creating PNG…", share: "Share recap", ready: "Your card is ready. Go share your year!", copied: "Recap link copied to clipboard.", shareLink: "Share this link:", downloadError: "Couldn't download your card. Please try again.",
    customize: "MAKE IT YOURS", theme: "Card theme", themes: { lime: "Lime", violet: "Violet", mono: "Mono" }, preview: "Share card preview", demoCard: "DEMO CARD · SAMPLE DATA", cardFoot: "Made to be saved. Built to be shared.",
    closer: "THE YEAR, A LITTLE CLOSER", adds: "Every little push adds up.", sample: "Illustrative sample data. Generate your own to see real activity.", ytd: "Year to date", full: "Full-year recap", through: "through", dates: "GitHub contribution dates", total: "Total contributions", allTypes: "commits, issues, PRs & reviews", active: "Active days", activeNote: "days with any contribution", streak: "Longest streak", streakNote: "consecutive contribution days", days: "days", busiest: "Busiest day", contributions: "contributions", next: "Your next chapter awaits",
    monthTitle: "When you shipped", monthNote: "Commit contributions by month", languageTitle: "Your language mix", languageNote: "Current code bytes in repositories you committed to", languageEmpty: "No repository language data available.", partial: "Partial coverage: up to 100 repositories and 100 languages per repository.", calendar: "The days you showed up", calendarNote: "Contribution activity", less: "Less", more: "More", topRepo: "Top public repository", topRepoNote: "Most commit contributions among the public repositories returned (up to 100).", noRepo: "No public commit repository this year.", titleNote: "Just for fun: a rule-based title, not a productivity score.",
    methods: ["Work that counts.", "Your code’s palette.", "Keep showing up."], methodTexts: ["GitHub’s contribution rules apply. These are commit contributions, not every commit on every branch.", "Language percentages describe current code bytes in public repositories you committed to that year. They don’t measure code you personally wrote.", "Streaks include all contribution types on GitHub’s calendar, including publicly shared private activity counts. Current-year recaps cover the year so far."], methodLabels: ["COMMITS", "LANGUAGES", "STREAKS"], footer: "Built for the love of building.", source: "Open source on GitHub", unofficial: "Unofficial. Not affiliated with GitHub.",
    cardTitle1: "A year.", cardTitle2: "A lot of code.", commits: "commit contributions", repos: "repositories", codeSpeaks: "YOUR CODE SPEAKS", codeBytes: "Current repository code bytes", partialShort: "partial coverage", biggest: "YOUR BIGGEST MONTH", emptyMonth: "Your next chapter", sampleData: "SAMPLE DATA", thru: "THROUGH", titleLabel: "YOUR BUILDER TITLE",
} as const;
export function monthName(name: string | undefined) { return name ?? COPY.emptyMonth; }
export function personaText(stats: WrappedStats) {
  return { steady: "Steady Builder", explorer: "Project Explorer", builder: "Code Builder", beginning: "A New Chapter" }[stats.persona];
}
