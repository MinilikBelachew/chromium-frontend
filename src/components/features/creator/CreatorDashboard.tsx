"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  ArrowUpRight,
  Bell,
  CheckCircle2,
  CircleHelp,
  Clapperboard,
  FolderOpen,
  Home,
  Layers,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { type CreatorSession } from "@/lib/creator-session";
import BrandLogo from "@/components/common/BrandLogo";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useGetOnboardingMeQuery } from "@/context/services/authApi";
import {
  useGetCreatorAnalyticsSessionsQuery,
  useGetCreatorAnalyticsSummaryQuery,
  type AnalyticsPeriod,
  type AnalyticsSessionRow,
} from "@/context/services/analyticsApi";
import { clearAuthTokens, hasAuthToken } from "@/lib/auth-token";
import { isCreatorRole } from "@/lib/auth-routing";
import { profileToCreatorSession } from "@/lib/profile-mappers";
import { clearCreatorSession } from "@/lib/creator-session";

type Period = "today" | "week" | "month" | "reports";
type NavId = "overview" | "earnings" | "sessions" | "settlements" | "channel" | "settings";

const LINE = "border border-border";
const CARD = `rounded-2xl bg-card ${LINE} p-5`;

const mockLedger = [
  { id: "led_1", label: "Verified engagement · week 37", amount: 42.5, type: "revenue", date: "Sep 12" },
  { id: "led_2", label: "Platform fee", amount: -8.5, type: "fee", date: "Sep 12" },
  { id: "led_3", label: "Verified engagement · week 36", amount: 31.2, type: "revenue", date: "Sep 5" },
  { id: "led_4", label: "August settlement payout", amount: -65.0, type: "payout", date: "Sep 1" },
];

const settlements = [
  { label: "Pending review", count: 2, amount: "$18.40", bar: "#A78BFA", width: "70%" },
  { label: "Not paid", count: 1, amount: "$12.00", bar: "#F87171", width: "45%" },
  { label: "Partial", count: 1, amount: "$22.10", bar: "#60A5FA", width: "55%" },
  { label: "Fully paid", count: 3, amount: "$65.00", bar: "#34D399", width: "90%" },
  { label: "Draft", count: 1, amount: "$8.25", bar: "#FBBF24", width: "35%" },
];

function toAnalyticsPeriod(period: Period): AnalyticsPeriod {
  if (period === "today" || period === "week") return period;
  return "month";
}

function formatWatch(ms: number): string {
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return rem ? `${min}m ${rem}s` : `${min}m`;
}

function sessionAccent(status: string): string {
  if (status === "COMPLETED") return "#10B981";
  if (status === "ACTIVE") return "#3B82F6";
  if (status === "ABANDONED") return "#A1A1AA";
  return "#fc5f2b";
}

function sessionMeta(row: AnalyticsSessionRow): string {
  const parts = [row.status.replace(/_/g, " ")];
  if (row.watchMs > 0) parts.push(formatWatch(row.watchMs));
  const ads = row.adImpressionCount ?? (row.hadAdImpression ? 1 : 0);
  if (ads > 0) parts.push(`${ads} ad${ads === 1 ? "" : "s"}`);
  if (row.adSkipCount > 0) parts.push(`${row.adSkipCount} skip${row.adSkipCount === 1 ? "" : "s"}`);
  if (row.endedReason === "NAVIGATE_AWAY") parts.push("navigated away");
  return parts.join(" · ");
}

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-5 w-5 items-center justify-center [&>svg]:h-5 [&>svg]:w-5">
      {children}
    </span>
  );
}

const navItems: { id: NavId; icon: React.ReactNode; label: string }[] = [
  { id: "overview", icon: <Home strokeWidth={1.75} />, label: "Overview" },
  { id: "earnings", icon: <Wallet strokeWidth={1.75} />, label: "Earnings" },
  { id: "sessions", icon: <Clapperboard strokeWidth={1.75} />, label: "Sessions" },
  { id: "settlements", icon: <Layers strokeWidth={1.75} />, label: "Settlements" },
  { id: "channel", icon: <FolderOpen strokeWidth={1.75} />, label: "Channel" },
  { id: "settings", icon: <Settings strokeWidth={1.75} />, label: "Settings" },
];

