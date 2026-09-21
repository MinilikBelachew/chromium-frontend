import { api } from "./index";
import {
  clearAuthTokens,
  getRefreshToken,
  saveAuthTokens,
  type AuthTokens,
} from "@/lib/auth-token";
import type { AuthUser } from "@/lib/auth-routing";

export type LoginResponse = AuthTokens & {
  user: AuthUser;
};

export type ViewerRegisterBody = {
  email: string;
  password: string;
  name: string;
  phone: string;
  emailVerifiedToken: string;
};

export type CreatorRegisterBody = {
  email: string;
  password: string;
  name: string;
  channelUrl: string;
  gameSlug: string;
  phone?: string;
  emailVerifiedToken: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type GoogleLoginBody = {
  idToken: string;
  /** Google is viewer-only; creators register with email. */
  intent?: "viewer";
};

export type SendEmailOtpBody = {
  email: string;
};

export type SendEmailOtpResponse = {
  challengeToken: string;
  expiresIn: number;
};

export type VerifyEmailOtpBody = {
  email: string;
  code: string;
  challengeToken: string;
};

export type VerifyEmailOtpResponse = {
  emailVerifiedToken: string;
};

export type CheckPhoneBody = {
  phone: string;
};

export type CheckPhoneResponse = {
  available: boolean;
  phone: string;
};

export type ForgotPasswordBody = {
  email: string;
};

export type ForgotPasswordResponse = {
  challengeToken: string;
  expiresIn: number;
};

export type VerifyForgotOtpBody = {
  email: string;
  code: string;
  challengeToken: string;
};

export type VerifyForgotOtpResponse = {
  resetToken: string;
};

export type ResetPasswordBody = {
  resetToken: string;
  password: string;
};

export type ChangePasswordBody = {
  oldPassword: string;
  password: string;
};

export type RefreshResponse = AuthTokens;

export type OnboardingChannel = {
  id: number;
  youtubeChannelId: string;
  channelName: string;
  channelUrl: string;
  verificationStatus: string;
  gameId?: number | null;
  gameSlug?: string | null;
  gameName?: string | null;
};

export type OnboardingCreator = {
  id: number;
  status: string;
  plan: string;
  planStartedAt?: string | null;
  channels: OnboardingChannel[];
};

export type OnboardingProfile = {
  user: AuthUser;
  creator?: OnboardingCreator | null;
};

function persistTokens(response: AuthTokens) {
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

    googleLogin: build.mutation<LoginResponse, GoogleLoginBody>({
      query: (body) => ({
        url: "/auth/google/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        persistTokens(data);
      },
      invalidatesTags: ["Onboarding"],
    }),

    sendEmailOtp: build.mutation<SendEmailOtpResponse, SendEmailOtpBody>({
      query: (body) => ({
        url: "/auth/email/send-otp",
        method: "POST",
        body,
      }),
    }),

    verifyEmailOtp: build.mutation<VerifyEmailOtpResponse, VerifyEmailOtpBody>({
      query: (body) => ({
        url: "/auth/email/verify-otp",
        method: "POST",
        body,
      }),
    }),

    checkPhone: build.mutation<CheckPhoneResponse, CheckPhoneBody>({
      query: (body) => ({
        url: "/auth/phone/check",
        method: "POST",
        body,
      }),
    }),

    forgotPassword: build.mutation<ForgotPasswordResponse, ForgotPasswordBody>({
      query: (body) => ({
        url: "/auth/forgot/password",
        method: "POST",
        body,
      }),
    }),

    verifyForgotOtp: build.mutation<
      VerifyForgotOtpResponse,
      VerifyForgotOtpBody
    >({
      query: (body) => ({
        url: "/auth/forgot/verify-otp",
        method: "POST",
        body,
      }),
    }),

    resetPassword: build.mutation<void, ResetPasswordBody>({
      query: (body) => ({
        url: "/auth/reset/password",
        method: "POST",
        body,
      }),
    }),

    changePassword: build.mutation<void, ChangePasswordBody>({
      query: (body) => ({
        url: "/auth/change-password",
        method: "POST",
        body,
      }),
    }),

    refresh: build.mutation<RefreshResponse, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
        headers: {
          Authorization: `Bearer ${getRefreshTokenHeader()}`,
        },
      }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        persistTokens(data);
      },
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

    addOnboardingChannel: build.mutation<
      OnboardingChannel,
      { channelUrl: string; channelName?: string; gameSlug: string }
    >({
      query: (body) => ({
        url: "/onboarding/channel",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Onboarding"],
    }),

    logout: build.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
        } catch {
          /* still clear local session below */
        } finally {
          clearAuthTokens();
          dispatch(api.util.resetApiState());
        }
      },
    }),
  }),
});

function getRefreshTokenHeader(): string {
  return getRefreshToken() ?? "";
}

export const {
  useLoginMutation,
  useGoogleLoginMutation,
  useSendEmailOtpMutation,
  useVerifyEmailOtpMutation,
  useCheckPhoneMutation,
  useForgotPasswordMutation,
  useVerifyForgotOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useRefreshMutation,
  useViewerRegisterMutation,
  useCreatorRegisterMutation,
  useGetOnboardingMeQuery,
  useLazyGetOnboardingMeQuery,
  useAddOnboardingChannelMutation,
  useLogoutMutation,
} = authApi;
