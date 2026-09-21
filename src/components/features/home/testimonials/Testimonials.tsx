"use client";

import React from "react";
import { Reveal, RevealStagger } from "../motion";

const quotes = [
  {
    body: "We finally see who actually watched — and which game kept them around.",
    name: "Sara K.",
    role: "Creator",
  },
  {
    body: "Daily boards give my community something to chase while the video plays.",
    name: "Daniel M.",
    role: "Creator",
  },
  {
    body: "Open a verified channel, play, climb the board. Simple.",
    name: "Maya R.",
    role: "Viewer",
  },
];

export default function Testimonials() {
  return (
    <section className="border-y border-[#1c1c1e]/10 bg-[#f7f5f0] px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-[1120px]">
        <Reveal>
          <h2 className="max-w-[560px] text-[clamp(1.85rem,3.5vw,2.75rem)] font-medium leading-[1.1] tracking-[-0.04em] text-[#1c1c1e]">
            People stay for the honesty
          </h2>
        </Reveal>
        <RevealStagger className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10">
          {quotes.map((q) => (
            <blockquote key={q.name}>
              <p className="text-[17px] leading-[1.55] tracking-[-0.02em] text-[#1c1c1e]">
                “{q.body}”
              </p>
              <footer className="mt-6 text-[13px] text-[#1c1c1e]/45">
                {q.name} · {q.role}
              </footer>
            </blockquote>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
