"use client";

import React, { useEffect, useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { useRouter, Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import AuthShell from "@/components/features/creator/AuthShell";
import {
  activateProPlan,
  getCreatorSession,
  saveCreatorSession,
  type CreatorSession,
} from "@/lib/creator-session";

const proFeatures = [
  "Creator dashboard with earnings & ledger",
  "Channel verification workflow",
  "Verified engagement analytics",
  "Monthly settlement & payouts",
  "Integrity-protected revenue events",
];

export default function SubscribeProForm() {
  const router = useRouter();
  const [session, setSession] = useState<CreatorSession | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const current = getCreatorSession();
    if (!current) {
      router.replace("/sign-up");
      return;
    }
    if (current.plan === "pro") {
      router.replace("/dashboard");
      return;
    }
    setSession(current);
  }, [router]);

  function activate() {
    if (!session) return;
    setLoading(true);
    const next = activateProPlan(session);
    saveCreatorSession(next);
    router.push("/dashboard");
  }

  if (!session) {
    return (
      <main className="grid min-h-svh place-items-center bg-background text-[15px] text-muted-foreground">
        Loading…
      </main>
    );
  }

  return (
    <AuthShell
      title="Activate Pro"
      subtitle={`Welcome, ${session.name}. Subscribe to Pro to unlock your creator dashboard and settlement tools.`}
      footer={
        <>
          Channel submitted:{" "}
          <span className="text-carbon-black">{session.channelName}</span>
          {" · "}
          <Link href="/sign-up" className="underline-offset-4 hover:underline">
            Edit signup
          </Link>
        </>
      }
    >
      <div
        className="overflow-hidden rounded-[15px] p-[19px] text-paper-white shadow-subtle"
        style={{ background: "var(--gradient-coral-glow)" }}
      >
        <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-paper-white/85">
          Vireo Pro
        </p>
        <p className="mt-3 text-[45px] leading-[1.1] tracking-[-0.015em]">$17</p>
        <p className="text-[15px] text-paper-white/85">per month · cancel anytime</p>
      </div>

      <ul className="mt-6 space-y-[11px]">
        {proFeatures.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-0.5 grid size-[19px] shrink-0 place-items-center rounded-[7.5px] bg-sunrise-coral text-paper-white">
              <Check className="size-3" strokeWidth={3} />
            </span>
            <span className="text-[15px] leading-[1.4] text-carbon-black">{item}</span>
          </li>
        ))}
      </ul>

      <Button type="button" className="mt-8 w-full" onClick={activate} disabled={loading}>
        Subscribe to Pro
        <ArrowRight className="size-4" />
      </Button>

      <p className="mt-4 text-center text-caption text-zinc-gray">
        Frontend-only demo — no real payment charged.
      </p>
    </AuthShell>
  );
}
