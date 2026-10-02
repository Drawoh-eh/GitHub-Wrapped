export type ContributionDay = { date: string; contributionCount: number };
export type Language = { name: string; bytes: number; color: string; percentage: number };
export type RepositoryLanguages = {
  repository: {
    isPrivate: boolean;
    languages: {
      edges: { size: number; node: { name: string; color: string | null } }[];
      pageInfo: { hasNextPage: boolean };
    };
  };
};
export type RawWrappedData = {
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
