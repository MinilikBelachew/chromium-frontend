"use client";

import { useCallback, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLogoutMutation } from "@/context/services/authApi";
import { clearClientAuthSession } from "@/lib/auth-session";

/**
 * Confirmed sign-out that always clears local session, then routes to /sign-in.
 * Avoids dashboards getting stuck on "Loading…" after RTK cache reset.
 */
export function useSignOut() {
  const router = useRouter();
  const [logout] = useLogoutMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const requestSignOut = useCallback(() => {
    if (signingOut) return;
    setConfirmOpen(true);
  }, [signingOut]);

  const cancelSignOut = useCallback(() => {
    if (signingOut) return;
    setConfirmOpen(false);
  }, [signingOut]);

  const confirmSignOut = useCallback(async () => {
    if (signingOut) return;
    setSigningOut(true);
    setConfirmOpen(false);
    try {
      await logout().unwrap();
    } catch {
      /* local clear below still runs */
    } finally {
      clearClientAuthSession();
      router.replace("/sign-in");
    }
  }, [logout, router, signingOut]);

  return {
    confirmOpen,
    signingOut,
    requestSignOut,
    cancelSignOut,
    confirmSignOut,
  };
}
