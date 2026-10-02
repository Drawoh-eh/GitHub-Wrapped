"use client";

import { useState } from "react";
import type { WrappedStats } from "@/lib/types";

export function MonthlyChart({ months, bestMonth }: { months: WrappedStats["months"]; bestMonth?: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const shown = preview ?? selected;
  const month = shown === null ? null : months[shown];
  const max = Math.max(...months.map(m => m.count), 1);
  return <>
    <div className="month-chart" role="group" aria-label="Monthly commit contributions" onMouseLeave={() => setPreview(null)}>
      {months.map((m, index) => <button type="button" className="month-column" key={m.name}
        aria-label={`${m.name}: ${m.count.toLocaleString("en-US")} commit contributions`} aria-pressed={selected === index}
        onClick={() => setSelected(index)} onMouseEnter={() => setPreview(index)} onFocus={() => setPreview(index)} onBlur={() => setPreview(null)}>
        <span aria-hidden="true" className={`month-bar ${m.name === bestMonth ? "best" : ""}`} style={{ height: `${m.count ? Math.max(3, m.count / max * 100) : 0}%` }} />
        <span className="month-label" aria-hidden="true">{m.name.slice(0, 3)}</span>
      </button>)}
    </div>
    <p className="chart-detail" aria-live="polite" aria-atomic="true">{month ? <><strong>{month.name}</strong><span>{month.count.toLocaleString("en-US")} commit contributions</span></> : "Tap or focus a month to see its commit count."}</p>
  </>;
}
