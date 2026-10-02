import { cache } from "react";
import { socialMetadata } from "@/lib/social";
import { WrappedExperience } from "@/components/WrappedExperience";
import { getWrapped } from "@/lib/github";
import { parsePresentation } from "@/lib/presentation";
import { parseInput, WrappedError } from "@/lib/input";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ username: string }>; searchParams: Promise<{ year?: string; demo?: string; theme?: string }> };
const loadRecap = cache(async (username: string, year: string | undefined, demo: boolean) => {
  const input = parseInput(username, year);
  return getWrapped(input.username, input.year, demo);
});
export async function generateMetadata({ params, searchParams }: PageProps) {
  const { username } = await params, query = await searchParams;
  try { return socialMetadata(await loadRecap(username, query.year, query.demo === "1"), parsePresentation(query.theme).theme); }
  catch { return { ...socialMetadata(), robots: { index: false, follow: true } }; }
}

export default async function WrappedPage({ params, searchParams }: PageProps) {
  const { username } = await params;
  const query = await searchParams;
  const presentation = parsePresentation(query.theme);
  try {
    const stats = await loadRecap(username, query.year, query.demo === "1");
    return <WrappedExperience initialStats={stats} initialTheme={presentation.theme} />;
  } catch (error) {
    const message = error instanceof WrappedError ? error.message : "Something went wrong. Please try again.";
    return <WrappedExperience initialUsername={username} initialError={message} initialTheme={presentation.theme} />;
  }
}
