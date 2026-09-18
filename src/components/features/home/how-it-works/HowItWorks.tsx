import React from "react";

const steps = [
  {
    n: "01",
    title: "Register & verify",
    body: "Creators drop a YouTube channel link. Ownership is reviewed before anything can earn.",
    tone: "bg-[#FFF1E9] text-[#9A3412] dark:bg-[#2A1710] dark:text-[#FFC5A8]",
    tilt: "lg:-rotate-2",
  },
  {
    n: "02",
    title: "Watch on purpose",
    body: "Viewers open an authorized session on a registered channel. Everything else stays normal YouTube.",
    tone: "bg-[#E8F3FF] text-[#1E40AF] dark:bg-[#0F1B2E] dark:text-[#A8C9FF]",
    tilt: "lg:rotate-1",
  },
  {
    n: "03",
    title: "Confirm server-side",
    body: "VIEW_STARTED → SESSION_ACTIVE → ENGAGEMENT_CONFIRMED → VIEW_COMPLETED. No client trust.",
    tone: "bg-[#F3E8FF] text-[#6B21A8] dark:bg-[#1E1230] dark:text-[#D9BBFF]",
    tilt: "lg:-rotate-1",
  },
  {
    n: "04",
    title: "Settle from the ledger",
    body: "Eligible events write immutable rows. Balances are summed, never overwritten, then paid out.",
    tone: "bg-[#ECFDF3] text-[#166534] dark:bg-[#0D1F16] dark:text-[#9DE6BB]",
    tilt: "lg:rotate-2",
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="bg-background py-24">
      <div className="wide-shell">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-[620px] text-[42px] font-semibold leading-[1.02] tracking-[-0.04em] text-foreground sm:text-[58px]">
            Four steps.
            <span className="block text-muted-foreground">Zero funny business.</span>
          </h2>
          <p className="max-w-[360px] text-[15px] leading-[1.6] text-muted-foreground">
            The pipeline is deliberately boring where it matters — and strict about what counts.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {steps.map((step) => (
            <article
              key={step.n}
              className={`hover-tilt rounded-[26px] border border-border p-7 ${step.tone} ${step.tilt}`}
            >
              <p className="text-[44px] font-bold leading-none tracking-[-0.04em] opacity-40">
                {step.n}
              </p>
              <h3 className="mt-5 text-[24px] font-semibold tracking-[-0.02em]">{step.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.6] opacity-80">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
