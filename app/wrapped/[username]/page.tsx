import { WrappedExperience } from "@/components/WrappedExperience";
import { getWrapped } from "@/lib/github";
import { parsePresentation } from "@/lib/presentation";
import { parseInput, WrappedError } from "@/lib/input";

export const dynamic = "force-dynamic";

export default async function WrappedPage({ params, searchParams }: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ year?: string; demo?: string; theme?: string }>;
}) {
  const { username } = await params;
  const query = await searchParams;
  const presentation = parsePresentation(query.theme);
  try {
    const input = parseInput(username, query.year);
    const stats = await getWrapped(input.username, input.year, query.demo === "1");
    return <WrappedExperience initialStats={stats} initialTheme={presentation.theme} />;
  } catch (error) {
    const message = error instanceof WrappedError ? error.message : "Something went wrong. Please try again.";
    return <WrappedExperience initialUsername={username} initialError={message} initialTheme={presentation.theme} />;
  }
}
