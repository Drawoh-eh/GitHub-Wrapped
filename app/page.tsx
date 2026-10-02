import { WrappedExperience } from "@/components/WrappedExperience";
import { parsePresentation } from "@/lib/presentation";
export const dynamic = "force-dynamic";
export default async function Home({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  const query = await searchParams;
  const { theme } = parsePresentation(query.theme);
  return <WrappedExperience initialTheme={theme} />;
}
