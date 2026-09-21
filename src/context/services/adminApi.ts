import { api } from "./index";
import type { AuthUser } from "@/lib/auth-routing";

export type AdminUser = AuthUser & {
  provider?: string | null;
  updatedAt?: string;
};

export type UsersListResponse = {
  data: AdminUser[];
  hasNextPage: boolean;
};

export type ListUsersArgs = {
  page?: number;
  limit?: number;
  roleId: number;
};

export type AdminCreatorChannel = {
  id: number;
  youtubeChannelId: string;
  channelName: string;
  channelUrl: string;
  verificationStatus: string;
  createdAt: string;
  game?: { id: number; slug: string; name: string } | null;
};

export type AdminCreatorRow = {
  id: number;
  status: string;
  plan: string;
  planStartedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user: AdminUser;
  channels: AdminCreatorChannel[];
};

export type CreatorsListResponse = {
  data: AdminCreatorRow[];
  hasNextPage: boolean;
};

export type AdminCreateCreatorBody = {
  email: string;
  password: string;
  name: string;
  channelUrl: string;
  phone?: string;
};

export type AdminOverviewResponse = {
  totals: {
    creators: number;
    viewers: number;
    pendingChannels: number;
    verifiedChannels: number;
    sessions: number;
    plays: number;
  };
  activity: Array<{ date: string; sessions: number; plays: number }>;
  gameStats: Array<{
    slug: string;
    name: string;
    plays: number;
    avgScore: number;
  }>;
  weeklyPlays: Array<{ date: string; plays: number; highScore: number }>;
};

export type AdminCreatorDetailResponse = {
  creator: AdminCreatorRow;
  totals: {
    sessions: number;
    plays: number;
    uniqueViewers: number;
    completedViews: number;
    eligibleSessions: number;
    totalWatchMs: number;
    avgWatchMs: number;
    channels: number;
    verifiedChannels: number;
  };
  activity: Array<{
    date: string;
    sessions: number;
    plays: number;
    watchMs: number;
  }>;
  weeklyPlays: Array<{ date: string; plays: number; highScore: number }>;
  gameStats: Array<{
    slug: string;
    name: string;
    plays: number;
    avgScore: number;
  }>;
  topVideos: {
    data: Array<{
      youtubeVideoId: string;
      title: string;
      sessions: number;
      watchMs: number;
    }>;
    page: number;
    hasNextPage: boolean;
  };
  topViewers: Array<{
    id: number;
    name: string;
    email: string | null;
    sessions: number;
    watchMs: number;
  }>;
  recentSessions: {
    data: Array<{
      id: string;
      title: string;
      youtubeVideoId: string;
      channelName: string;
      status: string;
      watchMs: number;
      startedAt: string;
      endedAt: string | null;
      viewer: { id: number; name: string; email: string | null };
    }>;
    page: number;
    hasNextPage: boolean;
  };
};

function buildUsersQuery({ page = 1, limit = 20, roleId }: ListUsersArgs) {
  const filters = JSON.stringify({ roles: [{ id: roleId }] });
  const sort = JSON.stringify([{ orderBy: "createdAt", order: "desc" }]);
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    filters,
    sort,
  });
  return `/users?${params.toString()}`;
}

export const adminApi = api.injectEndpoints({
  endpoints: (build) => ({
    listUsersByRole: build.query<UsersListResponse, ListUsersArgs>({
      query: (args) => buildUsersQuery(args),
      providesTags: ["Auth"],
    }),

    listCreators: build.query<
      CreatorsListResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 }) =>
        `/admin/creators?page=${page}&limit=${limit}`,
      providesTags: ["Onboarding"],
    }),

    getAdminOverview: build.query<AdminOverviewResponse, { days?: number } | void>({
      query: (args) => {
        const days = args && "days" in args && args.days ? args.days : 90;
        return `/admin/overview?days=${days}`;
      },
      providesTags: ["Onboarding", "Games"],
    }),

    getAdminCreatorDetail: build.query<
      AdminCreatorDetailResponse,
      {
        id: number;
        days?: number;
        videoPage?: number;
        sessionPage?: number;
        limit?: number;
      }
    >({
      query: ({
        id,
        days = 90,
        videoPage = 1,
        sessionPage = 1,
        limit = 5,
      }) => {
        const params = new URLSearchParams({
          days: String(days),
          videoPage: String(videoPage),
          sessionPage: String(sessionPage),
          limit: String(limit),
        });
        return `/admin/creators/${id}?${params.toString()}`;
      },
      providesTags: (_r, _e, arg) => [
        { type: "Onboarding", id: `creator-${arg.id}` },
      ],
    }),

    createCreator: build.mutation<AdminCreatorRow, AdminCreateCreatorBody>({
      query: (body) => ({
        url: "/admin/creators",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Onboarding", "Auth"],
    }),

    updateChannelVerification: build.mutation<
      {
        id: number;
        youtubeChannelId: string;
        channelName: string;
        channelUrl: string;
        verificationStatus: string;
      },
      { id: number; status: "PENDING" | "VERIFIED" | "REJECTED" }
    >({
      query: ({ id, status }) => ({
        url: `/admin/channels/${id}/verification`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Onboarding", "Auth"],
    }),
  }),
});

export const {
  useListUsersByRoleQuery,
  useLazyListUsersByRoleQuery,
  useListCreatorsQuery,
  useGetAdminOverviewQuery,
  useGetAdminCreatorDetailQuery,
  useCreateCreatorMutation,
  useUpdateChannelVerificationMutation,
} = adminApi;
