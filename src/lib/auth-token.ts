const TOKEN_KEY = "token";
const REFRESH_KEY = "refreshToken";
const EXPIRES_KEY = "tokenExpires";

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

export function hasAuthToken(): boolean {
  return Boolean(getAccessToken());
}
