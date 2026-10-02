import type { ContributionDay } from "./types";

export function calendarLayout(days: ContributionDay[]) {
  const padding = days.length ? new Date(`${days[0].date}T00:00:00Z`).getUTCDay() : 0;
  const weeks = Math.max(1, Math.ceil((padding + days.length) / 7));
  const months = days.flatMap((day, index) => {
    if (index && day.date.slice(0, 7) === days[index - 1].date.slice(0, 7)) return [];
    return [{ name: new Date(`${day.date}T00:00:00Z`).toLocaleString("en-US", { month: "short", timeZone: "UTC" }), column: Math.floor((padding + index) / 7) + 1 }];
  });
  return { padding, weeks, months };
}

export function calendarMove(index: number, key: string, padding: number, length: number) {
  const row = (padding + index) % 7;
  const step = key === "ArrowLeft" ? -7 : key === "ArrowRight" ? 7 : key === "ArrowUp" && row > 0 ? -1 : key === "ArrowDown" && row < 6 ? 1 : 0;
  return Math.max(0, Math.min(length - 1, index + step));
}

export function dayDescription(day: ContributionDay) {
  const date = new Date(`${day.date}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  return `${date} · ${day.contributionCount.toLocaleString("en-US")} ${day.contributionCount === 1 ? "contribution" : "contributions"}`;
}
