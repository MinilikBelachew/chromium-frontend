import React from "react";

const words = [
  "verified engagement",
  "immutable ledger",
  "authorized sessions",
  "monthly settlement",
  "integrity checks",
  "creator share",
];

export default function Marquee() {
  const row = [...words, ...words];

  return (
    <section className="border-y border-border bg-muted py-5">
      <div className="overflow-hidden">
        <div className="marquee-track items-center gap-8 pr-8">
          {row.map((word, index) => (
            <span key={`${word}-${index}`} className="flex shrink-0 items-center gap-8">
              <span className="text-[26px] font-semibold tracking-[-0.03em] text-foreground sm:text-[34px]">
                {word}
              </span>
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-sunrise-coral" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
