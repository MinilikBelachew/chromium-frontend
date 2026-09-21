"use client";

import React from "react";
import { Reveal } from "../motion";

const logos = ["YouTube", "Creators", "Viewers", "Leaderboards", "Verified", "Sessions"];

export default function Marquee() {
  return (
    <section className="border-b border-[#1c1c1e]/10 bg-[#f7f5f0] px-6 py-12 sm:py-16">
      <Reveal>
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {logos.map((name) => (
            <span
              key={name}
              className="text-[13px] font-medium tracking-[0.04em] text-[#1c1c1e]/35 uppercase"
            >
              {name}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
