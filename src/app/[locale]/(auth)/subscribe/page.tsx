"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

/** Subscription is no longer part of creator onboarding. */
export default function SubscribePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <main className="grid min-h-svh place-items-center bg-background text-[15px] text-muted-foreground">
      Redirecting to dashboard…
    </main>
  );
}
