"use client";

import React, { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

const HERO_IMAGE = "/landing-hero.jpg";
const ease = [0.22, 1, 0.36, 1] as const;

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "Product" },
  { href: "/download", label: "Download" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

/**
 * Fresh view: full-bleed hero + white header.
 * On scroll: hero embeds into a rounded frame; header stays and turns black on cream.
 */
const Hero: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const frameRef = useRef({ x: 64, top: 88, bottom: 56 });
  const [, setFrameTick] = useState(0);

  useEffect(() => {
    const measure = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      frameRef.current = {
        x: Math.round(Math.min(96, Math.max(20, w * 0.055))),
        top: Math.round(Math.min(112, Math.max(72, h * 0.11))),
        bottom: Math.round(Math.min(88, Math.max(28, h * 0.07))),
      };
      setFrameTick((n) => n + 1);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end start"],
  });

  const morph = (v: number) => {
    const t = Math.min(1, Math.max(0, v / 0.7));
    return 1 - Math.pow(1 - t, 3);
  };

  const insetX = useTransform(scrollYProgress, (v) => morph(v) * frameRef.current.x);
  const insetTop = useTransform(scrollYProgress, (v) => morph(v) * frameRef.current.top);
  const insetBottom = useTransform(scrollYProgress, (v) => morph(v) * frameRef.current.bottom);
  const radius = useTransform(scrollYProgress, (v) => morph(v) * 28);

  // Header: white on image → black on cream
  const headerColor = useTransform(
    scrollYProgress,
    [0, 0.28],
    ["rgb(255, 255, 255)", "rgb(28, 28, 30)"],
  );
  const headerMuted = useTransform(
    scrollYProgress,
    [0, 0.28],
    ["rgba(255, 255, 255, 0.85)", "rgba(28, 28, 30, 0.65)"],
  );
  const logoOnDark = useTransform(scrollYProgress, [0, 0.28], [1, 0]);
  const logoOnLight = useTransform(scrollYProgress, [0, 0.28], [0, 1]);

  const ctaOutlineOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const ctaSolidOpacity = useTransform(scrollYProgress, [0.25, 0.5], [0, 1]);
  const ctaOutlineEvents = useTransform(scrollYProgress, (v) =>
    v < 0.3 ? "auto" : "none",
  );
  const ctaSolidEvents = useTransform(scrollYProgress, (v) =>
    v > 0.32 ? "auto" : "none",
  );
  const imageScale = useTransform(scrollYProgress, [0, 0.7], [1.04, 1]);

  if (reduce) {
    return (
      <section className="relative isolate min-h-svh overflow-hidden bg-[#0c0c0c]">
        <img
          src={HERO_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div aria-hidden className="absolute inset-0 bg-black/45" />
        <HeroCopy />
      </section>
    );
  }

  return (
    <div ref={trackRef} className="relative h-[165vh] bg-[#f7f5f0]">
      <div className="sticky top-0 h-svh overflow-hidden bg-[#f7f5f0]">
        <header className="absolute inset-x-0 top-0 z-50">
          <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between gap-4 px-6 py-6 sm:px-8">
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Vero">
              <span className="relative inline-flex h-7 w-7 shrink-0 overflow-hidden rounded-full">
                <motion.img
                  src="/logo_dark.png"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ opacity: logoOnDark }}
                />
                <motion.img
                  src="/logo_light.jpg"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ opacity: logoOnLight }}
                />
              </span>
              <motion.span
                className="font-display text-[15px] font-normal tracking-[-0.02em]"
                style={{ color: headerColor }}
              >
                Vero
              </motion.span>
            </Link>
            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) =>
                link.href.startsWith("/") ? (
                  <motion.div key={link.href} style={{ color: headerMuted }}>
                    <Link
                      href={link.href}
                      className="text-[13px] font-medium transition-opacity duration-300 hover:opacity-100"
                      style={{ color: "inherit" }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ) : (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    className="text-[13px] font-medium transition-opacity duration-300 hover:opacity-100"
                    style={{ color: headerMuted }}
                  >
                    {link.label}
                  </motion.a>
                ),
              )}
            </nav>
            <motion.div style={{ color: headerColor }}>
              <Link
                href="/get-started"
                className="text-[13px] font-normal transition-opacity duration-300 hover:opacity-70"
                style={{ color: "inherit" }}
              >
                Get started
              </Link>
            </motion.div>
          </div>
        </header>

        <motion.div
          className="absolute overflow-hidden"
          style={{
            left: insetX,
            right: insetX,
            top: insetTop,
            bottom: insetBottom,
            borderRadius: radius,
          }}
        >
          <motion.img
            src={HERO_IMAGE}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            style={{ scale: imageScale }}
            initial={{ scale: 1.08 }}
            animate={{ scale: 1.04 }}
            transition={{ duration: 1.6, ease }}
          />
          <div aria-hidden className="absolute inset-0 bg-black/45" />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-16 pt-24 text-center sm:px-10">
            <motion.p
              className="font-display text-[12px] font-normal tracking-[0.2em] text-[#fc5f2b] uppercase"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease }}
            >
              Vero
            </motion.p>
            <motion.h1
              className="mt-6 max-w-[900px] font-display text-[clamp(2.5rem,7vw,4.5rem)] font-normal leading-[1.05] tracking-[-0.04em] text-white"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, delay: 0.25, ease }}
            >
              The browser that turns watching into{" "}
              <em className="italic font-normal text-[#fc5f2b]">real</em> engagement
            </motion.h1>
            <motion.p
              className="mt-6 max-w-[480px] text-[16px] leading-[1.55] text-white/85"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.4, ease }}
            >
              Creators register channels. Viewers watch in Vero and play mini-games beside the
              video. Daily leaderboards — no spoofed views.
            </motion.p>

            <div className="relative mt-10 flex w-full max-w-[420px] flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:justify-center">
              <div className="relative h-12 w-full max-w-[280px]">
                <motion.div
                  style={{ opacity: ctaOutlineOpacity, pointerEvents: ctaOutlineEvents }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Link
                    href="/download"
                    className="inline-flex w-full items-center justify-center whitespace-nowrap border border-white/50 px-7 py-3 text-[13px] font-medium tracking-[-0.01em] text-white"
                  >
                    Download Vero
                  </Link>
                </motion.div>
                <motion.div
                  style={{ opacity: ctaSolidOpacity, pointerEvents: ctaSolidEvents }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Link
                    href="/download"
                    className="inline-flex w-full items-center justify-center gap-3 whitespace-nowrap bg-[#141414] py-2.5 pr-5 pl-2.5 text-[13px] font-medium text-white"
                  >
                    <span className="flex h-7 w-7 items-center justify-center bg-[#fc5f2b] text-[16px] leading-none text-white">
                      ›
                    </span>
                    Download Vero
                  </Link>
                </motion.div>
              </div>
              <Link
                href="/get-started"
                className="text-[13px] font-medium text-white/75 transition-opacity hover:text-white"
              >
                Get started for free
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

function HeroCopy() {
  return (
    <div className="relative z-10 mx-auto flex min-h-svh max-w-[900px] flex-col items-center justify-center px-6 pb-20 pt-28 text-center">
      <p className="font-display text-[12px] font-normal tracking-[0.2em] text-[#fc5f2b] uppercase">
        Vero
      </p>
      <h1 className="mt-6 font-display text-[clamp(2.5rem,7vw,4.5rem)] font-normal leading-[1.05] tracking-[-0.04em] text-white">
        The browser that turns watching into{" "}
        <em className="italic text-[#fc5f2b]">real</em> engagement
      </h1>
      <p className="mt-6 max-w-[480px] text-[16px] leading-[1.55] text-white/85">
        Creators register channels. Viewers watch in Vero and play mini-games beside the video.
        Daily leaderboards — no spoofed views.
      </p>
      <Link
        href="/download"
        className="mt-10 inline-flex border border-white/50 px-7 py-3 text-[13px] font-medium text-white"
      >
        Download Vero
      </Link>
    </div>
  );
}

export default Hero;
