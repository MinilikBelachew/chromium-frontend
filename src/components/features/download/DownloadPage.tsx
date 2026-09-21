"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowDownToLine,
  Check,
  Monitor,
  Smartphone,
} from "lucide-react";
import Footer from "@/components/layout/footer/Footer";
import LandingShell from "@/components/features/home/LandingShell";
import { Reveal, RevealStagger } from "@/components/features/home/motion";
import {
  DOWNLOAD_PLATFORMS,
  DOWNLOAD_RELEASE_DATE,
  detectRecommendedPlatformId,
  desktopPlatforms,
  formatReleaseDate,
  mobilePlatforms,
  type DownloadPlatform,
  type DownloadPlatformId,
} from "@/lib/downloads";

const HERO_IMAGE = "/landing-hero.jpg";
const ease = [0.22, 1, 0.36, 1] as const;

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/download", label: "Download" },
  { href: "/#faq", label: "FAQ" },
];

function PlatformGlyph({
  id,
  className,
}: {
  id: DownloadPlatformId;
  className?: string;
}) {
  if (id === "android") {
    return <Smartphone className={className} strokeWidth={1.5} aria-hidden />;
  }
  return <Monitor className={className} strokeWidth={1.5} aria-hidden />;
}

function DownloadButton({
  platform,
  variant = "solid",
  className = "",
}: {
  platform: DownloadPlatform;
  variant?: "solid" | "outline" | "dark" | "outline-light";
  className?: string;
}) {
  const ready = Boolean(platform.href);
  const label = ready
    ? `Download for ${platform.shortName}`
    : `Coming soon — ${platform.shortName}`;

  const base =
    "inline-flex items-center justify-center gap-2 px-6 py-3 text-[13px] font-medium tracking-[-0.01em] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-45";

  const styles =
    variant === "outline" || variant === "outline-light"
      ? "border border-white/50 text-white hover:border-[#fc5f2b] hover:bg-[#fc5f2b]"
      : variant === "dark"
        ? "bg-[#141414] text-white hover:bg-[#fc5f2b]"
        : "bg-[#fc5f2b] text-white hover:bg-[#e55424]";

  if (!ready || !platform.href) {
    return (
      <button type="button" disabled className={`${base} ${styles} ${className}`}>
        {label}
      </button>
    );
  }

  return (
    <a
      href={platform.href}
      download
      className={`${base} ${styles} ${className}`}
    >
      <ArrowDownToLine className="size-4 shrink-0" aria-hidden />
      {label}
    </a>
  );
}

