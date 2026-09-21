"use client";

import React, { useEffect } from "react";

/** Landing is always cream/light — force light theme so logos and type stay visible. */
export default function LandingShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    const wasDark = html.classList.contains("dark");
    const prevTheme = html.dataset.theme;
    html.classList.remove("dark");
    html.dataset.theme = "light";
    return () => {
      if (wasDark) html.classList.add("dark");
      if (prevTheme) html.dataset.theme = prevTheme;
      else delete html.dataset.theme;
    };
  }, []);

  return (
    <div className="landing min-h-svh bg-[#f7f5f0] font-sans text-[#1c1c1e] antialiased">
      {children}
    </div>
  );
}
