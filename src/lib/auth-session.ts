import { clearAuthTokens } from "@/lib/auth-token";
import { clearCreatorSession } from "@/lib/creator-session";
import { api } from "@/context/services";
import { store } from "@/context/store";

/**
 * Clears client auth state after server logout (or when logout fails).
 * Always drops access + refresh tokens and RTK cache.
 */
export function clearClientAuthSession(): void {
  clearAuthTokens();
  clearCreatorSession();
  store.dispatch(api.util.resetApiState());
}
