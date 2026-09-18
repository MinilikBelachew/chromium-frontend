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
    <main className="min-h-svh bg-background">
      <div className="mx-auto flex min-h-svh w-full max-w-[1200px] flex-col px-6 py-8">
        <div className="flex items-center justify-between">
          <BrandLogo size={40} />
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center py-12">
          <h1 className="text-heading text-foreground max-sm:text-[26px]">{title}</h1>
          <p className="mt-3 text-[15px] leading-normal tracking-[-0.005em] text-muted-foreground">
            {subtitle}
          </p>
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-8 text-[13px] text-muted-foreground">{footer}</div> : null}
        </div>
      </div>
    </main>
  );
}
