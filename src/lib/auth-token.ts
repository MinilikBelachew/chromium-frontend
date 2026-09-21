const TOKEN_KEY = "token";
const REFRESH_KEY = "refreshToken";
const EXPIRES_KEY = "tokenExpires";

/** Refresh access token this many ms before it expires. */
export const ACCESS_TOKEN_REFRESH_SKEW_MS = 60_000;

export type AuthTokens = {
  token: string;
  refreshToken: string;
  tokenExpires: number;
};

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function getTokenExpires(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(EXPIRES_KEY);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function saveAuthTokens(tokens: AuthTokens): void {
  window.localStorage.setItem(TOKEN_KEY, tokens.token);
  window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  window.localStorage.setItem(EXPIRES_KEY, String(tokens.tokenExpires));
}

export function clearAuthTokens(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(EXPIRES_KEY);
}

/** True when either access or refresh token is present (seamless session). */
export function hasAuthToken(): boolean {
  return Boolean(getAccessToken() || getRefreshToken());
}

export function hasRefreshToken(): boolean {
  return Boolean(getRefreshToken());
}

/** Access token missing or within skew of expiry — refresh before calling APIs. */
export function shouldRefreshAccessToken(
  skewMs: number = ACCESS_TOKEN_REFRESH_SKEW_MS,
): boolean {
  if (!getRefreshToken()) return false;
  const access = getAccessToken();
  const expires = getTokenExpires();
  if (!access || expires == null) return true;
  return Date.now() >= expires - skewMs;
}
