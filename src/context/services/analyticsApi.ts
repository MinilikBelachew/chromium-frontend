import { api } from "./index";

export type AnalyticsPeriod = "today" | "week" | "month";

export type AnalyticsSessionRow = {
  id: string;
  title: string;
  youtubeVideoId: string;
  channelName: string;
  status: string;
  watchMs: number;
  maxPositionMs?: number;
  hadAdImpression: boolean;
  adImpressionCount?: number;
  adSkipCount: number;
  endedReason: string | null;
  startedAt: string;
  endedAt: string | null;
  eligible?: boolean;
};

export type CreatorAnalyticsSummary = {
  period: AnalyticsPeriod;
  views: number;
  completedViews: number;
  adImpressions: number;
  adSkips: number;
  navigateAways: number;
  avgWatchMs: number;
  totalWatchMs: number;
  recentSessions: AnalyticsSessionRow[];
};

export type CreatorAnalyticsSessions = {
  period: AnalyticsPeriod;
  items: AnalyticsSessionRow[];
};

export const analyticsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCreatorAnalyticsSummary: build.query<
      CreatorAnalyticsSummary,
      AnalyticsPeriod | void
    >({
      query: (period = "month") => ({
        url: "/analytics/creator/summary",
        params: { period },
      }),
      providesTags: ["Analytics"],
    }),
    getCreatorAnalyticsSessions: build.query<
      CreatorAnalyticsSessions,
      AnalyticsPeriod | void
    >({
      query: (period = "month") => ({
        url: "/analytics/creator/sessions",
        params: { period },
      }),
      providesTags: ["Analytics"],
    }),
  }),
});

export const {
  useGetCreatorAnalyticsSummaryQuery,
  useGetCreatorAnalyticsSessionsQuery,
} = analyticsApi;
