import { ImageResponse } from "next/og";
import { getWrapped } from "@/lib/github";
import { parseInput } from "@/lib/input";
import { errorResponse } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const { username, year } = parseInput(params.get("username"), params.get("year"));
    const stats = await getWrapped(username, year, params.get("demo") === "1");
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#c8ff62", color: "#121411", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, fontWeight: 700, letterSpacing: 2 }}><span>GITHUB WRAPPED</span><span>{stats.isDemo ? "DEMO / " : ""}{year}</span></div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 104, fontWeight: 800, letterSpacing: -6, lineHeight: 1, marginTop: 52 }}><span>A year.</span><span>A lot of code.</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 32, marginTop: 28 }}><div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#121411", color: "#c8ff62", borderRadius: 40, width: 66, height: 66, fontSize: 26 }}>&lt;/&gt;</div><span>@{stats.username}</span></div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 36 }}><span style={{ fontSize: 180, fontWeight: 800, lineHeight: 1, letterSpacing: -10 }}>{stats.commits.toLocaleString("en-US")}</span><span style={{ fontSize: 28, marginTop: 8 }}>commit contributions</span></div>
        <div style={{ display: "flex", borderTop: "2px solid #9ccc49", borderBottom: "2px solid #9ccc49", paddingTop: 24, paddingBottom: 24, marginTop: 26, gap: 120 }}>
          <div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: 68, fontWeight: 700 }}>{stats.repositories}</span><span style={{ fontSize: 25 }}>repositories</span></div>
          <div style={{ display: "flex", flexDirection: "column" }}><span style={{ fontSize: 68, fontWeight: 700 }}>{stats.longestStreak}d</span><span style={{ fontSize: 25 }}>contribution streak</span></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 32 }}>
          <span style={{ fontSize: 23, fontWeight: 700, letterSpacing: 2 }}>YOUR CODE SPEAKS</span>
          <div style={{ display: "flex", width: "100%", height: 22, borderRadius: 12, overflow: "hidden", marginTop: 16 }}>
            {stats.languages.map(language => <div key={language.name} style={{ display: "flex", width: `${language.percentage}%`, height: "100%", background: language.color }} />)}
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 25, marginTop: 16 }}>{stats.languages.slice(0, 3).map(language => <span key={language.name}>{language.name} {Math.round(language.percentage)}%</span>)}{stats.languages.length === 0 && <span>No language data this year</span>}</div>
          <span style={{ fontSize: 16, marginTop: 12 }}>Current repository code bytes{stats.languagesIncomplete ? " · partial coverage" : ""}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", background: "#121411", color: "#c8ff62", borderRadius: 16, padding: "26px 34px", marginTop: "auto" }}><span style={{ fontSize: 22, color: "#cad9b4", letterSpacing: 2 }}>YOUR BIGGEST MONTH</span><div style={{ display: "flex", justifyContent: "space-between", fontSize: 64, fontWeight: 700, marginTop: 8 }}><span>{stats.mostProductiveMonth?.name ?? "Your next chapter"}</span><span style={{ color: "#c0a4fb" }}>↗</span></div></div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, fontSize: 20, letterSpacing: 1 }}><span>YOUR YEAR IN CODE.</span><span>{stats.isDemo ? "SAMPLE DATA" : `THROUGH ${stats.through}`}</span></div>
      </div>,
      {
        width: 1080, height: 1350,
        headers: {
          "Cache-Control": "no-store",
          ...(params.get("download") === "1" ? { "Content-Disposition": `attachment; filename="github-wrapped-${stats.username}-${year}${stats.isDemo ? '-demo' : ''}.png"` } : {}),
        },
      },
    );
  } catch (error) { return errorResponse(error); }
}
