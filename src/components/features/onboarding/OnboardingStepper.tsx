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
          <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
            {index < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%-16px)] w-px",
                  complete ? "bg-sunrise-coral" : "bg-mist-gray",
                )}
              />
            ) : null}

            <span
              className={cn(
                "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border text-[13px] font-bold tracking-[-0.005em]",
                complete &&
                  "border-sunrise-coral bg-sunrise-coral text-paper-white",
                active &&
                  "border-sunrise-coral bg-paper-white text-sunrise-coral ring-4 ring-sunrise-coral/10",
                upcoming && "border-mist-gray bg-fog-gray text-ash-gray",
              )}
            >
              {complete ? <Check className="size-4" strokeWidth={3} /> : index + 1}
            </span>

            <div className="min-w-0 pt-1">
              <p
                className={cn(
                  "font-display text-[15px] font-medium tracking-[-0.03em]",
                  active || complete ? "text-carbon-black" : "text-ash-gray",
                )}
              >
                {step.label}
              </p>
              {step.description ? (
                <p className="mt-0.5 font-display text-[13px] font-normal leading-normal tracking-[-0.02em] text-zinc-gray">
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
