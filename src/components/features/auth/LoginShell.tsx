"use client";

import React from "react";
import BrandLogo from "@/components/common/BrandLogo";
import ThemeToggle from "@/components/common/ThemeToggle";

/** Split-screen shell used only on /login — onboarding keeps OnboardingShell. */
export default function LoginShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="font-display min-h-svh w-full bg-background">
      <div className="grid min-h-svh w-full lg:grid-cols-2">
        {/* Form column */}
        <section className="relative flex min-h-svh flex-col bg-background px-6 py-8 sm:px-10 lg:px-14 xl:px-16">
          <div className="flex items-center justify-between lg:justify-start">
            <BrandLogo size={40} />
            <div className="lg:hidden">
              <ThemeToggle />
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center py-12 lg:py-16">
            <div className="w-full max-w-[420px]">
              <h1 className="text-onboarding-title text-foreground">{title}</h1>
              <p className="text-onboarding-subtitle mt-4 text-muted-foreground">
                {subtitle}
              </p>
              <div className="mt-10">{children}</div>
              {footer ? (
                <div className="mt-8 text-[13px] tracking-[-0.02em] text-muted-foreground">
                  {footer}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* Visual column — masonry collage */}
        <aside className="relative hidden min-h-svh bg-fog-gray lg:flex lg:flex-col">
          <div className="absolute right-8 top-8 z-10">
            <ThemeToggle />
          </div>

          <div className="flex flex-1 items-center justify-center p-10 xl:p-14">
            <div className="grid h-full w-full max-h-[720px] max-w-[560px] grid-cols-6 grid-rows-6 gap-3">
              <Tile className="col-span-3 row-span-3" tone="coral" />
              <Tile className="col-span-3 row-span-2" tone="ink" />
              <Tile className="col-span-2 row-span-2" tone="mist" />
              <Tile className="col-span-1 row-span-2" tone="coral-soft" />
              <Tile className="col-span-3 row-span-3" tone="slate" />
              <Tile className="col-span-3 row-span-2" tone="paper" />
              <Tile className="col-span-3 row-span-1" tone="coral" />
            </div>
          </div>

          <div className="absolute bottom-8 right-8 flex size-10 items-center justify-center rounded-full border border-mist-gray bg-paper-white text-carbon-black shadow-subtle">
            <span className="ml-0.5 text-[10px] leading-none">▶</span>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Tile({
  className,
  tone,
}: {
  className?: string;
  tone: "coral" | "coral-soft" | "ink" | "mist" | "slate" | "paper";
}) {
  const tones: Record<typeof tone, string> = {
    coral: "bg-sunrise-coral",
    "coral-soft": "bg-[#ff8b64]",
    ink: "bg-carbon-black",
    mist: "bg-mist-gray",
    slate: "bg-zinc-gray/40",
    paper: "bg-paper-white border border-mist-gray",
  };

  return (
    <div
      className={`rounded-[18px] ${tones[tone]} ${className ?? ""}`}
      aria-hidden
    />
  );
}
