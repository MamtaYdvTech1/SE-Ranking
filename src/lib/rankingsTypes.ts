export type MetricType =
  | "average_position"
  | "search_visibility"
  | "top_10"
  | "traffic_forecast"
  | "mention_presence"
  | "link_presence"
  | "visibility"
  | "traffic"
  | "share_of_voice"
  | (string & {});

export type MetricStatus = "supported" | "future_ready" | "coming_soon";

export interface RankingMetric {
  id: MetricType;
  name: string;
  status: MetricStatus;
  value?: number | string | null;
  formattedValue: string;
  change?: number | null;
  changeLabel?: string;
  isPositive?: boolean | null;
  phaseLabel?: string;
}

export type TimeRange = "week" | "month" | "3months" | "6months";
export type GroupBy = "days" | "weeks";
export type ViewFilter = "all" | "websites" | "groups";

export interface RankingTrendPoint {
  date: string;
  label: string;
  value: number;
}

export interface WebsiteRankingSummary {
  id: string;
  domain: string;
  isPrimary: boolean;
  status?: "active" | "paused";
  top3?: number;
  top5: number;
  top10: number;
  top30: number;
  top100?: number;
  keywordsCount: number;
  averagePosition: number;
  lastUpdated: string;
  visibility?: number;
  traffic?: number;
  keywordBreakdown?: {
    top5Keywords: Array<{ keyword: string; position: number; change: number }>;
  };
}

export type ViewStateMode =
  | "populated"
  | "loading"
  | "empty"
  | "error"
  | "stale"
  | "permission-restricted";

export interface RankingOverviewData {
  metrics: RankingMetric[];
  trend: RankingTrendPoint[];
  websites: WebsiteRankingSummary[];
  totalWebsites: number;
  lastChecked: string;
  lastSynced: string;
  isStale: boolean;
  staleNotice?: string;
  dataNotice?: string;
}
