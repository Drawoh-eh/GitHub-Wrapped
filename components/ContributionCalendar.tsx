"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { ContributionDay } from "@/lib/types";
import { calendarLayout, calendarMove, dayDescription } from "@/lib/calendar";

export function ContributionCalendar({ days }: { days: ContributionDay[] }) {
  const { padding, weeks, months } = calendarLayout(days);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const shown = preview ?? selected;
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? days.length - 1 : calendarMove(index, event.key, padding, days.length);
    buttons.current[next]?.focus();
  }
  return <>
    <div className="calendar-scroll" role="group" aria-label="Contribution calendar. Use arrow keys to move between days.">
      <div className="calendar-grid" style={{ "--calendar-weeks": weeks } as CSSProperties}>
        <div className="calendar-months" aria-hidden="true">{months.map(month => <span key={month.name} style={{ gridColumn: `${month.column} / span ${Math.min(3, weeks - month.column + 1)}` }}>{month.name}</span>)}</div>
        <div className="contribution-calendar" onMouseLeave={() => setPreview(null)}>
          {Array.from({ length: padding }, (_, i) => <span key={`pad${i}`} className="calendar-pad" aria-hidden="true" />)}
          {days.map((day, index) => <button type="button" key={day.date} data-date={day.date}
            ref={element => { buttons.current[index] = element; }} tabIndex={index === active ? 0 : -1}
            aria-label={dayDescription(day)} aria-pressed={selected === index}
            onClick={() => { setSelected(index); setActive(index); }} onFocus={() => { setActive(index); setPreview(index); }}
            onBlur={() => setPreview(null)} onMouseEnter={() => setPreview(index)} onKeyDown={event => navigate(event, index)}
            className={`calendar-cell level-${day.contributionCount === 0 ? 0 : day.contributionCount < 3 ? 1 : day.contributionCount < 6 ? 2 : day.contributionCount < 10 ? 3 : 4}`} />)}
        </div>
      </div>
    </div>
    <div className="calendar-footer"><p className="chart-detail" aria-live="polite" aria-atomic="true">{shown === null ? "Tap or focus a day to see its contributions." : dayDescription(days[shown])}</p>
      <div className="calendar-legend" aria-label="Contribution intensity from less to more">Less {[0, 1, 2, 3, 4].map(i => <span key={i} className={`calendar-cell level-${i}`} aria-hidden="true" />)} More</div>
    </div>
  </>;
}
