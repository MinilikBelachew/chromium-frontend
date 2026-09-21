import React from "react";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight, Check } from "lucide-react";

const creatorPerks = [
  "Channel verification workflow",
  "Daily session analytics",
  "Mini-games beside your videos",
];

const viewerPerks = [
  "Watch in Fanaye browser",
  "Play catalog mini-games",
  "Compete on daily leaderboards",
];

const Features: React.FC = () => {
  return (
    <section id="creators" className="bg-muted py-24">
      <div className="wide-shell">
        <h2 className="max-w-[720px] text-[42px] font-semibold leading-[1.02] tracking-[-0.04em] text-foreground sm:text-[58px]">
          Two doors.
          <span className="italic text-sunrise-coral"> One honest platform.</span>
        </h2>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <article className="hover-tilt relative overflow-hidden rounded-[28px] border border-border bg-card p-8">
            <span className="absolute right-6 top-6 rounded-full bg-sunrise-coral px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
              creators
            </span>
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Own a channel
            </p>
            <h3 className="mt-4 text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground">
              See who watched — and what they played.
            </h3>
            <ul className="mt-7 space-y-3">
              {creatorPerks.map((perk) => (
                <li key={perk} className="flex items-start gap-3 text-[15px] text-foreground">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-sunrise-coral text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-[14px] font-bold text-background"
            >
              Register a channel
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
            </Link>
          </article>

          <article className="hover-tilt relative overflow-hidden rounded-[28px] border border-border p-8 text-white">
            <span
              aria-hidden
              className="absolute inset-0 -z-10"
              style={{ background: "var(--gradient-coral-glow)" }}
            />
            <span className="absolute right-6 top-6 rounded-full bg-black/25 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em]">
              viewers
            </span>
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/80">
              Just watch
            </p>
            <h3 className="mt-4 text-[32px] font-semibold leading-[1.1] tracking-[-0.03em]">
              Watch creators. Play beside the video.
            </h3>
            <ul className="mt-7 space-y-3">
              {viewerPerks.map((perk) => (
                <li key={perk} className="flex items-start gap-3 text-[15px]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/25">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[14px] font-bold text-carbon-black"
            >
              Start watching
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Features;
