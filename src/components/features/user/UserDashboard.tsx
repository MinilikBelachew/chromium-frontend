"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Bell,
  CircleHelp,
  Clapperboard,
  Compass,
  Home,
  LogOut,
  Search,
  Wallet,
} from "lucide-react";
import {
  clearUserSession,
  type UserSession,
  type WalletEntry,
} from "@/lib/user-session";
import BrandLogo from "@/components/common/BrandLogo";
import ThemeToggle from "@/components/common/ThemeToggle";
import { useGetOnboardingMeQuery } from "@/context/services/authApi";
import { clearAuthTokens, hasAuthToken } from "@/lib/auth-token";
import {
  profileToUserSession,
  profileToWalletLedger,
} from "@/lib/profile-mappers";

type NavId = "overview" | "wallet" | "watch" | "activity";

const LINE = "border border-border";
const CARD = `rounded-2xl bg-card ${LINE} p-5`;

const channels = [
  { id: "c1", name: "Studio Daily", handle: "@studiodaily", status: "Registered" },
  { id: "c2", name: "Build in Public ET", handle: "@bipet", status: "Registered" },
  { id: "c3", name: "City Walks", handle: "@citywalks", status: "Open watch" },
];

const mockActivity = [
  { id: "a1", title: "How I build in public", status: "ENGAGEMENT_CONFIRMED", time: "12m" },
  { id: "a2", title: "Studio setup tour", status: "VIEW_COMPLETED", time: "8m" },
  { id: "a3", title: "Q&A live clip", status: "SESSION_ACTIVE", time: "3m" },
];

export default function UserDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [ledger, setLedger] = useState<WalletEntry[]>([]);
  const [walletBalanceValue, setWalletBalanceValue] = useState(0);
  const [ready, setReady] = useState(false);
  const [nav, setNav] = useState<NavId>("overview");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!hasAuthToken()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  const { data, isError, isLoading } = useGetOnboardingMeQuery(undefined, {
    skip: !ready,
  });

  useEffect(() => {
    if (!data) return;
    const mapped = profileToUserSession(data);
    if (!mapped) {
      router.replace("/login");
      return;
    }
    setSession(mapped);
    const entries = profileToWalletLedger(data);
    setLedger(entries);
    setWalletBalanceValue(
      data.wallet ? Number(data.wallet.balance) : entries.reduce((s, e) => s + e.amount, 0),
    );
  }, [data, router]);

  useEffect(() => {
    if (isError) {
      clearAuthTokens();
      router.replace("/login");
    }
  }, [isError, router]);

  const balance = useMemo(() => walletBalanceValue, [walletBalanceValue]);

  if (!session || !ready || isLoading) {
    return (
      <main className="grid min-h-svh place-items-center bg-card font-sans text-[15px] text-muted-foreground">
        Loading your wallet…
      </main>
    );
  }

  const initials = session.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function signOut() {
    clearAuthTokens();
    clearUserSession();
    router.push("/");
  }

  function topUp() {
    // Demo local top-up until a wallet top-up API exists
    const next: WalletEntry = {
      id: `led_${Date.now()}`,
      label: "Manual top-up",
      amount: 10,
      type: "topup",
      date: new Date().toISOString().slice(0, 10),
    };
    setLedger((prev) => [next, ...prev]);
    setWalletBalanceValue((prev) => prev + 10);
  }

  return (
    <div className="flex min-h-svh bg-background font-sans text-foreground">
      <aside className="sticky top-0 hidden h-svh w-[72px] shrink-0 flex-col items-center gap-3 border-r border-border bg-sidebar px-3 py-6 sm:flex">
        <BrandLogo size={40} />
        <div className="flex flex-1 flex-col items-center gap-2">
          <RailButton active={nav === "overview"} label="Overview" onClick={() => setNav("overview")}>
            <Home className="h-5 w-5" strokeWidth={1.75} />
          </RailButton>
          <RailButton active={nav === "wallet"} label="Wallet" onClick={() => setNav("wallet")}>
            <Wallet className="h-5 w-5" strokeWidth={1.75} />
          </RailButton>
          <RailButton active={nav === "watch"} label="Watch" onClick={() => setNav("watch")}>
            <Compass className="h-5 w-5" strokeWidth={1.75} />
          </RailButton>
          <RailButton active={nav === "activity"} label="Activity" onClick={() => setNav("activity")}>
            <Clapperboard className="h-5 w-5" strokeWidth={1.75} />
          </RailButton>
        </div>
        <button
          type="button"
          aria-label="Sign out"
          onClick={signOut}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="grid grid-cols-[1fr_auto] items-center gap-6 border-b border-border px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <BrandLogo size={36} />
            <p className="hidden text-[12px] text-muted-foreground sm:block">Viewer dashboard</p>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-3">
            <ThemeToggle />
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              aria-label="Help"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground"
            >
              <CircleHelp className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <div className="flex h-10 items-center gap-2.5 rounded-full border border-border py-1 pl-1 pr-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF1E9] text-[11px] font-bold text-sunrise-coral">
                {initials}
              </span>
              <div className="leading-tight">
                <p className="max-w-[140px] truncate text-[13px] font-medium">{session.name}</p>
                <p className="whitespace-nowrap text-[11px] text-muted-foreground">Wallet · Viewer</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground">Watch registered channels. Your wallet stays on a ledger.</p>
              <h1 className="mt-1.5 text-[30px] font-semibold leading-[1.15] tracking-[-0.025em]">
                Hi, {session.name.split(" ")[0]}
              </h1>
            </div>
            <label className="relative w-full max-w-[400px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search channels…"
                className={`h-11 w-full rounded-full bg-card pl-11 pr-4 text-[14px] outline-none ${LINE}`}
              />
            </label>
          </div>

          {nav === "overview" ? (
            <Overview
              session={session}
              balance={balance}
              ledger={ledger}
              onWatch={() => setNav("watch")}
              onWallet={() => setNav("wallet")}
            />
          ) : null}
          {nav === "wallet" ? <WalletPanel session={session} balance={balance} ledger={ledger} onTopUp={topUp} /> : null}
          {nav === "watch" ? <WatchPanel query={query} /> : null}
          {nav === "activity" ? <ActivityPanel /> : null}
        </main>
      </div>
    </div>
  );
}

function RailButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
        active ? "bg-[#FFF1E9] text-sunrise-coral" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Overview({
  session,
  balance,
  ledger,
  onWatch,
  onWallet,
}: {
  session: UserSession;
  balance: number;
  ledger: WalletEntry[];
  onWatch: () => void;
  onWallet: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <section className={`${CARD} lg:col-span-5`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Wallet</p>
        <p className="mt-3 text-[36px] font-semibold tracking-[-0.03em]">ETB {balance.toFixed(2)}</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Ledger balance · {session.walletId}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onWallet}
            className="rounded-full bg-sunrise-coral px-5 py-2.5 text-[13px] font-bold text-white"
          >
            Open wallet
          </button>
          <button
            type="button"
            onClick={onWatch}
            className={`rounded-full px-5 py-2.5 text-[13px] font-medium ${LINE}`}
          >
            Find a channel
          </button>
        </div>
      </section>

      <section className={`${CARD} lg:col-span-7`}>
        <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Account</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Name" value={session.name} />
          <Field label="Email" value={session.email} />
          <Field label="Phone" value={session.phone} />
        </div>
      </section>

      <section className={`${CARD} lg:col-span-7`}>
        <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Recent wallet activity</h2>
        <LedgerTable entries={ledger.slice(0, 4)} />
      </section>

      <section className={`${CARD} lg:col-span-5`}>
        <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Watch next</h2>
        <div className="mt-4 flex flex-col gap-3">
          {channels.map((channel) => (
            <div key={channel.id} className={`flex items-center justify-between rounded-xl p-3 ${LINE}`}>
              <div>
                <p className="text-[14px] font-medium">{channel.name}</p>
                <p className="text-[12px] text-muted-foreground">{channel.handle}</p>
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">{channel.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function WalletPanel({
  session,
  balance,
  ledger,
  onTopUp,
}: {
  session: UserSession;
  balance: number;
  ledger: WalletEntry[];
  onTopUp: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <article className={CARD}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Balance</p>
        <p className="mt-3 text-[28px] font-semibold tracking-[-0.03em]">ETB {balance.toFixed(2)}</p>
        <p className="mt-1.5 text-[12px] text-muted-foreground">SUM of wallet ledger entries</p>
      </article>
      <article className={CARD}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Wallet ID</p>
        <p className="mt-3 break-all text-[15px] font-medium">{session.walletId}</p>
        <p className="mt-1.5 text-[12px] text-muted-foreground">Opened {new Date(session.createdAt).toLocaleDateString()}</p>
      </article>
      <article className={CARD}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Top up</p>
        <p className="mt-3 text-[15px] text-muted-foreground">Demo credit only — no real payment.</p>
        <button
          type="button"
          onClick={onTopUp}
          className="mt-4 rounded-full bg-sunrise-coral px-5 py-2.5 text-[13px] font-bold text-white"
        >
          Add ETB 10
        </button>
      </article>
      <section className={`${CARD} lg:col-span-3`}>
        <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Wallet ledger</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Balances are never overwritten. Every credit and debit is an immutable row.
        </p>
        <LedgerTable entries={ledger} />
      </section>
    </div>
  );
}

function WatchPanel({ query }: { query: string }) {
  const list = channels.filter((channel) =>
    `${channel.name} ${channel.handle}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <section className={CARD}>
      <h2 className="text-[16px] font-semibold tracking-[-0.02em]">Registered channels</h2>
      <p className="mt-2 max-w-xl text-[13.5px] text-muted-foreground">
        Watching a registered channel starts an authorized session. Engagement is confirmed
        server-side before it can affect anyone’s revenue.
      </p>
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        {list.map((channel) => (
          <article key={channel.id} className={`rounded-xl p-4 ${LINE}`}>
            <p className="text-[15px] font-semibold">{channel.name}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">{channel.handle}</p>
            <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.06em] text-sunrise-coral">
              {channel.status}
            </p>
            <button
              type="button"
              className="mt-4 w-full rounded-full bg-foreground px-4 py-2.5 text-[13px] font-medium text-background"
            >
              Start session
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function ActivityPanel() {
  return (
    <section className={CARD}>
      <h2 className="text-[16px] font-semibold tracking-[-0.02em]">Viewing activity</h2>
      <p className="mt-2 text-[13.5px] text-muted-foreground">
        VIEW_STARTED → SESSION_ACTIVE → ENGAGEMENT_CONFIRMED → VIEW_COMPLETED
      </p>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-[13px]">
          <thead className="text-muted-foreground">
            <tr>
              <th className="pb-3 font-medium">Video</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 text-right font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {mockActivity.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="py-3">{row.title}</td>
                <td className="py-3 text-muted-foreground">{row.status}</td>
                <td className="py-3 text-right">{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LedgerTable({ entries }: { entries: WalletEntry[] }) {
  if (entries.length === 0) {
    return <p className="mt-4 text-[13px] text-muted-foreground">No wallet entries yet.</p>;
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-[13px]">
        <thead className="text-muted-foreground">
          <tr>
            <th className="pb-3 font-medium">Date</th>
            <th className="pb-3 font-medium">Description</th>
            <th className="pb-3 font-medium">Type</th>
            <th className="pb-3 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((row) => (
            <tr key={row.id} className="border-t border-border">
              <td className="py-3 text-muted-foreground">{row.date}</td>
              <td className="py-3">{row.label}</td>
              <td className="py-3 capitalize text-muted-foreground">{row.type}</td>
              <td className="py-3 text-right font-medium">
                {row.amount < 0 ? "-" : "+"}ETB {Math.abs(row.amount).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <p className="mt-1 break-all text-[14px] font-medium">{value}</p>
    </div>
  );
}
