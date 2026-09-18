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
  useCreateCreatorMutation,
  useUpdateChannelVerificationMutation,
} = adminApi;
