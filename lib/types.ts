export type ContributionLevel = "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE";
export type ContributionDay = { date: string; contributionCount: number; contributionLevel?: ContributionLevel };
export type Language = { name: string; bytes: number; color: string; percentage: number };
export type DeveloperTag = { label: string; category: "stack" | "habit" | "achievement" };
export type RepositoryLanguages = {
  contributions?: { totalCount: number };
  repository: {
    nameWithOwner?: string;
    isPrivate: boolean;
    languages: {
      edges: { size: number; node: { name: string; color: string | null } }[];
      pageInfo: { hasNextPage: boolean };
    };
  };
};
export type RawWrappedData = {
  displayName?: string | null;
  avatarUrl?: string | null;
  username: string;
  year: number;
  through: string;
  commits: number;
  repositories: number;
  days: ContributionDay[];
  monthlyCommits: number[];
  repositoryLanguages: RepositoryLanguages[];
};
export type WrappedStats = {
  fetchedAt?: string;
  displayName: string;
  avatarUrl: string | null;
  topRepository: { name: string; commits: number } | null;
  topRepositories: { name: string; commits: number }[];
  topRepositoryIncomplete: boolean;
  persona: "steady" | "explorer" | "builder" | "beginning";
  personalityTags: DeveloperTag[];
  codingRhythm: {
    weekendEnergy: number;
    favoriteDay: string | null;
    activeMonths: number;
    consistency: number;
  };
  username: string;
  year: number;
  through: string;
  isDemo: boolean;
  commits: number;
  repositories: number;
  contributions: number;
  activeDays: number;
  longestStreak: number;
  mostProductiveMonth: { name: string; count: number } | null;
  busiestDay: ContributionDay | null;
  months: { name: string; count: number }[];
  days: ContributionDay[];
  languages: Language[];
  languagesIncomplete: boolean;
};
