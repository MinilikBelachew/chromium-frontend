import React from "react";
import BrandLogo from "@/components/common/BrandLogo";
import ThemeToggle from "@/components/common/ThemeToggle";

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
    <main className="font-display min-h-svh w-full bg-background">
      <div className="flex min-h-svh w-full max-w-none flex-col px-6 py-8 sm:px-10 lg:px-14 xl:px-20">
        <div className="flex w-full items-center justify-between">
          <BrandLogo size={40} />
          <ThemeToggle />
        </div>

        <div className="flex w-full max-w-none flex-1 flex-col justify-center py-12">
          <h1 className="text-onboarding-title text-foreground">{title}</h1>
          <p className="text-onboarding-subtitle mt-4 max-w-[36em] text-muted-foreground">
            {subtitle}
          </p>
          <div className="mt-10 w-full max-w-[520px]">{children}</div>
          {footer ? (
            <div className="mt-8 text-[13px] tracking-[-0.02em] text-muted-foreground">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
