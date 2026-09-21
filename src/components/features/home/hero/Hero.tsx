"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight, Sparkles } from "lucide-react";

const rotating = ["real watching", "verified sessions", "daily leaderboards", "honest analytics"];

const Hero: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % rotating.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="grain relative isolate overflow-hidden bg-background pb-16 pt-32 sm:pt-36">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(252,95,43,0.35),transparent_65%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-40 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.28),transparent_65%)] blur-2xl"
      />

      <div className="wide-shell relative">
        <div className="animate-rise flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-sunrise-coral" />
            no spoofing · no fake views
          </span>
        </div>

        <h1 className="animate-rise mx-auto mt-8 max-w-[1100px] text-center text-[13vw] font-semibold leading-[0.92] tracking-[-0.045em] text-foreground sm:text-[9vw] lg:text-[104px]">
          Get paid for
          <span className="relative mx-3 inline-block">
            <span className="absolute inset-x-0 bottom-[0.12em] -z-10 h-[0.42em] -rotate-1 rounded-full bg-sunrise-coral/25" />
            <span className="italic">{rotating[index]}</span>
          </span>
          <span className="block">not for guesswork.</span>
        </h1>

        <p className="animate-rise mx-auto mt-8 max-w-[560px] text-center text-[17px] leading-[1.6] text-muted-foreground">
          Fanaye turns authorized viewing into verified sessions and mini-game competition. Creators
          register a channel; viewers watch and play in the Fanaye browser.
        </p>

        <div className="animate-rise mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-full bg-sunrise-coral px-7 py-4 text-[15px] font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            Join as a viewer
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-4 text-[15px] font-bold text-foreground transition-transform hover:-translate-y-0.5"
          >
            I’m a creator
          </Link>
        </div>

        <div className="relative mt-16">
          <Sticker className="-left-2 top-4 hidden rotate-[-8deg] sm:block" tone="coral" label="Games + watch" />
          <Sticker className="right-0 top-0 hidden rotate-[7deg] md:block" tone="blue" label="Daily boards" />
          <Sticker className="bottom-6 left-1/2 hidden -translate-x-1/2 rotate-[3deg] lg:block" tone="mint" label="Server-confirmed" />

          <div className="mx-auto max-w-[980px] overflow-hidden rounded-[28px] border border-border bg-card p-3 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.45)]">
            <div className="rounded-[20px] border border-border bg-background p-6 sm:p-10">
              <div className="grid gap-6 sm:grid-cols-3">
                <Metric value="128" label="Confirmed sessions" note="this month" />
                <Metric value="7" label="Catalog games" note="beside the video" accent />
                <Metric value="0" label="Fake impressions" note="by design" />
              </div>
              <div className="mt-8 h-[120px] w-full">
                <svg viewBox="0 0 600 120" className="h-full w-full" aria-hidden>
                  <path
                    d="M0 92 C60 78, 110 34, 170 46 S280 104, 340 72 S470 20, 600 40"
                    fill="none"
                    stroke="#fc5f2b"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0 104 C60 98, 110 84, 170 90 S280 110, 340 100 S470 76, 600 86"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.55"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function Sticker({
  label,
  tone,
  className = "",
}: {
  label: string;
  tone: "coral" | "blue" | "mint";
  className?: string;
}) {
  const tones = {
    coral: "bg-sunrise-coral text-white",
    blue: "bg-[#3B82F6] text-white",
    mint: "bg-[#10B981] text-white",
  } as const;

  return (
    <span
      className={`animate-float-slow absolute z-10 rounded-2xl px-4 py-2 text-[12px] font-bold shadow-lg ${tones[tone]} ${className}`}
    >
      {label}
    </span>
  );
}

function Metric({
  value,
  label,
  note,
  accent,
}: {
  value: string;
  label: string;
  note: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p
        className={`text-[30px] font-semibold tracking-[-0.03em] ${
          accent ? "text-sunrise-coral" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-[13px] font-medium text-foreground">{label}</p>
      <p className="text-[12px] text-muted-foreground">{note}</p>
    </div>
  );
}

export default Hero;
