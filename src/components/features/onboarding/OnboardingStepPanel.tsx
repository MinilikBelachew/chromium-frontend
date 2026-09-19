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
    <div className={cn("w-full", className)}>
      <h2 className="text-[28px] font-semibold leading-[1.15] tracking-[-0.035em] text-foreground sm:text-[32px]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
      <div className="mt-8 w-full">{children}</div>
    </div>
  );
}
