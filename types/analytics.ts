import type { ContentType } from "@prisma/client";

export type AnalyticsRange = "7" | "30" | "90" | "all";

export const ANALYTICS_RANGE_OPTIONS: {
  value: AnalyticsRange;
  label: string;
}[] = [
  { value: "7", label: "Son 7 gün" },
  { value: "30", label: "Son 30 gün" },
  { value: "90", label: "Son 90 gün" },
  { value: "all", label: "Tümü" },
];

export type AnalyticsStatItem = {
  id: string;
  label: string;
  value: number;
  icon:
    | "views"
    | "downloads"
    | "tests"
    | "members"
    | "published"
    | "likes"
    | "comments";
};

export type AnalyticsContentItem = {
  id: string;
  title: string;
  type: ContentType;
  typeLabel: string;
  value: number;
  authorName: string;
  viewUrl: string | null;
  editUrl: string;
};

export type AnalyticsFileItem = {
  id: string;
  title: string;
  value: number;
  uploadedBy: string;
  editUrl: string;
};

export type AnalyticsTestItem = {
  id: string;
  title: string;
  slug: string;
  value: number;
  editUrl: string;
};

export type AnalyticsAuthorItem = {
  id: string;
  name: string;
  avatar: string | null;
  value: number;
};

export type AnalyticsChartPoint = {
  key: string;
  label: string;
  count: number;
};

export type AnalyticsTypeSlice = {
  type: ContentType;
  label: string;
  count: number;
};

export type AnalyticsDashboardData = {
  range: AnalyticsRange;
  rangeLabel: string;
  stats: AnalyticsStatItem[];
  topReadContent: AnalyticsContentItem[];
  topDownloadedFiles: AnalyticsFileItem[];
  topCompletedTests: AnalyticsTestItem[];
  topAuthors: AnalyticsAuthorItem[];
  topLikedContent: AnalyticsContentItem[];
  topCommentedContent: AnalyticsContentItem[];
  contentPublishingChart: AnalyticsChartPoint[];
  memberRegistrationChart: AnalyticsChartPoint[];
  contentTypeDistribution: AnalyticsTypeSlice[];
};
