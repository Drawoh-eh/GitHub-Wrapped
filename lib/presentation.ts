import { MONTHS } from "./stats";
import type { WrappedStats } from "./types";

export type Locale = "en" | "zh";
export type Theme = "lime" | "violet" | "mono";
export const THEMES: Record<Theme, { bg: string; ink: string; panel: string; accent: string; panelText: string }> = {
  lime: { bg: "#c8ff62", ink: "#121411", panel: "#121411", accent: "#c0a4fb", panelText: "#c8ff62" },
  violet: { bg: "#d0b5ff", ink: "#201335", panel: "#38204f", accent: "#c8ff62", panelText: "#f2e9ff" },
  mono: { bg: "#f4f1e9", ink: "#191a18", panel: "#191a18", accent: "#f4f1e9", panelText: "#f4f1e9" },
};
export function parsePresentation(theme?: string | null, lang?: string | null): { theme: Theme; lang: Locale } {
  return { theme: theme === "violet" || theme === "mono" ? theme : "lime", lang: lang === "zh" ? "zh" : "en" };
}
export const COPY = {
  en: {
    star: "Star on GitHub", yearCode: "YOUR YEAR IN CODE", recap: "THE RECAP", title1: "You wrote code.", title2: "Make it a story.", result1: "You shipped.", result2: "Here’s the story.",
    intro: "The commits. The languages. The days you kept going. Your GitHub year, wrapped into one shareable card.", form: "MAKE YOUR WRAPPED", noSignup: "NO SIGN-UP NEEDED", username: "GitHub username", year: "Year", generate: "Generate my Wrapped", generating: "Rewinding your year…", justLooking: "Just looking?", demo: "Explore the demo", open: "Open source", account: "No account required", free: "Free PNG download", download: "Download PNG", downloading: "Creating PNG…", share: "Share recap", ready: "Your card is ready. Go share your year!", copied: "Recap link copied to clipboard.", shareLink: "Share this link:", downloadError: "Couldn't download your card. Please try again.",
    customize: "MAKE IT YOURS", theme: "Card theme", themes: { lime: "Lime", violet: "Violet", mono: "Mono" }, preview: "Share card preview", demoCard: "DEMO CARD · SAMPLE DATA", cardFoot: "Made to be saved. Built to be shared.",
    closer: "THE YEAR, A LITTLE CLOSER", adds: "Every little push adds up.", sample: "Illustrative sample data. Generate your own to see real activity.", ytd: "Year to date", full: "Full-year recap", through: "through", dates: "GitHub contribution dates", total: "Total contributions", allTypes: "commits, issues, PRs & reviews", active: "Active days", activeNote: "days with any contribution", streak: "Longest streak", streakNote: "consecutive contribution days", days: "days", busiest: "Busiest day", contributions: "contributions", next: "Your next chapter awaits",
    monthTitle: "When you shipped", monthNote: "Commit contributions by month", languageTitle: "Your language mix", languageNote: "Current code bytes in repositories you committed to", languageEmpty: "No repository language data available.", partial: "Partial coverage: up to 100 repositories and 100 languages per repository.", calendar: "The days you showed up", calendarNote: "Contribution activity", less: "Less", more: "More", topRepo: "Top public repository", topRepoNote: "Most commit contributions among the public repositories returned (up to 100).", noRepo: "No public commit repository this year.", titleNote: "Just for fun: a rule-based title, not a productivity score.",
    methods: ["Work that counts.", "Your code’s palette.", "Keep showing up."], methodTexts: ["GitHub’s contribution rules apply. These are commit contributions, not every commit on every branch.", "Language percentages describe current code bytes in public repositories you committed to that year. They don’t measure code you personally wrote.", "Streaks include all contribution types on GitHub’s calendar, including publicly shared private activity counts. Current-year recaps cover the year so far."], methodLabels: ["COMMITS", "LANGUAGES", "STREAKS"], footer: "Built for the love of building.", source: "Open source on GitHub", unofficial: "Unofficial. Not affiliated with GitHub.",
    cardTitle1: "A year.", cardTitle2: "A lot of code.", commits: "commit contributions", repos: "repositories", codeSpeaks: "YOUR CODE SPEAKS", codeBytes: "Current repository code bytes", partialShort: "partial coverage", biggest: "YOUR BIGGEST MONTH", emptyMonth: "Your next chapter", sampleData: "SAMPLE DATA", thru: "THROUGH", titleLabel: "YOUR BUILDER TITLE",
  },
  zh: {
    star: "去 GitHub 点 Star", yearCode: "你的代码年度回顾", recap: "年度回顾", title1: "你写下的代码，", title2: "值得一个故事。", result1: "你这一年的投入，", result2: "都在这里。",
    intro: "提交、语言，以及那些持续投入的日子。把你的 GitHub 这一年，变成一张值得分享的卡片。", form: "生成你的年度回顾", noSignup: "无需登录", username: "GitHub 用户名", year: "年份", generate: "生成我的年度回顾", generating: "正在回顾这一年…", justLooking: "先看看效果？", demo: "体验演示", open: "开源项目", account: "无需注册", free: "免费下载图片", download: "下载 PNG", downloading: "正在生成图片…", share: "分享回顾", ready: "图片已下载，去分享你的这一年吧！", copied: "回顾链接已复制。", shareLink: "分享这个链接：", downloadError: "图片下载失败，请重试。",
    customize: "让它更像你", theme: "卡片主题", themes: { lime: "荧光绿", violet: "紫罗兰", mono: "黑白简约" }, preview: "分享卡片预览", demoCard: "演示卡片 · 示例数据", cardFoot: "记录这一年，也分享这一年。",
    closer: "再看近一点", adds: "每一次投入，都算数。", sample: "这里是示例数据，输入你的用户名查看真实记录。", ytd: "今年截至目前", full: "全年回顾", through: "截至", dates: "按 GitHub 贡献日期统计", total: "总贡献数", allTypes: "包含提交、Issue、PR 和评审", active: "活跃天数", activeNote: "有任意贡献的日期数", streak: "最长连续贡献", streakNote: "连续存在贡献的日期数", days: "天", busiest: "最活跃的一天", contributions: "次贡献", next: "下一个故事，等你开始",
    monthTitle: "你在哪个月最投入", monthNote: "每月提交贡献数", languageTitle: "你的仓库语言构成", languageNote: "当年提交过的仓库中，当前代码字节占比", languageEmpty: "暂无仓库语言数据。", partial: "仅覆盖最多 100 个仓库，每个仓库最多 100 种语言。", calendar: "你持续投入的日子", calendarNote: "GitHub 贡献记录", less: "少", more: "多", topRepo: "最常贡献的公开仓库", topRepoNote: "在返回的公开仓库中，按提交贡献数排名，最多覆盖 100 个。", noRepo: "这一年暂无公开仓库提交记录。", titleNote: "称号仅基于简单规则，用来增添趣味，不代表生产力评分。",
    methods: ["每次贡献都有依据。", "代码的语言构成。", "持续投入的轨迹。"], methodTexts: ["遵循 GitHub 贡献规则，统计提交贡献，不等于所有分支上的全部提交。", "按当年提交过的公开仓库当前代码字节数统计，不代表你亲手写出的代码占比。", "连续天数包含贡献日历中的各类活动，也可能包含已公开的私有活动计数。今年展示截至目前的数据。"], methodLabels: ["提交贡献", "语言占比", "连续贡献"], footer: "为每一个热爱创造的人。", source: "在 GitHub 查看源码", unofficial: "非官方项目，与 GitHub 无隶属关系。",
    cardTitle1: "这一年，", cardTitle2: "写下你的故事。", commits: "次提交贡献", repos: "个仓库", codeSpeaks: "代码的语言构成", codeBytes: "仓库当前代码字节占比", partialShort: "部分覆盖", biggest: "最投入的月份", emptyMonth: "故事正要开始", sampleData: "示例数据", thru: "截至", titleLabel: "你的年度称号",
  },
} as const;
export function monthName(name: string | undefined, lang: Locale) {
  if (!name) return COPY[lang].emptyMonth;
  const i = MONTHS.indexOf(name);
  return lang === "zh" && i >= 0 ? `${i + 1} 月` : name;
}
export function personaText(stats: WrappedStats, lang: Locale) {
  const names = lang === "zh" ? { steady: "持续创造者", explorer: "项目探索者", builder: "代码创造者", beginning: "新故事的起点" } : { steady: "Steady Builder", explorer: "Project Explorer", builder: "Code Builder", beginning: "A New Chapter" };
  return names[stats.persona];
}
export function localizeError(message: string, lang: Locale) {
  if (lang === "en") return message;
  if (/not configured|token is invalid|public-only access/i.test(message)) return "真实数据服务暂时不可用，请先体验演示或稍后重试。";
  if (/could not be found/i.test(message)) return "没有找到这个 GitHub 账号，请检查用户名。";
  if (/valid GitHub username/i.test(message)) return "请输入正确的 GitHub 用户名，不要填写主页链接。";
  if (/Choose a year/i.test(message)) return "请选择 2008 年至今年之间的年份。";
  if (/limit|minute/i.test(message)) return "请求较多，请稍后再试。";
  return "暂时无法生成回顾，请稍后重试。";
}
