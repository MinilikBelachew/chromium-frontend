"use client";

import { useEffect, useRef } from "react";
import {
  shouldRefreshAccessToken,
  hasRefreshToken,
} from "@/lib/auth-token";
import { refreshSession } from "@/context/services";

/**
 * Seamless auth: refresh access token before expiry and when the tab is focused.
 */
export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const busyRef = useRef(false);

  useEffect(() => {
    async function ensureFreshAccess() {
      if (!hasRefreshToken() || !shouldRefreshAccessToken()) return;
      if (busyRef.current) return;
      busyRef.current = true;
      try {
        await refreshSession();
      } finally {
        busyRef.current = false;
      }
    }

    void ensureFreshAccess();
    const interval = window.setInterval(() => {
      void ensureFreshAccess();
    }, 30_000);

    function onVisible() {
      if (document.visibilityState === "visible") {
        void ensureFreshAccess();
      }
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return <>{children}</>;
}