function PlatformRow({
  platform,
  recommended,
}: {
  platform: DownloadPlatform;
  recommended?: boolean;
}) {
  return (
    <article className="grid gap-5 border-b border-[#1c1c1e]/10 py-10 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-8">
      <div className="flex items-start gap-4">
        <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center bg-[#1c1c1e] text-white">
          <PlatformGlyph id={platform.id} className="size-5" />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-[22px] font-normal tracking-[-0.03em] text-[#1c1c1e]">
              {platform.name}
            </h3>
            {recommended ? (
              <span className="text-[11px] font-medium tracking-[0.08em] text-[#fc5f2b] uppercase">
                Recommended
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-[14px] leading-[1.55] text-[#1c1c1e]/65">
            {platform.notes}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-[12.5px] text-[#1c1c1e]/70 sm:gap-4">
        <div>
          <dt className="text-[11px] tracking-[0.08em] text-[#1c1c1e]/45 uppercase">
            Package
          </dt>
          <dd className="mt-1 font-medium text-[#1c1c1e]">{platform.fileKind}</dd>
        </div>
        <div>
          <dt className="text-[11px] tracking-[0.08em] text-[#1c1c1e]/45 uppercase">
            Version
          </dt>
          <dd className="mt-1 font-medium text-[#1c1c1e]">v{platform.version}</dd>
        </div>
        <div>
          <dt className="text-[11px] tracking-[0.08em] text-[#1c1c1e]/45 uppercase">
            Size
          </dt>
          <dd className="mt-1 font-medium text-[#1c1c1e]">
            {platform.sizeLabel ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] tracking-[0.08em] text-[#1c1c1e]/45 uppercase">
            Status
          </dt>
          <dd className="mt-1 font-medium text-[#1c1c1e]">
            {platform.href ? "Ready" : "Coming soon"}
          </dd>
        </div>
      </dl>

      <div className="sm:justify-self-end">
        <DownloadButton platform={platform} variant="dark" className="w-full sm:w-auto" />
      </div>
    </article>
  );
}

function RequirementsList({ platform }: { platform: DownloadPlatform }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {platform.requirements.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2.5 text-[14px] leading-[1.5] text-[#1c1c1e]/70"
        >
          <Check className="mt-0.5 size-4 shrink-0 text-[#fc5f2b]" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function DownloadHero({
  recommended,
  releaseLabel,
}: {
  recommended: DownloadPlatform;
  releaseLabel: string;
}) {
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
  const insetBottom = useTransform(
    scrollYProgress,
    (v) => morph(v) * frameRef.current.bottom,
  );
  const radius = useTransform(scrollYProgress, (v) => morph(v) * 28);

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

  const ready = Boolean(recommended.href);
  const primaryLabel = ready
    ? `Download for ${recommended.shortName}`
    : `Coming soon — ${recommended.shortName}`;

  if (reduce) {
    return (
      <section className="relative isolate min-h-svh overflow-hidden bg-[#0c0c0c]">
        <img
          src={HERO_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div aria-hidden className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 mx-auto flex min-h-svh max-w-[900px] flex-col items-center justify-center px-6 pb-20 pt-28 text-center">
          <p className="font-display text-[12px] font-normal tracking-[0.2em] text-[#fc5f2b] uppercase">
            Vero
          </p>
          <h1 className="mt-6 font-display text-[clamp(2.5rem,7vw,4.5rem)] font-normal leading-[1.05] tracking-[-0.04em] text-white">
            Download the browser built for{" "}
            <em className="italic text-[#fc5f2b]">real</em> watching
          </h1>
          <p className="mt-6 max-w-[480px] text-[16px] leading-[1.55] text-white/85">
            Windows PC installer and Android APK — verified watching, mini-games,
            daily boards.
          </p>
          <div className="mt-10">
            <DownloadButton platform={recommended} variant="outline" />
          </div>
        </div>
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
              {navLinks.map((link) => (
                <motion.div key={link.href} style={{ color: headerMuted }}>
                  <Link
                    href={link.href}
                    className="text-[13px] font-medium transition-opacity duration-300 hover:opacity-100"
                    style={{ color: "inherit" }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
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
              Download the browser built for{" "}
              <em className="italic font-normal text-[#fc5f2b]">real</em> watching
            </motion.h1>
            <motion.p
              className="mt-6 max-w-[480px] text-[16px] leading-[1.55] text-white/85"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.4, ease }}
            >
              Windows PC (.exe) and Android APK. Watch verified channels, play
              mini-games, climb daily boards — no spoofed views.
            </motion.p>

            <motion.div
              className="relative mt-10 flex w-full max-w-[420px] flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:justify-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease }}
            >
              <div className="relative h-12 w-full max-w-[300px]">
                <motion.div
                  style={{
                    opacity: ctaOutlineOpacity,
                    pointerEvents: ctaOutlineEvents,
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {ready && recommended.href ? (
                    <a
                      href={recommended.href}
                      download
                      className="inline-flex w-full items-center justify-center whitespace-nowrap border border-white/50 px-7 py-3 text-[13px] font-medium tracking-[-0.01em] text-white"
                    >
                      {primaryLabel}
                    </a>
                  ) : (
                    <span className="inline-flex w-full items-center justify-center whitespace-nowrap border border-white/35 px-7 py-3 text-[13px] font-medium text-white/55">
                      {primaryLabel}
                    </span>
                  )}
                </motion.div>
                <motion.div
                  style={{
                    opacity: ctaSolidOpacity,
                    pointerEvents: ctaSolidEvents,
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {ready && recommended.href ? (
                    <a
                      href={recommended.href}
                      download
                      className="inline-flex w-full items-center justify-center gap-3 whitespace-nowrap bg-[#141414] py-2.5 pr-5 pl-2.5 text-[13px] font-medium text-white"
                    >
                      <span className="flex h-7 w-7 items-center justify-center bg-[#fc5f2b] text-[16px] leading-none text-white">
                        ›
                      </span>
                      {primaryLabel}
                    </a>
                  ) : (
                    <span className="inline-flex w-full items-center justify-center gap-3 whitespace-nowrap bg-[#141414]/70 py-2.5 pr-5 pl-2.5 text-[13px] font-medium text-white/60">
                      <span className="flex h-7 w-7 items-center justify-center bg-[#fc5f2b]/50 text-[16px] leading-none text-white">
                        ›
                      </span>
                      {primaryLabel}
                    </span>
                  )}
                </motion.div>
              </div>
              <a
                href="#platforms"
                className="text-[13px] font-medium text-white/75 transition-opacity hover:text-white"
              >
                Windows & Android
              </a>
            </motion.div>

            <motion.p
              className="mt-6 text-[12px] text-white/55"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.65, ease }}
            >
              Detected: {recommended.name} · v{recommended.version} · {releaseLabel}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function DownloadPage() {
  const [recommendedId, setRecommendedId] =
    useState<DownloadPlatformId>("windows");

  useEffect(() => {
    setRecommendedId(detectRecommendedPlatformId());
  }, []);

  const recommended = useMemo(
    () =>
      DOWNLOAD_PLATFORMS.find((p) => p.id === recommendedId) ??
      DOWNLOAD_PLATFORMS[0],
    [recommendedId],
  );

  const desktops = desktopPlatforms();
  const mobiles = mobilePlatforms();
  const releaseLabel = formatReleaseDate(DOWNLOAD_RELEASE_DATE);

  return (
    <LandingShell>
      <main>
        <DownloadHero recommended={recommended} releaseLabel={releaseLabel} />

        <section id="platforms" className="bg-[#f7f5f0] px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-[1120px]">
            <Reveal className="grid gap-6 border-b border-[#1c1c1e]/10 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] font-normal leading-[1.08] tracking-[-0.04em] text-[#1c1c1e]">
                Windows browser
              </h2>
              <p className="max-w-[360px] text-[15px] leading-[1.6] text-[#1c1c1e]/70 lg:justify-self-end lg:text-right">
                Vero Browser for Windows — verified watching and mini-games on
                your PC.
              </p>
            </Reveal>

            <RevealStagger className="mt-2">
              {desktops.map((platform) => (
                <PlatformRow
                  key={platform.id}
                  platform={platform}
                  recommended={platform.id === recommendedId}
                />
              ))}
            </RevealStagger>

            <Reveal className="mt-24 grid gap-6 border-b border-[#1c1c1e]/10 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] font-normal leading-[1.08] tracking-[-0.04em] text-[#1c1c1e]">
                Android APK
              </h2>
              <p className="max-w-[360px] text-[15px] leading-[1.6] text-[#1c1c1e]/70 lg:justify-self-end lg:text-right">
                Install the Vero APK on Android. Same creator-verified sessions
                on the go.
              </p>
            </Reveal>

            <RevealStagger className="mt-2">
              {mobiles.map((platform) => (
                <PlatformRow
                  key={platform.id}
                  platform={platform}
                  recommended={platform.id === recommendedId}
                />
              ))}
            </RevealStagger>
          </div>
        </section>

        <section
          id="requirements"
          className="border-t border-[#1c1c1e]/10 bg-[#f7f5f0] px-6 py-24 sm:py-28"
        >
          <div className="mx-auto max-w-[1120px]">
            <Reveal>
              <p className="text-[11px] font-normal tracking-[0.12em] text-[#fc5f2b] uppercase">
                System requirements
              </p>
              <h2 className="mt-4 max-w-[640px] font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-normal leading-[1.1] tracking-[-0.035em] text-[#1c1c1e]">
                What you need before you install
              </h2>
            </Reveal>

            <RevealStagger className="mt-14 grid gap-10 md:grid-cols-2">
              {DOWNLOAD_PLATFORMS.map((platform) => (
                <div
                  key={platform.id}
                  className="border-t border-[#1c1c1e]/10 pt-6"
                >
                  <div className="flex items-center gap-3">
                    <PlatformGlyph
                      id={platform.id}
                      className="size-5 text-[#1c1c1e]"
                    />
                    <h3 className="font-display text-[18px] font-normal tracking-[-0.02em] text-[#1c1c1e]">
                      {platform.name}
                    </h3>
                  </div>
                  <RequirementsList platform={platform} />
                  {platform.checksum ? (
                    <p className="mt-4 break-all font-mono text-[11px] leading-[1.5] text-[#1c1c1e]/45">
                      SHA-512: {platform.checksum}
                    </p>
                  ) : null}
                </div>
              ))}
            </RevealStagger>
          </div>
        </section>

        <section className="bg-[#0c0c0c] px-6 py-24 sm:py-28">
          <div className="mx-auto max-w-[1120px]">
            <Reveal className="max-w-[560px]">
              <p className="text-[11px] font-normal tracking-[0.12em] text-[#fc5f2b] uppercase">
                After download
              </p>
              <h2 className="mt-4 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-normal leading-[1.1] tracking-[-0.035em] text-white">
                Install in minutes
              </h2>
            </Reveal>

            <RevealStagger className="mt-14 grid gap-8 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Download",
                  body: "Choose Windows (.exe) or Android (APK). We recommend the build that matches this device.",
                },
                {
                  n: "02",
                  title: "Install",
                  body: "Run the Windows installer, or allow the APK from unknown sources on Android.",
                },
                {
                  n: "03",
                  title: "Sign in & watch",
                  body: "Create a viewer account, open a verified channel, and play beside the video.",
                },
              ].map((step) => (
                <div key={step.n} className="border-t border-white/15 pt-6">
                  <p className="text-[13px] tracking-[0.08em] text-[#fc5f2b]">
                    {step.n}
                  </p>
                  <h3 className="mt-3 font-display text-[22px] font-normal tracking-[-0.03em] text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-[1.6] text-white/65">
                    {step.body}
                  </p>
                </div>
              ))}
            </RevealStagger>
          </div>
        </section>

        <section className="bg-[#f7f5f0] px-6 py-24 sm:py-28">
          <div className="mx-auto max-w-[800px]">
            <Reveal>
              <p className="text-[11px] font-normal tracking-[0.12em] text-[#fc5f2b] uppercase">
                Support
              </p>
              <h2 className="mt-4 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-normal leading-[1.1] tracking-[-0.035em] text-[#1c1c1e]">
                Frequently asked questions
              </h2>
            </Reveal>
            <RevealStagger className="mt-10">
              {[
                {
                  q: "Is Vero free to download and install?",
                  a: "Yes. Vero Browser for Windows and the Android APK are free to download. Creating a viewer or creator account is separate and takes only a few minutes after installation.",
                },
                {
                  q: "Which platforms are available today?",
                  a: "We currently offer a Windows installer (.exe) for PCs and an Android APK for phones and tablets. Builds marked Coming soon are not released yet; check back when that platform goes live.",
                },
                {
                  q: "Do creators and viewers install the same app?",
                  a: "Yes. Everyone uses the same Vero Browser on Windows. Creators register and manage channels from the web dashboard; viewers sign in inside the browser to watch and play.",
                },
                {
                  q: "How do I install the Android APK safely?",
                  a: "Download the APK from this page, then open it on your device. If prompted, allow installation from this source in Android settings. After install, open Vero and sign in with your viewer account.",
                },
                {
                  q: "What are the system requirements?",
                  a: "Windows 10 or 11 (64-bit) with at least 4 GB of RAM is recommended for the desktop browser. Android devices need Android 10 or later and a stable internet connection for verified watching and games.",
                },
                {
                  q: "Is my download secure?",
                  a: "Install only from this official download page. When a checksum is listed for a release, you can verify the file integrity before installing. Never install Vero from third-party mirrors.",
                },
              ].map((item) => (
                <details
                  key={item.q}
                  className="group border-b border-[#1c1c1e]/10 py-5"
                >
                  <summary className="cursor-pointer list-none font-display text-[18px] font-normal tracking-[-0.02em] text-[#1c1c1e] marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-4">
                      {item.q}
                      <span className="text-[#fc5f2b] transition-transform group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-3 max-w-[560px] text-[14px] leading-[1.6] text-[#1c1c1e]/70">
                    {item.a}
                  </p>
                </details>
              ))}
            </RevealStagger>
          </div>
        </section>

        <section className="relative min-h-[50vh] overflow-hidden bg-[#0c0c0c]">
          <img
            src={HERO_IMAGE}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[center_60%]"
          />
          <div aria-hidden className="absolute inset-0 bg-black/55" />
          <Reveal className="relative z-10 mx-auto flex min-h-[50vh] max-w-[1120px] flex-col justify-end gap-8 px-6 py-16 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:py-20">
            <h2 className="max-w-[480px] font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-normal leading-[1.12] tracking-[-0.035em] text-white">
              Ready when you are.{" "}
              <span className="text-[#fc5f2b]">Download Vero</span> and start
              watching for real.
            </h2>
            <div className="flex flex-col gap-3 sm:items-end">
              <DownloadButton platform={recommended} variant="outline" />
              <Link
                href="/get-started"
                className="text-center text-[13px] font-medium text-white/70 transition-colors hover:text-white"
              >
                Or create an account →
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </LandingShell>
  );
}
