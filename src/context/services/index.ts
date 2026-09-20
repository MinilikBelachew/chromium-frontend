import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
} from "@/lib/auth-token";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  "http://localhost:3001/backend/v1";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = getRefreshToken();
    const url =
      typeof args === "string" ? args : ((args as FetchArgs).url ?? "");

    // Don't loop on refresh/login endpoints
    if (
      !refreshToken ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/email/login") ||
      url.includes("/auth/logout")
    ) {
      return result;
    }

    const refreshResult = await rawBaseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
      api,
      extraOptions,
    );

    if (refreshResult.data && typeof refreshResult.data === "object") {
      const data = refreshResult.data as {
        token: string;
        refreshToken: string;
        tokenExpires: number;
      };
      saveAuthTokens({
        token: data.token,
        refreshToken: data.refreshToken,
        tokenExpires: data.tokenExpires,
      });
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      clearAuthTokens();
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth", "Onboarding", "Analytics", "Games"],
  endpoints: () => ({}),
});
