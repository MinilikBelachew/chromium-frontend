"use client";

import React from "react";
import BrandLogo from "@/components/common/BrandLogo";
import ThemeToggle from "@/components/common/ThemeToggle";
import OnboardingStepper, {
  type OnboardingStep,
} from "@/components/features/onboarding/OnboardingStepper";

export default function OnboardingShell({
  steps,
  currentIndex,
  children,
  footer,
  eyebrow,
}: {
  steps: OnboardingStep[];
  currentIndex: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <main className="font-display min-h-svh w-full bg-background">
      <div className="flex min-h-svh w-full max-w-none flex-col px-6 py-8 sm:px-10 lg:px-14 xl:px-20">
        <div className="flex w-full items-center justify-between">
          <BrandLogo size={40} />
          <ThemeToggle />
        </div>

        <div className="mt-12 grid w-full flex-1 gap-12 lg:mt-16 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] lg:gap-20 xl:gap-28">
          <aside className="lg:pt-1">
            {eyebrow ? (
              <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-gray">
                {eyebrow}
              </p>
            ) : null}

            <div className="mb-8 flex gap-2 lg:hidden">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-fog-gray"
                  title={step.label}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      index <= currentIndex ? "w-full bg-sunrise-coral" : "w-0"
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="hidden lg:block">
              <OnboardingStepper steps={steps} currentIndex={currentIndex} />
            </div>

            <p className="mt-2 text-[13px] tracking-[-0.02em] text-zinc-gray lg:hidden">
              Step {currentIndex + 1} of {steps.length} ·{" "}
              {steps[currentIndex]?.label}
            </p>
          </aside>

          <section className="w-full max-w-none pb-12 lg:self-start">
            {children}
            {footer ? (
              <div className="mt-8 text-[13px] tracking-[-0.02em] text-muted-foreground">
                {footer}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
