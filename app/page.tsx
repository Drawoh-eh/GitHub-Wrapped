import { WrappedExperience } from "@/components/WrappedExperience";
import { parsePresentation } from "@/lib/presentation";
export const dynamic = "force-dynamic";
export default async function Home({ searchParams }: { searchParams: Promise<{ theme?: string; lang?: string }> }) {
  const query = await searchParams;
  const { theme, lang } = parsePresentation(query.theme, query.lang);
  return <WrappedExperience initialTheme={theme} initialLang={lang} />;
}
