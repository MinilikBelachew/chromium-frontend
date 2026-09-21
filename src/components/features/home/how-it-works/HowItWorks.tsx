"use client";

import React from "react";
import { Reveal } from "../motion";

const points = [
  "Register your YouTube channel once",
  "Choose the mini-game on your channel",
  "See verified sessions and watch time",
  "Daily leaderboards your audience can climb",
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="bg-[#f7f5f0] px-6 py-24 sm:py-32">
      <div className="mx-auto grid max-w-[1120px] gap-14 lg:grid-cols-2 lg:gap-20 lg:items-center">
        <Reveal>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-normal leading-[1.08] tracking-[-0.04em] text-[#1c1c1e]">
            Tell Vero once. Watch engagement stay honest.
          </h2>
          <p className="mt-5 max-w-[420px] text-[15px] leading-[1.65] text-[#1c1c1e]/70">
            Creators set up a channel. Viewers open the Vero browser. Sessions, scores, and boards
            are first-party — not YouTube Studio guesses.
          </p>
          <ul className="mt-10 space-y-0 border-t border-[#1c1c1e]/10">
            {points.map((item) => (
              <li
                key={item}
                className="border-b border-[#1c1c1e]/10 py-4 text-[15px] tracking-[-0.01em] text-[#1c1c1e]"
              >
                <span className="mr-3 font-normal text-[#fc5f2b]">›</span>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/6]">
            <img
              src="/landing-hero.jpg"
              alt=""
              className="h-full w-full object-cover object-center"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default HowItWorks;
