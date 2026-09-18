import { api } from "./index";
import { saveAuthTokens, type AuthTokens } from "@/lib/auth-token";
import type { AuthUser } from "@/lib/auth-routing";

export type LoginResponse = AuthTokens & {
  user: AuthUser;
};

export type ViewerRegisterBody = {
  email: string;
  password: string;
  name: string;
  phone: string;
};

export type CreatorRegisterBody = {
  email: string;
  password: string;
  name: string;
  channelUrl: string;
  phone?: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type OnboardingChannel = {
  id: number;
  youtubeChannelId: string;
  channelName: string;
  channelUrl: string;
  verificationStatus: string;
};

export type OnboardingCreator = {
  id: number;
  status: string;
  plan: string;
  planStartedAt?: string | null;
  channels: OnboardingChannel[];
};

export type OnboardingWalletEntry = {
  id: number;
  label: string;
  amount: string;
  type: string;
  createdAt: string;
};

export type OnboardingWallet = {
  id: number;
  currency: string;
  balance: string;
  entries: OnboardingWalletEntry[];
};

export type OnboardingProfile = {
  user: AuthUser;
  creator?: OnboardingCreator | null;
  wallet?: OnboardingWallet | null;
};

function persistTokens(response: LoginResponse) {
  saveAuthTokens({
    token: response.token,
    refreshToken: response.refreshToken,
    tokenExpires: response.tokenExpires,
  });
}

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginBody>({
      query: (body) => ({
        url: "/auth/email/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        persistTokens(data);
      },
      invalidatesTags: ["Onboarding"],
    }),

    viewerRegister: build.mutation<LoginResponse, ViewerRegisterBody>({
      query: (body) => ({
        url: "/auth/viewer/register",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        persistTokens(data);
      },
      invalidatesTags: ["Onboarding"],
    }),

    creatorRegister: build.mutation<LoginResponse, CreatorRegisterBody>({
      query: (body) => ({
        url: "/auth/creator/register",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        persistTokens(data);
      },
      invalidatesTags: ["Onboarding"],
    }),

    getOnboardingMe: build.query<OnboardingProfile, void>({
      query: () => "/onboarding/me",
      providesTags: ["Onboarding"],
    }),

    getOnboardingWallet: build.query<OnboardingWallet, void>({
      query: () => "/onboarding/wallet",
      providesTags: ["Onboarding"],
    }),

    logout: build.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useViewerRegisterMutation,
  useCreatorRegisterMutation,
  useGetOnboardingMeQuery,
  useLazyGetOnboardingMeQuery,
  useGetOnboardingWalletQuery,
  useLogoutMutation,
} = authApi;
