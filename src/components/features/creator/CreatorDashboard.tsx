"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
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
import {
  clearCreatorSession,
  getCreatorSession,
  type CreatorSession,
} from "@/lib/creator-session";
import BrandLogo from "@/components/common/BrandLogo";
import ThemeToggle from "@/components/common/ThemeToggle";

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

const recentSessions = [
  { id: "s1", title: "How I build in public", meta: "ENGAGEMENT_CONFIRMED · 12m", accent: "#fc5f2b", eligible: true },
  { id: "s2", title: "Studio setup tour", meta: "VIEW_COMPLETED · 8m", accent: "#3B82F6", eligible: true },
  { id: "s3", title: "Q&A live clip", meta: "SESSION_ACTIVE · 3m", accent: "#A1A1AA", eligible: false },
  { id: "s4", title: "Channel trailer refresh", meta: "VIEW_COMPLETED · 6m", accent: "#10B981", eligible: true },
];

const settlements = [
  { label: "Pending review", count: 2, amount: "$18.40", bar: "#A78BFA", width: "70%" },
  { label: "Not paid", count: 1, amount: "$12.00", bar: "#F87171", width: "45%" },
  { label: "Partial", count: 1, amount: "$22.10", bar: "#60A5FA", width: "55%" },
  { label: "Fully paid", count: 3, amount: "$65.00", bar: "#34D399", width: "90%" },
  { label: "Draft", count: 1, amount: "$8.25", bar: "#FBBF24", width: "35%" },
];

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
  const [period, setPeriod] = useState<Period>("month");
  const [nav, setNav] = useState<NavId>("overview");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const current = getCreatorSession();
    if (!current) {
      router.replace("/sign-up");
      return;
    }
    if (current.plan !== "pro") {
      router.replace("/subscribe");
      return;
    }
    setSession(current);
  }, [router]);

  const balance = useMemo(() => mockLedger.reduce((sum, row) => sum + row.amount, 0), []);

  if (!session) {
    return (
      <main className="grid min-h-[100svh] place-items-center bg-card font-sans text-[15px] text-muted-foreground">
        Loading dashboard…
      </main>
    );
  }

  function signOut() {
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
          {nav === "sessions" ? <SessionsPanel /> : null}
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
  const periodLabel =
    period === "today"
      ? "Today"
      : period === "week"
        ? "This week"
        : period === "month"
          ? "This month"
          : "Reports";

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
      <section className={`${CARD} md:col-span-2 lg:col-span-3`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Recent sessions</h2>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
            12
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {recentSessions.map((item) => (
            <article
              key={item.id}
              className={`rounded-xl bg-card p-3.5 ${LINE}`}
              style={{ borderLeft: `3px solid ${item.accent}` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium tracking-[-0.01em]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[11.5px] text-muted-foreground">{item.meta}</p>
                </div>
                {item.eligible ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#10B981]" strokeWidth={2} />
                ) : (
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                    Hold
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-5 md:col-span-2 lg:col-span-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <section className={CARD}>
            <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Engagement mix</h2>
            <p className="mt-1 text-[12px] text-muted-foreground">{periodLabel}</p>
            <div className="mt-5 flex items-center gap-5">
              <div
                className="relative size-[112px] shrink-0 rounded-full"
                style={{
                  background: "conic-gradient(#fc5f2b 0 28%, #3B82F6 28% 64%, #E4E4E7 64% 100%)",
                }}
              >
                <div className="absolute inset-[16px] rounded-full bg-card" />
              </div>
              <ul className="min-w-0 flex-1 space-y-2.5 text-[12.5px]">
                <LegendDot color="#fc5f2b" label="Confirmed" value="28%" />
                <LegendDot color="#3B82F6" label="Completed" value="36%" />
                <LegendDot color="#E4E4E7" label="In progress" value="36%" />
              </ul>
            </div>
          </section>

          <section className={CARD}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Creator vs fee</h2>
                <p className="mt-1 text-[12px] text-muted-foreground">Ledger split</p>
              </div>
              <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <i className="size-2 rounded-full bg-[#3B82F6]" /> Creator
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="size-2 rounded-full bg-sunrise-coral" /> Fee
                </span>
              </div>
            </div>
            <svg viewBox="0 0 320 120" className="mt-4 h-[120px] w-full" aria-hidden>
              <path
                d="M0 92 C40 84, 60 58, 100 62 S160 100, 200 74 S280 32, 320 44"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2.5"
              />
              <path
                d="M0 104 C40 100, 60 92, 100 94 S160 108, 200 102 S280 84, 320 88"
                fill="none"
                stroke="#fc5f2b"
                strokeWidth="2.5"
              />
            </svg>
            <div className="mt-1 flex justify-between text-[11px] text-ash-gray">
              <span>Jan</span>
              <span>Mar</span>
              <span>May</span>
              <span>Jul</span>
            </div>
          </section>
        </div>

        <section className={CARD}>
          <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Settlement overview</h2>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Payout status derived from the immutable ledger
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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatMini label="Ledger balance" value={`$${balance.toFixed(2)}`} hint="SUM(ledger)" />
          <StatMini label="Creator share" value="$65.20" hint="After platform fee" />
          <StatMini label="Eligible sessions" value="128" hint="Server-confirmed" />
        </div>
      </div>

      <div className="flex flex-col gap-5 md:col-span-2 lg:col-span-3">
        <section className={CARD}>
          <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Upcoming</h2>
          <div className="mt-4 flex flex-col gap-4">
            <ScheduleRow time="Sep 30" title="Monthly settlement" meta="Auto aggregate" />
            <ScheduleRow time="Oct 2" title="Channel review" meta="Verification queue" />
            <ScheduleRow time="Oct 5" title="Payout window" meta="Payment provider" />
          </div>
        </section>

        <section className={CARD}>
          <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Integrity alerts</h2>
          <div className="mt-4 flex flex-col gap-3">
            <AlertRow name="Rate limit" detail="2 bursts blocked today" />
            <AlertRow name="Duplicate session" detail="Flagged · not eligible" />
            <AlertRow name="Device check" detail="1 account under watch" />
          </div>
        </section>

        <section className={CARD}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Channel
          </p>
          <p className="mt-2 truncate text-[16px] font-semibold tracking-[-0.02em]">
            {session.channelName}
          </p>
          <p className="mt-1 text-[12.5px] capitalize text-muted-foreground">
            {session.verificationStatus} · Pro plan
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

function SessionsPanel() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {recentSessions.map((item) => (
        <article
          key={item.id}
          className={`rounded-2xl bg-card p-5 ${LINE}`}
          style={{ borderTop: `3px solid ${item.accent}` }}
        >
          <p className="text-[14px] font-semibold tracking-[-0.01em]">{item.title}</p>
          <p className="mt-2 text-[12px] text-muted-foreground">{item.meta}</p>
          <p
            className={`mt-4 text-[11px] font-semibold uppercase tracking-[0.06em] ${
              item.eligible ? "text-[#10B981]" : "text-muted-foreground"
            }`}
          >
            {item.eligible ? "Eligible" : "Not eligible"}
          </p>
        </article>
      ))}
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

function ScheduleRow({ time, title, meta }: { time: string; title: string; meta: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground ${LINE}`}>
        <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="text-[11.5px] text-muted-foreground">{time}</p>
        <p className="truncate text-[13.5px] font-medium tracking-[-0.01em]">{title}</p>
        <p className="text-[11.5px] text-muted-foreground">{meta}</p>
      </div>
    </div>
  );
}

function AlertRow({ name, detail }: { name: string; detail: string }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl bg-card p-3 ${LINE}`}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF1E9] text-sunrise-coral">
        <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium">{name}</p>
        <p className="truncate text-[11.5px] text-muted-foreground">{detail}</p>
      </div>
      <button type="button" className="shrink-0 text-[12px] font-medium text-sunrise-coral hover:underline">
        Check
      </button>
    </div>
  );
}
