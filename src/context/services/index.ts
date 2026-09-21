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
  type AuthTokens,
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

type RefreshResult = {
  ok: boolean;
};

/** Single-flight refresh so parallel 401s share one /auth/refresh call. */
let refreshInFlight: Promise<RefreshResult> | null = null;

function isAuthBootstrapUrl(url: string): boolean {
  return (
    url.includes("/auth/refresh") ||
    url.includes("/auth/email/login") ||
    url.includes("/auth/google/login") ||
    url.includes("/auth/viewer/register") ||
    url.includes("/auth/creator/register") ||
    url.includes("/auth/email/send-otp") ||
    url.includes("/auth/email/verify-otp")
  );
}

function parseRefreshPayload(data: unknown): AuthTokens | null {
  if (!data || typeof data !== "object") return null;
  const rec = data as Partial<AuthTokens>;
  if (!rec.token || !rec.refreshToken || typeof rec.tokenExpires !== "number") {
    return null;
  }
  return {
    token: rec.token,
    refreshToken: rec.refreshToken,
    tokenExpires: rec.tokenExpires,
  };
}

/** Refresh using fetch — safe to call from React providers (no RTK api needed). */
export async function refreshSession(): Promise<RefreshResult> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthTokens();
      return { ok: false };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        clearAuthTokens();
        return { ok: false };
      }
      const payload = parseRefreshPayload(await response.json());
      if (!payload) {
        clearAuthTokens();
        return { ok: false };
      }
      saveAuthTokens(payload);
      return { ok: true };
    } catch {
      clearAuthTokens();
      return { ok: false };
    }
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

async function runTokenRefresh(
  api: Parameters<BaseQueryFn>[1],
  extraOptions: Parameters<BaseQueryFn>[2],
): Promise<RefreshResult> {
  // Prefer shared single-flight path (also used by AuthSessionProvider).
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthTokens();
      return { ok: false };
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

    const payload = parseRefreshPayload(refreshResult.data);
    if (payload) {
      saveAuthTokens(payload);
      return { ok: true };
    }

    clearAuthTokens();
    return { ok: false };
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

export function refreshAccessToken(
  api: Parameters<BaseQueryFn>[1],
  extraOptions: Parameters<BaseQueryFn>[2] = {},
): Promise<RefreshResult> {
  return runTokenRefresh(api, extraOptions);
}

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const url =
      typeof args === "string" ? args : ((args as FetchArgs).url ?? "");

    if (isAuthBootstrapUrl(url) || !getRefreshToken()) {
      return result;
    }

    const refreshed = await refreshAccessToken(api, extraOptions);
    if (refreshed.ok) {
      result = await rawBaseQuery(args, api, extraOptions);
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
