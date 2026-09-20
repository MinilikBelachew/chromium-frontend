import { api } from "./index";

export type AnalyticsPeriod = "today" | "week" | "month";

export type AnalyticsSessionViewer = {
  id: number;
  name: string;
  email: string | null;
  handle: string;
};

export type AnalyticsSessionGame = {
  slug: string;
  name: string;
};

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
  viewer?: AnalyticsSessionViewer;
  game?: AnalyticsSessionGame | null;
};

export type AnalyticsGameStat = {
  slug: string;
  name: string;
  sessions: number;
  watchMs: number;
  plays: number;
};

export type AnalyticsTopVideo = {
  youtubeVideoId: string;
  title: string;
  sessions: number;
  watchMs: number;
};

export type AnalyticsWatchBucket = {
  key: string;
  label: string;
  count: number;
};

export type AnalyticsDailyPoint = {
  day: string;
  sessions: number;
  watchMs: number;
  uniqueViewers: number;
};

export type CreatorAnalyticsSummary = {
  period: AnalyticsPeriod;
  views: number;
  completedViews: number;
  eligibleSessions: number;
  activeSessions: number;
  abandonedSessions: number;
  navigateAways: number;
  uniqueViewers: number;
  avgWatchMs: number;
  totalWatchMs: number;
  gamePlays: number;
  recentSessions: AnalyticsSessionRow[];
  recentTotal?: number;
  games: AnalyticsGameStat[];
  topVideos: AnalyticsTopVideo[];
  watchBuckets: AnalyticsWatchBucket[];
  daily: AnalyticsDailyPoint[];
  /** @deprecated kept optional for older responses */
  adImpressions?: number;
  adSkips?: number;
};

export type CreatorAnalyticsSessions = {
  period: AnalyticsPeriod;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: AnalyticsSessionRow[];
};

export type CreatorSessionsQuery = {
  period?: AnalyticsPeriod;
  page?: number;
  limit?: number;
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
      CreatorSessionsQuery | AnalyticsPeriod | void
    >({
      query: (arg) => {
        const params =
          typeof arg === "string" || arg == null
            ? { period: (arg as AnalyticsPeriod | undefined) || "month", page: 1, limit: 8 }
            : {
                period: arg.period || "month",
                page: arg.page || 1,
                limit: arg.limit || 8,
              };
        return {
          url: "/analytics/creator/sessions",
          params,
        };
      },
      providesTags: ["Analytics"],
    }),
  }),
});

export const {
  useGetCreatorAnalyticsSummaryQuery,
  useGetCreatorAnalyticsSessionsQuery,
} = analyticsApi;
