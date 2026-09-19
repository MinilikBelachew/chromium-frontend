"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type OnboardingStep = {
  id: string;
  label: string;
  description?: string;
};

export default function OnboardingStepper({
  steps,
  currentIndex,
  className,
}: {
  steps: OnboardingStep[];
  currentIndex: number;
  className?: string;
}) {
  return (
    <ol className={cn("flex flex-col gap-0", className)}>
      {steps.map((step, index) => {
        const complete = index < currentIndex;
        const active = index === currentIndex;
        const upcoming = index > currentIndex;

        return (
          <li key={step.id} className="relative flex gap-3.5 pb-7 last:pb-0">
            {index < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[13px] top-7 h-[calc(100%-14px)] w-px",
                  complete ? "bg-sunrise-coral/35" : "bg-border/60",
                )}
              />
            ) : null}

            <span
              className={cn(
                "relative z-10 grid size-7 shrink-0 place-items-center rounded-full border text-[12px] font-medium tracking-[-0.01em]",
                complete &&
                  "border-sunrise-coral/50 bg-sunrise-coral/15 text-sunrise-coral",
                active &&
                  "border-sunrise-coral/60 bg-transparent text-sunrise-coral",
                upcoming && "border-border/70 bg-transparent text-muted-foreground/50",
              )}
            >
              {complete ? <Check className="size-3.5" strokeWidth={2.5} /> : index + 1}
            </span>

            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  "text-[13px] font-medium tracking-[-0.02em]",
                  active && "text-foreground/85",
                  complete && "text-foreground/70",
                  upcoming && "text-muted-foreground/55",
                )}
              >
                {step.label}
              </p>
              {step.description ? (
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground/55">
                  {step.description}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
