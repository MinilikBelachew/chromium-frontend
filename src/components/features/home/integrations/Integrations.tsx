"use client";

import React from "react";
import { Reveal, RevealStagger } from "../motion";

const apps = [
  "YouTube",
  "Browser",
  "Games",
  "VPN",
  "Boards",
  "Analytics",
];

export default function Integrations() {
  return (
    <section className="border-t border-[#1c1c1e]/10 bg-[#f7f5f0] px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-[720px] text-center">
        <Reveal>
          <h2 className="font-display text-[clamp(1.75rem,3vw,2.35rem)] font-normal tracking-[-0.035em] text-[#1c1c1e]">
            One loop for watching and play
          </h2>
          <p className="mx-auto mt-4 max-w-[400px] text-[15px] leading-[1.55] text-[#1c1c1e]/70">
            Vero sits beside YouTube — browser, games, and first-party sessions.
          </p>
        </Reveal>
        <RevealStagger className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {apps.map((app) => (
            <span
              key={app}
              className="text-[13px] font-normal tracking-[0.06em] text-[#fc5f2b] uppercase"
            >
              {app}
            </span>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
