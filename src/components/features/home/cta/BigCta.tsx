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
        <h2 className="max-w-[480px] text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium leading-[1.12] tracking-[-0.035em] text-white">
          Meet Fanaye. Built for real watching.
        </h2>
        <Link
          href="/get-started"
          className="inline-flex border border-white/40 px-6 py-3 text-[13px] font-medium text-white transition-colors duration-300 hover:bg-white hover:text-[#0c0c0c]"
        >
          Get started
        </Link>
      </Reveal>
    </section>
  );
}
