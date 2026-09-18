import React from "react";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";

export default function BigCta() {
  return (
    <section className="grain relative isolate overflow-hidden bg-background py-24">
      <div
        aria-hidden
        className="animate-spin-slow pointer-events-none absolute -right-40 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-[conic-gradient(from_0deg,rgba(252,95,43,0.25),transparent_40%,rgba(59,130,246,0.22),transparent_75%)] blur-3xl"
      />
      <div className="wide-shell relative text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          ready when you are
        </p>
        <h2 className="mx-auto mt-6 max-w-[900px] text-[12vw] font-semibold leading-[0.94] tracking-[-0.045em] text-foreground sm:text-[8vw] lg:text-[92px]">
          Let’s make views
          <span className="italic text-sunrise-coral"> mean something.</span>
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-full bg-sunrise-coral px-8 py-4 text-[15px] font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            Create my account
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-8 py-4 text-[15px] font-bold text-foreground transition-transform hover:-translate-y-0.5"
          >
            Creator signup
          </Link>
        </div>
      </div>
    </section>
  );
}
