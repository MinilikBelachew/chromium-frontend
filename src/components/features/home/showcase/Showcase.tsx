"use client";

import React from "react";
import { Reveal } from "../motion";

export default function Showcase() {
  return (
    <section className="bg-[#f7f5f0]">
      <Reveal>
        <div className="relative min-h-[56vh] w-full overflow-hidden sm:min-h-[70vh]">
          <img
            src="/landing-hero.jpg"
            alt="Fanaye engagement landscape"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div aria-hidden className="absolute inset-0 bg-black/35" />
          <div className="relative z-10 flex min-h-[56vh] items-end px-6 py-12 sm:min-h-[70vh] sm:px-10 sm:py-16">
            <p className="max-w-[420px] text-[clamp(1.35rem,2.5vw,1.75rem)] font-medium leading-[1.25] tracking-[-0.03em] text-white">
              Progress you can audit — sessions, watch time, and game plays from the Fanaye browser.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
