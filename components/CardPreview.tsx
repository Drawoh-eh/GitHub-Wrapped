"use client";
import { useEffect, useRef, useState } from "react";
import { WrappedCard } from "./WrappedCard";
import type { WrappedStats } from "@/lib/types";
import type { Locale, Theme } from "@/lib/presentation";

export function CardPreview({ stats, theme, lang }: { stats: WrappedStats; theme: Theme; lang: Locale }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(430);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className="card-preview-shell"><div className="card-preview-render" style={{ transform: `scale(${width / 1080})` }}><WrappedCard stats={stats} theme={theme} lang={lang} /></div></div>;
}
