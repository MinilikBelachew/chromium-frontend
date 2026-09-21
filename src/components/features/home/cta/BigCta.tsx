"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { Reveal } from "../motion";

export default function BigCta() {
  return (
    <section className="relative min-h-[50vh] overflow-hidden bg-[#0c0c0c]">
      <img
        src="/landing-hero.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_60%]"
      />
      <div aria-hidden className="absolute inset-0 bg-black/55" />
      <Reveal className="relative z-10 mx-auto flex min-h-[50vh] max-w-[1120px] flex-col justify-end gap-8 px-6 py-16 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:py-20">
        <h2 className="max-w-[480px] font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-normal leading-[1.12] tracking-[-0.035em] text-white">
          Meet Vero. Built for{" "}
          <span className="text-[#fc5f2b]">real</span> watching.
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/download"
            className="inline-flex border border-white/50 px-6 py-3 text-[13px] font-medium text-white transition-colors duration-300 hover:border-[#fc5f2b] hover:bg-[#fc5f2b]"
          >
            Download
          </Link>
          <Link
            href="/get-started"
            className="inline-flex px-6 py-3 text-[13px] font-medium text-white/80 transition-colors duration-300 hover:text-white"
          >
            Get started
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
