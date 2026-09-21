"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Reveal, RevealStagger } from "../motion";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    period: "forever",
    blurb: "Creators getting verified and shipping first sessions.",
    features: ["Channel registration", "Session analytics", "Daily boards", "Catalog games"],
    cta: "Get started",
    href: "/sign-up",
  },
  {
    id: "pro",
    name: "Pro",
    price: "Soon",
    period: "when payments ship",
    blurb: "No fake upgrade. Billing and settlements come later.",
    features: ["Everything in Starter", "Priority review", "Deeper analytics", "Settlements later"],
    cta: "Join waitlist",
    href: "/sign-up",
  },
  {
    id: "viewer",
    name: "Viewer",
    price: "$0",
    period: "free",
    blurb: "Watch verified channels and compete in Fanaye browser.",
    features: ["Email + OTP signup", "Watch channels", "Play games", "Climb boards"],
    cta: "Create account",
    href: "/register",
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="bg-[#f7f5f0] px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-[1120px]">
        <Reveal className="flex flex-col gap-8 border-b border-[#1c1c1e]/10 pb-12 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-[480px] text-[clamp(1.85rem,3.5vw,2.75rem)] font-medium leading-[1.1] tracking-[-0.04em] text-[#1c1c1e]">
            Simple pricing. No surprises.
          </h2>
          <div className="flex gap-6 text-[13px] font-medium">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`transition-colors duration-300 ${
                !yearly ? "text-[#1c1c1e]" : "text-[#1c1c1e]/35 hover:text-[#1c1c1e]/6"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`transition-colors duration-300 ${
                yearly ? "text-[#1c1c1e]" : "text-[#1c1c1e]/35 hover:text-[#1c1c1e]/6"
              }`}
            >
              Yearly
            </button>
          </div>
        </Reveal>

        <RevealStagger className="mt-2">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className="grid gap-6 border-b border-[#1c1c1e]/10 py-12 lg:grid-cols-[160px_140px_1fr_160px] lg:items-start lg:gap-10"
            >
              <div>
                <p className="text-[15px] font-medium text-[#1c1c1e]">{plan.name}</p>
                <p className="mt-1 text-[13px] text-[#1c1c1e]/4">
                  {yearly && plan.id === "pro" ? "billed yearly later" : plan.period}
                </p>
              </div>
              <p className="text-[36px] font-medium tracking-[-0.04em] text-[#1c1c1e]">
                {plan.price}
              </p>
              <div>
                <p className="text-[15px] leading-[1.55] text-[#1c1c1e]/55">{plan.blurb}</p>
                <ul className="mt-5 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="text-[13px] text-[#1c1c1e]/7">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={plan.href}
                className="inline-flex h-11 items-center justify-center border border-[#1c1c1e] px-5 text-[13px] font-medium text-[#1c1c1e] transition-colors duration-300 hover:bg-[#1c1c1e] hover:text-white lg:justify-self-end"
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
