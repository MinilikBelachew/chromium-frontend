"use client";

import React from "react";
import { cn } from "@/lib/utils";

export default function OnboardingStepPanel({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full max-w-none", className)}>
      <h2 className="text-onboarding-title text-foreground">{title}</h2>
      {subtitle ? (
        <p className="text-onboarding-subtitle mt-4 max-w-[36em] text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
      <div className="mt-10 w-full max-w-[520px]">{children}</div>
    </div>
  );
}
