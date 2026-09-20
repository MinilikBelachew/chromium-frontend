"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight, Eye, Radio } from "lucide-react";
import BrandLogo from "@/components/common/BrandLogo";
import ThemeToggle from "@/components/common/ThemeToggle";

const options = [
  {
    href: "/register",
    title: "Viewer",
    description: "Watch registered channels and climb daily mini-game leaderboards.",
    cta: "Join as a viewer",
    accent: "coral" as const,
  },
  {
    href: "/sign-up",
    title: "Creator",
    description: "Register your YouTube channel and get paid for confirmed sessions.",
    cta: "Register a channel",
    accent: "blue" as const,
  },
];

export default function GetStartedChoice() {
  return (
    <main className="relative isolate min-h-svh w-full overflow-hidden bg-background font-sans">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(50% 38% at 30% -6%, color-mix(in srgb, var(--color-sunrise-coral) 16%, transparent), transparent 70%), radial-gradient(45% 36% at 78% 8%, color-mix(in srgb, var(--color-sky-blue) 14%, transparent), transparent 68%)",
        }}
      />

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 sm:px-8">
        <BrandLogo size={36} />
        <ThemeToggle />
      </header>

      <div className="flex min-h-svh items-center justify-center px-5 py-28 sm:px-8">
        <div className="w-full max-w-[720px]">
          <p className="text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Get started
          </p>
          <h1 className="mt-3 text-center text-[28px] font-semibold leading-[1.15] tracking-[-0.035em] text-foreground sm:text-[36px]">
            How do you want to join?
          </h1>
          <p className="mx-auto mt-3 max-w-[420px] text-center text-[15px] leading-relaxed text-muted-foreground">
            Pick a path. You can always sign in later with the account you create.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {options.map((option) => {
              const isCoral = option.accent === "coral";
              return (
                <Link
                  key={option.href}
                  href={option.href}
                  className="group flex flex-col rounded-[22px] border border-border bg-card p-6 transition-transform hover:-translate-y-0.5"
                >
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${
                      isCoral
                        ? "bg-sunrise-coral/12 text-sunrise-coral"
                        : "bg-sky-blue/12 text-sky-blue"
                    }`}
                  >
            
                  </span>
                  <h2 className="mt-5 text-[22px] font-semibold tracking-[-0.03em] text-foreground">
                    {option.title}
                  </h2>
                  <p className="mt-2 flex-1 text-[14px] leading-relaxed text-muted-foreground">
                    {option.description}
                  </p>
                  <span
                    className={`mt-6 inline-flex items-center gap-1.5 text-[14px] font-bold ${
                      isCoral ? "text-sunrise-coral" : "text-sky-blue"
                    }`}
                  >
                    {option.cta}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                  </span>
                </Link>
              );
            })}
          </div>

          <p className="mt-8 text-center text-[13px] text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-sky-blue underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
