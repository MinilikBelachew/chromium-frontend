"use client";

import React from "react";
import BrandLogo from "@/components/common/BrandLogo";
import ThemeToggle from "@/components/common/ThemeToggle";

/** Creator auth — same centered layout as login */
export default function AuthShell({
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
    <main className="relative isolate min-h-svh w-full overflow-hidden bg-background font-sans">
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

      <div className="flex min-h-svh items-center justify-center px-5 py-28 sm:px-8">
        <div className="w-full max-w-[440px]">
          <h1 className="text-[28px] font-semibold leading-[1.15] tracking-[-0.035em] text-foreground sm:text-[32px]">
            {title}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
          <div className="mt-8">{children}</div>
          {footer ? (
            <div className="mt-8 text-center text-[13px] tracking-[-0.01em] text-muted-foreground">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
