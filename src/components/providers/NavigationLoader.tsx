"use client";

import { usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

type LoaderPhase = "idle" | "loading" | "finishing";
type LoaderMode = "bar" | "overlay";

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function isInternalHref(href: string) {
  if (!href || href.startsWith("#")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  try {
    const url = new URL(href, window.location.href);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

function sameDestination(href: string) {
  try {
    const next = new URL(href, window.location.href);
    return (
      next.pathname === window.location.pathname &&
      next.search === window.location.search &&
      next.hash === window.location.hash
    );
  } catch {
    return false;
  }
}

function NavigationLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<LoaderPhase>("idle");
  const [mode, setMode] = useState<LoaderMode>("bar");
  const [progress, setProgress] = useState(0);
  const routeKey = `${pathname}?${searchParams?.toString() ?? ""}`;
  const routeKeyRef = useRef(routeKey);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(false);
  const linkNavRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (trickleRef.current) {
      clearInterval(trickleRef.current);
      trickleRef.current = null;
    }
    if (finishTimerRef.current) {
      clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
  }, []);

  const start = useCallback(
    (nextMode: LoaderMode) => {
      if (activeRef.current) return;
      activeRef.current = true;
      clearTimers();
      setMode(nextMode);
      setPhase("loading");
      setProgress(12);
      trickleRef.current = setInterval(() => {
        setProgress((current) => {
          if (current >= 88) return current;
          const step = current < 40 ? 8 : current < 70 ? 4 : 1.5;
          return Math.min(88, current + step + Math.random() * 2);
        });
      }, 280);
    },
    [clearTimers],
  );

  const complete = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    linkNavRef.current = false;
    clearTimers();
    setPhase("finishing");
    setProgress(100);
    finishTimerRef.current = setTimeout(() => {
      setPhase("idle");
      setProgress(0);
    }, 280);
  }, [clearTimers]);

  useEffect(() => {
    if (routeKeyRef.current !== routeKey) {
      routeKeyRef.current = routeKey;
      complete();
    }
  }, [routeKey, complete]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (isModifiedClick(event)) return;
      const target = event.target as Element | null;
      const anchor = target?.closest?.("a");
      if (!anchor) return;
      if (anchor.hasAttribute("download") || anchor.getAttribute("target") === "_blank") return;
      const href = anchor.getAttribute("href");
      if (!href || !isInternalHref(href) || sameDestination(href)) return;
      linkNavRef.current = true;
      start("bar");
    };

    const onPopState = () => {
      linkNavRef.current = true;
      start("bar");
    };

    const maybeStartFromHistory = (url?: string | URL | null) => {
      if (url == null) return;
      const next = String(url);
      if (sameDestination(next)) return;
      // Link clicks already started the top bar — keep that mode.
      if (linkNavRef.current || activeRef.current) return;
      // Programmatic router.push / replace → full overlay spinner.
      start("overlay");
    };

    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = ((data: unknown, unused: string, url?: string | URL | null) => {
      maybeStartFromHistory(url);
      return originalPushState(data, unused, url);
    }) as History["pushState"];

    history.replaceState = ((data: unknown, unused: string, url?: string | URL | null) => {
      maybeStartFromHistory(url);
      return originalReplaceState(data, unused, url);
    }) as History["replaceState"];

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      clearTimers();
    };
  }, [start, clearTimers]);

  if (phase === "idle") return null;

  return (
    <>
      {mode === "bar" ? (
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-9999 h-[2.5px] overflow-hidden"
          aria-hidden
        >
          <div
            className="h-full origin-left bg-sunrise-coral shadow-[0_0_10px_rgba(252,95,43,0.55)] transition-[width,opacity] duration-200 ease-out"
            style={{
              width: `${progress}%`,
              opacity: phase === "finishing" ? 0 : 1,
            }}
          />
        </div>
      ) : (
        <div
          className="fixed inset-0 z-9998 flex items-center justify-center bg-black/70 backdrop-blur-[2px] transition-opacity duration-200"
          style={{ opacity: phase === "finishing" ? 0 : 1 }}
          role="status"
          aria-live="polite"
          aria-label="Loading"
        >
          <img
            src="/loading.png"
            alt=""
            width={88}
            height={88}
            className="h-[88px] w-[88px] animate-loader-spin object-contain select-none"
            draggable={false}
          />
        </div>
      )}
    </>
  );
}

export default function NavigationLoader() {
  return (
    <Suspense fallback={null}>
      <NavigationLoaderInner />
    </Suspense>
  );
}
