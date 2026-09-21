"use client";

import React from "react";
import { Reveal, RevealStagger } from "../motion";

const items = [
  {
    n: "01",
    title: "Verified channels",
    body: "Creators register a YouTube channel. Ownership is confirmed before engagement counts.",
  },
  {
    n: "02",
    title: "Vero browser",
    body: "Viewers watch registered channels with session-bound play — not spoofed geography.",
  },
  {
    n: "03",
    title: "Mini-games",
    body: "Play the channel’s catalog game beside the video. Bubble, Snake, 2048, and more.",
  },
  {
    n: "04",
    title: "Daily boards",
    body: "Scores land on UTC daily leaderboards per game and channel. Immediate ranks.",
  },
];

const Features: React.FC = () => {
  return (
    <section id="features" className="bg-[#f7f5f0] px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-[1120px]">
        <Reveal className="grid gap-6 border-b border-[#1c1c1e]/10 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] font-normal leading-[1.08] tracking-[-0.04em] text-[#1c1c1e]">
            Built for creators and viewers who want honesty
          </h2>
          <p className="max-w-[360px] text-[15px] leading-[1.6] text-[#1c1c1e]/70 lg:justify-self-end lg:text-right">
            Authorized watching. First-party sessions. No geo tricks or black-box metrics.
          </p>
        </Reveal>

        <RevealStagger className="mt-4">
          {items.map((item) => (
            <article
              key={item.n}
              className="grid gap-4 border-b border-[#1c1c1e]/10 py-10 sm:grid-cols-[88px_1fr_1.2fr] sm:gap-8"
            >
              <p className="text-[13px] font-normal tracking-[0.08em] text-[#fc5f2b]">
                {item.n}
              </p>
              <h3 className="font-display text-[22px] font-normal tracking-[-0.03em] text-[#1c1c1e]">
                {item.title}
              </h3>
              <p className="text-[15px] leading-[1.6] text-[#1c1c1e]/70">{item.body}</p>
            </article>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
};

export default Features;
