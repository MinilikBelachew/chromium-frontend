import React from "react";

const faqs = [
  {
    q: "Does this spoof geography or ad markets?",
    a: "No. Engagement is measured from the Fanaye browser on verified channels — never geo/IP manipulation or artificial impressions.",
  },
  {
    q: "What do creators get today?",
    a: "Verified watch sessions, mini-game play, daily leaderboards, and analytics on who watched and for how long. Payouts are not live yet.",
  },
  {
    q: "How do leaderboards work?",
    a: "Viewers submit scores while watching a verified channel. Boards reset each UTC day per game and per channel.",
  },
  {
    q: "Who can join?",
    a: "Viewers register with name, email, and phone. Creators add a YouTube channel and wait for verification before engagement counts.",
  },
];

const Faq: React.FC = () => {
  return (
    <section id="faq" className="bg-muted py-24">
      <div className="wide-shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <h2 className="text-[42px] font-semibold leading-[1.02] tracking-[-0.04em] text-foreground sm:text-[54px]">
          Questions,
          <span className="block text-muted-foreground">answered plainly.</span>
        </h2>

        <div className="space-y-3">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-[22px] border border-border bg-card px-6 py-5 transition-colors open:bg-background"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                <span className="text-[19px] font-medium tracking-[-0.02em] text-foreground sm:text-[22px]">
                  {item.q}
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-[18px] leading-none text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-[640px] text-[15px] leading-[1.6] text-muted-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
