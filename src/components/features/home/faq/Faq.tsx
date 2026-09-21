"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { Reveal } from "../motion";

const faqs = [
  {
    q: "Does Fanaye spoof geography or ad markets?",
    a: "No. Engagement is measured from the Fanaye browser on verified channels — never geo/IP manipulation or artificial impressions.",
  },
  {
    q: "What do creators get today?",
    a: "Verified watch sessions, mini-game play, daily leaderboards, and analytics. Payouts are not live yet.",
  },
  {
    q: "How do leaderboards work?",
    a: "Viewers submit scores while watching a verified channel. Boards reset each UTC day per game and per channel.",
  },
  {
    q: "Who can join?",
    a: "Viewers register with name, email, and phone. Creators add a YouTube channel and wait for verification.",
  },
  {
    q: "Is Pro available?",
    a: "Starter is free today. Pro billing and settlements ship later — we don’t sell a fake upgrade.",
  },
];

const Faq: React.FC = () => {
  return (
    <section id="faq" className="bg-[#f7f5f0] px-6 py-24 sm:py-32">
      <div className="mx-auto grid max-w-[1120px] gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <h2 className="text-[clamp(1.85rem,3.5vw,2.75rem)] font-medium leading-[1.1] tracking-[-0.04em] text-[#1c1c1e]">
            Questions answered
          </h2>
          <p className="mt-4 max-w-[300px] text-[15px] leading-[1.55] text-[#1c1c1e]/5">
            Watching, games, verification, and what is live today.
          </p>
          <Link
            href="/get-started"
            className="mt-8 inline-flex border border-[#1c1c1e] px-5 py-2.5 text-[13px] font-medium text-[#1c1c1e] transition-colors duration-300 hover:bg-[#1c1c1e] hover:text-white"
          >
            Get started
          </Link>
        </Reveal>

        <Reveal delay={0.1} className="border-t border-[#1c1c1e]/10">
          {faqs.map((item) => (
            <details key={item.q} className="group border-b border-[#1c1c1e]/10">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6">
                <span className="text-[16px] font-medium tracking-[-0.02em] text-[#1c1c1e]">
                  {item.q}
                </span>
                <span className="text-[18px] text-[#1c1c1e]/35 transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="max-w-[520px] pb-6 text-[14px] leading-[1.65] text-[#1c1c1e]/55">
                {item.a}
              </p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
};

export default Faq;
