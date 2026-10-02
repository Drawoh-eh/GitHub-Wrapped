import test from "node:test";
import assert from "node:assert/strict";
import { calendarLayout, calendarMove, contributionIntensity, dayDescription } from "../lib/calendar";
import type { ContributionDay } from "../lib/types";

function days(year: number, length: number): ContributionDay[] {
  return Array.from({ length }, (_, i) => ({ date: new Date(Date.UTC(year, 0, i + 1)).toISOString().slice(0, 10), contributionCount: 0 }));
}
test("calendar labels align with week columns across a leap year", () => {
  const layout = calendarLayout(days(2024, 366));
  assert.equal(layout.padding, 1);
  assert.equal(layout.weeks, 53);
  assert.deepEqual(layout.months.slice(0, 3), [{ name: "Jan", column: 1 }, { name: "Feb", column: 5 }, { name: "Mar", column: 9 }]);
  assert.equal(layout.months.at(-1)?.name, "Dec");
});
test("partial-year calendars omit future months and empty calendars remain valid", () => {
  assert.deepEqual(calendarLayout(days(2025, 31)).months, [{ name: "Jan", column: 1 }]);
  assert.deepEqual(calendarLayout([]), { padding: 0, weeks: 1, months: [] });
});
test("keyboard navigation follows week columns without crossing Sunday/Saturday rows", () => {
  assert.equal(calendarMove(0, "ArrowLeft", 3, 365), 0);
  assert.equal(calendarMove(0, "ArrowRight", 3, 365), 7);
  assert.equal(calendarMove(4, "ArrowUp", 3, 365), 4);
  assert.equal(calendarMove(3, "ArrowDown", 3, 365), 3);
  assert.equal(calendarMove(364, "ArrowRight", 3, 365), 364);
  assert.equal(calendarMove(10, "ArrowUp", 3, 365), 9);
});
test("day descriptions retain UTC dates and singular counts", () => {
  assert.equal(dayDescription({ date: "2024-02-29", contributionCount: 1 }), "Feb 29, 2024 · 1 contribution");
  assert.equal(dayDescription({ date: "2025-01-01", contributionCount: 0 }), "Jan 1, 2025 · 0 contributions");
});
test("live heatmaps use GitHub's relative intensity instead of fixed count thresholds", () => {
  assert.equal(contributionIntensity({ date: "2026-01-24", contributionCount: 11, contributionLevel: "SECOND_QUARTILE" }), 2);
  assert.equal(contributionIntensity({ date: "2026-01-25", contributionCount: 1, contributionLevel: "FOURTH_QUARTILE" }), 4);
  assert.equal(contributionIntensity({ date: "2026-01-26", contributionCount: 0, contributionLevel: "NONE" }), 0);
  assert.equal(contributionIntensity({ date: "2026-01-27", contributionCount: 11 }), 4);
});
