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
    <main className="relative isolate min-h-svh w-full overflow-x-clip overflow-y-auto bg-background font-sans">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 40% at 50% -8%, color-mix(in srgb, var(--color-sunrise-coral) 14%, transparent), transparent 70%)",
        }}
      />

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 sm:px-8">
        <BrandLogo size={36} />
        <ThemeToggle />
      </header>

      {/* Mobile progress — top */}
      <div className="absolute inset-x-0 top-[72px] z-10 px-5 sm:px-8 lg:hidden">
        <div className="mx-auto flex max-w-[440px] gap-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="h-1 flex-1 overflow-hidden rounded-full bg-muted"
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
        <p className="mx-auto mt-2 max-w-[440px] text-center text-[12px] text-muted-foreground">
          Step {currentIndex + 1} of {steps.length} · {steps[currentIndex]?.label}
        </p>
      </div>

      {/* Centered form */}
      <div className="flex min-h-svh items-center justify-center px-5 py-28 sm:px-8">
        <div className="w-full max-w-[440px]">
          {children}
          {footer ? (
            <div className="mt-8 text-center text-[13px] tracking-[-0.01em] text-muted-foreground">
              {footer}
            </div>
          ) : null}
        </div>
      </div>

      {/* Desktop: vertical stepper tucked in bottom-left corner — low-key, no card chrome */}
      <aside className="pointer-events-none absolute bottom-8 left-8 z-10 hidden w-[200px] lg:block xl:bottom-10 xl:left-10">
        <div className="pointer-events-auto">
          {eyebrow ? (
            <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
              {eyebrow}
            </p>
          ) : null}
          <OnboardingStepper steps={steps} currentIndex={currentIndex} />
        </div>
      </aside>
    </main>
  );
}
