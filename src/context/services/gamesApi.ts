import { api } from "./index";

export type CatalogGame = {
  id: number;
  slug: string;
  name: string;
  active: boolean;
};

export type LeaderboardEntry = {
  rank: number;
  userId: number;
  displayName?: string | null;
  avatarUrl?: string | null;
  score: number;
  playedAt: string;
  channelId?: number;
};

export type LeaderboardResponse = {
  day: string;
  entries: LeaderboardEntry[];
  myBest?: number | null;
};

export const gamesApi = api.injectEndpoints({
  endpoints: (build) => ({
    listGames: build.query<CatalogGame[], void>({
      query: () => "/games",
      providesTags: ["Games"],
    }),
    getGameLeaderboard: build.query<
      LeaderboardResponse,
      { slug: string; day?: string; limit?: number }
    >({
      query: ({ slug, day, limit }) => {
        const params = new URLSearchParams();
        if (day) params.set("day", day);
        if (limit) params.set("limit", String(limit));
        const q = params.toString();
        return `/games/${encodeURIComponent(slug)}/leaderboard${q ? `?${q}` : ""}`;
      },
      providesTags: (_r, _e, arg) => [{ type: "Games", id: `lb-${arg.slug}` }],
    }),
    getChannelLeaderboard: build.query<
      LeaderboardResponse,
      { channelId: number; day?: string; limit?: number; gameSlug?: string }
    >({
      query: ({ channelId, day, limit, gameSlug }) => {
        const params = new URLSearchParams();
        if (day) params.set("day", day);
        if (limit) params.set("limit", String(limit));
        if (gameSlug) params.set("gameSlug", gameSlug);
        const q = params.toString();
        return `/channels/${channelId}/leaderboard${q ? `?${q}` : ""}`;
      },
      providesTags: (_r, _e, arg) => [
        {
          type: "Games",
          id: `ch-lb-${arg.channelId}-${arg.gameSlug || "default"}`,
        },
      ],
    }),
    setChannelGame: build.mutation<
      {
        id: number;
        channelName: string;
        game?: { id: number; slug: string; name: string } | null;
      },
      { channelId: number; gameSlug: string }
    >({
      query: ({ channelId, gameSlug }) => ({
        url: `/channels/${channelId}/game`,
        method: "PATCH",
        body: { gameSlug },
      }),
      invalidatesTags: ["Onboarding", "Games"],
    }),
  }),
});

export const {
  useListGamesQuery,
  useGetGameLeaderboardQuery,
  useGetChannelLeaderboardQuery,
  useSetChannelGameMutation,
} = gamesApi;