export default function CreatorDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<CreatorSession | null>(null);
  const [ready, setReady] = useState(false);
  const [period, setPeriod] = useState<Period>("month");
  const [nav, setNav] = useState<NavId>("overview");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!hasAuthToken()) {
      router.replace("/sign-in");
      return;
    }
    setReady(true);
  }, [router]);

  const { data, isError, isLoading } = useGetOnboardingMeQuery(undefined, {
    skip: !ready,
  });

  useEffect(() => {
    if (!data) return;
    if (!isCreatorRole(data.user.role) || !data.creator) {
      router.replace("/app");
      return;
    }
    const mapped = profileToCreatorSession(data);
    if (mapped) setSession(mapped);
  }, [data, router]);

  useEffect(() => {
    if (isError) {
      clearAuthTokens();
      router.replace("/sign-in");
    }
  }, [isError, router]);

  const balance = useMemo(() => mockLedger.reduce((sum, row) => sum + row.amount, 0), []);

  if (!session || !ready || isLoading) {
    return (
      <main className="grid min-h-[100svh] place-items-center bg-card font-sans text-[15px] text-muted-foreground">
        Loading dashboard…
      </main>
    );
  }

  function signOut() {
    clearAuthTokens();
    clearCreatorSession();
    router.push("/");
  }

  const initials = session.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-svh bg-background font-sans text-foreground">
      <aside className="sticky top-0 hidden h-svh w-[72px] shrink-0 flex-col items-center gap-3 border-r border-border bg-sidebar px-3 py-6 sm:flex">
        <BrandLogo size={40} />
        <div className="flex flex-1 flex-col items-center gap-2">
          {navItems.map((item) => {
            const active = nav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                title={item.label}
                aria-label={item.label}
                onClick={() => setNav(item.id)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                  active
                    ? "bg-[#FFF1E9] text-sunrise-coral"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <NavIcon>{item.icon}</NavIcon>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          title="Sign out"
          aria-label="Sign out"
          onClick={signOut}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="grid grid-cols-[1fr_auto] items-center gap-6 border-b border-border px-6 py-4 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
          <BrandLogo size={36} className="justify-self-start" />

          <div className={`hidden items-center gap-1 rounded-full bg-card p-1 lg:flex ${LINE}`}>
            {(
              [
                ["today", "Today"],
                ["week", "This Week"],
                ["month", "This Month"],
                ["reports", "Reports"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPeriod(id)}
                className={`rounded-full px-4 py-2 text-[13px] font-medium tracking-[-0.01em] transition-colors ${
                  period === id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex shrink-0 items-center justify-end gap-3 justify-self-end">
            <ThemeToggle />
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" strokeWidth={1.75} />
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-sunrise-coral" />
            </button>
            <button
              type="button"
              aria-label="Help"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
            >
              <CircleHelp className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <div className="flex h-10 items-center gap-2.5 rounded-full border border-border bg-card py-1 pl-1 pr-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF1E9] text-[11px] font-bold text-sunrise-coral">
                {initials}
              </span>
              <div className="min-w-0 leading-tight">
                <p className="max-w-[140px] truncate text-[13px] font-medium tracking-[-0.01em]">
                  {session.name}
                </p>
                <p className="whitespace-nowrap text-[11px] text-muted-foreground">Creator · Pro</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground">
                Manage earnings, sessions, and settlements
              </p>
              <h1 className="mt-1.5 text-[30px] font-semibold leading-[1.15] tracking-[-0.025em]">
                Creator Dashboard
              </h1>
            </div>
            <label className="relative w-full max-w-[400px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search sessions, payouts, channel…"
                className={`h-11 w-full rounded-full bg-card pl-11 pr-4 text-[14px] tracking-[-0.01em] outline-none ${LINE} placeholder:text-ash-gray focus:border-carbon-black/20`}
              />
            </label>
          </div>

          {session.verificationStatus === "pending" ? (
            <div className={`mb-5 flex flex-wrap items-start gap-3 rounded-2xl bg-card p-4 ${LINE}`}>
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sunrise-coral" strokeWidth={1.75} />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold tracking-[-0.01em]">
                  Channel verification pending
                </p>
                <p className="mt-1 text-[13px] leading-[1.5] text-muted-foreground">
                  Admins review ownership before engagement counts toward revenue. Pro is active, so
                  dashboard tools stay available meanwhile.
                </p>
              </div>
              <a
                href={session.channelUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium hover:underline"
              >
                YouTube
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : null}

          {nav === "overview" ? (
            <OverviewGrid session={session} balance={balance} period={period} />
          ) : null}
          {nav === "earnings" ? <EarningsPanel balance={balance} /> : null}
          {nav === "sessions" ? <SessionsPanel period={period} /> : null}
          {nav === "settlements" ? <SettlementsPanel /> : null}
          {nav === "channel" || nav === "settings" ? (
            <ChannelPanel session={session} onSignOut={signOut} />
          ) : null}
        </main>
      </div>
    </div>
  );
}

function OverviewGrid({
  session,
  balance,
  period,
}: {
  session: CreatorSession;
  balance: number;
  period: Period;
}) {
  const analyticsPeriod = toAnalyticsPeriod(period);
  const { data, isLoading } = useGetCreatorAnalyticsSummaryQuery(analyticsPeriod);
  const periodLabel =
    period === "today"
      ? "Today"
      : period === "week"
        ? "This week"
        : period === "month"
          ? "This month"
          : "Last 30 days";

  const views = data?.views ?? 0;
  const completed = data?.completedViews ?? 0;
  const ads = data?.adImpressions ?? 0;
  const skips = data?.adSkips ?? 0;
  const exits = data?.navigateAways ?? 0;
  const avgWatch = data?.avgWatchMs ?? 0;
  const recent = data?.recentSessions ?? [];

  const confirmedPct = views > 0 ? Math.round((completed / views) * 100) : 0;
  const exitPct = views > 0 ? Math.round((exits / views) * 100) : 0;
  const inProgressPct = Math.max(0, 100 - confirmedPct - exitPct);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
      <section className={`${CARD} md:col-span-2 lg:col-span-3`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Recent sessions</h2>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
            {recent.length}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <p className="text-[13px] text-muted-foreground">Loading sessions…</p>
          ) : null}
          {!isLoading && recent.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">
              No Fanaye browser views yet for this period.
            </p>
          ) : null}
          {recent.map((item) => {
            const eligible =
              item.status === "COMPLETED" || item.watchMs >= 30_000;
            return (
              <article
                key={item.id}
                className={`rounded-xl bg-card p-3.5 ${LINE}`}
                style={{ borderLeft: `3px solid ${sessionAccent(item.status)}` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium tracking-[-0.01em]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[11.5px] text-muted-foreground">
                      {sessionMeta(item)}
                    </p>
                  </div>
                  {eligible ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#10B981]" strokeWidth={2} />
                  ) : (
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                      Hold
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="flex flex-col gap-5 md:col-span-2 lg:col-span-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatMini label="Views" value={String(views)} hint={`Fanaye browser · ${periodLabel}`} />
          <StatMini
            label="Observed ads"
            value={String(ads)}
            hint="Detected in Fanaye browser"
          />
          <StatMini label="Ad skips" value={String(skips)} hint="Skip button clicks observed" />
          <StatMini label="Navigate away" value={String(exits)} hint="Left before completion" />
          <StatMini
            label="Avg watch"
            value={formatWatch(avgWatch)}
            hint="Across started sessions"
          />
          <StatMini
            label="Completed"
            value={String(completed)}
            hint="≥30s or completed end"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <section className={CARD}>
            <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Engagement mix</h2>
            <p className="mt-1 text-[12px] text-muted-foreground">{periodLabel}</p>
            <div className="mt-5 flex items-center gap-5">
              <div
                className="relative size-[112px] shrink-0 rounded-full"
                style={{
                  background: `conic-gradient(#fc5f2b 0 ${confirmedPct}%, #3B82F6 ${confirmedPct}% ${confirmedPct + inProgressPct}%, #E4E4E7 ${confirmedPct + inProgressPct}% 100%)`,
                }}
              >
                <div className="absolute inset-[16px] rounded-full bg-card" />
              </div>
              <ul className="min-w-0 flex-1 space-y-2.5 text-[12.5px]">
                <LegendDot color="#fc5f2b" label="Completed" value={`${confirmedPct}%`} />
                <LegendDot color="#3B82F6" label="Other" value={`${inProgressPct}%`} />
                <LegendDot color="#E4E4E7" label="Navigated away" value={`${exitPct}%`} />
              </ul>
            </div>
          </section>

          <section className={CARD}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Earnings</h2>
                <p className="mt-1 text-[12px] text-muted-foreground">Coming soon · ledger mock</p>
              </div>
            </div>
            <p className="mt-6 text-[26px] font-semibold tracking-[-0.03em]">
              ${balance.toFixed(2)}
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Illustrative balance — not tied to analytics events yet
            </p>
          </section>
        </div>

        <section className={CARD}>
          <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Settlement overview</h2>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Payouts stay mocked until the revenue slice ships
          </p>
          <div className="mt-5 space-y-4">
            {settlements.map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <p className="w-[104px] shrink-0 text-[12.5px] text-muted-foreground">{item.label}</p>
                <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: item.width, background: item.bar }}
                  />
                </div>
                <p className="w-6 shrink-0 text-right text-[12.5px] text-muted-foreground">{item.count}</p>
                <p className="w-[68px] shrink-0 text-right text-[12.5px] font-medium">
                  {item.amount}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-5 md:col-span-2 lg:col-span-3">
        <section className={CARD}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Data source
          </p>
          <p className="mt-2 text-[14px] font-semibold tracking-[-0.02em]">
            Observed in Fanaye browser
          </p>
          <p className="mt-2 text-[12.5px] leading-[1.5] text-muted-foreground">
            Views, ads, and skips are first-party signals from verified-channel watches — not YouTube
            Studio Ads Manager.
          </p>
        </section>

        <section className={CARD}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Channel
          </p>
          <p className="mt-2 truncate text-[16px] font-semibold tracking-[-0.02em]">
            {session.channelName}
          </p>
          <p className="mt-1 text-[12.5px] capitalize text-muted-foreground">
            {session.verificationStatus} · {session.plan === "pro" ? "Pro" : "Starter"} plan
          </p>
          <a
            href={session.channelUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-sunrise-coral hover:underline"
          >
            Open on YouTube
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </section>
      </div>
    </div>
  );
}

function EarningsPanel({ balance }: { balance: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <StatMini label="Ledger balance" value={`$${balance.toFixed(2)}`} hint="Immutable sum" />
      <StatMini label="Gross (MTD)" value="$81.70" hint="Before fee split" />
      <StatMini label="Creator share" value="$65.20" hint="Platform fee $16.50" />
      <section className={`${CARD} sm:col-span-3`}>
        <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Ledger transactions</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[13px]">
            <thead className="text-muted-foreground">
              <tr>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {mockLedger.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="py-3 text-muted-foreground">{row.date}</td>
                  <td className="py-3">{row.label}</td>
                  <td className="py-3 capitalize text-muted-foreground">{row.type}</td>
                  <td className="py-3 text-right font-medium">
                    {row.amount < 0 ? "-" : "+"}${Math.abs(row.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SessionsPanel({ period }: { period: Period }) {
  const analyticsPeriod = toAnalyticsPeriod(period);
  const { data, isLoading } = useGetCreatorAnalyticsSessionsQuery(analyticsPeriod);
  const items = data?.items ?? [];

  if (isLoading) {
    return (
      <p className="text-[14px] text-muted-foreground">Loading sessions…</p>
    );
  }

  if (items.length === 0) {
    return (
      <section className={CARD}>
        <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Sessions</h2>
        <p className="mt-2 text-[13.5px] text-muted-foreground">
          No viewing sessions from the Fanaye browser in this period yet.
        </p>
      </section>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
            const eligible =
              item.eligible ?? (item.status === "COMPLETED" || item.watchMs >= 30_000);
        return (
          <article
            key={item.id}
            className={`rounded-2xl bg-card p-5 ${LINE}`}
            style={{ borderTop: `3px solid ${sessionAccent(item.status)}` }}
          >
            <p className="text-[14px] font-semibold tracking-[-0.01em]">{item.title}</p>
            <p className="mt-2 text-[12px] text-muted-foreground">{sessionMeta(item)}</p>
            <p
              className={`mt-4 text-[11px] font-semibold uppercase tracking-[0.06em] ${
                eligible ? "text-[#10B981]" : "text-muted-foreground"
              }`}
            >
              {eligible ? "Eligible" : "Not eligible"}
            </p>
          </article>
        );
      })}
    </div>
  );
}

function SettlementsPanel() {
  return (
    <section className={CARD}>
      <h2 className="text-[16px] font-semibold tracking-[-0.02em]">Settlements & payouts</h2>
      <p className="mt-2 max-w-xl text-[13.5px] text-muted-foreground">
        Validate, aggregate, read the ledger balance, generate a settlement, then hand off to the
        payment provider. Balances are never mutated in place.
      </p>
      <div className="mt-6 space-y-4">
        {settlements.map((item) => (
          <div key={item.label} className="flex items-center gap-4">
            <p className="w-[110px] shrink-0 text-[12.5px] text-muted-foreground">{item.label}</p>
            <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{ width: item.width, background: item.bar }}
              />
            </div>
            <p className="w-6 shrink-0 text-right text-[12.5px] text-muted-foreground">{item.count}</p>
            <p className="w-[70px] shrink-0 text-right text-[12.5px] font-medium">{item.amount}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ChannelPanel({
  session,
  onSignOut,
}: {
  session: CreatorSession;
  onSignOut: () => void;
}) {
  const fields = [
    ["Channel name", session.channelName],
    ["YouTube ID", session.youtubeChannelId],
    ["URL", session.channelUrl],
    ["Verification", session.verificationStatus],
    ["Plan", session.plan],
    ["Email", session.email],
  ] as const;

  return (
    <section className={CARD}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold tracking-[-0.02em]">Channel & account</h2>
        <button
          type="button"
          onClick={onSignOut}
          className={`inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-[13px] font-medium text-muted-foreground ${LINE} hover:text-foreground`}
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
          Sign out
        </button>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label} className={`rounded-xl bg-card p-4 ${LINE}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 break-all text-[13.5px] font-medium">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatMini({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className={CARD}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-[26px] font-semibold tracking-[-0.03em]">{value}</p>
      <p className="mt-1.5 text-[12px] text-muted-foreground">{hint}</p>
    </article>
  );
}

function LegendDot({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className="size-2 shrink-0 rounded-full" style={{ background: color }} />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-medium">{value}</span>
    </li>
  );
}
