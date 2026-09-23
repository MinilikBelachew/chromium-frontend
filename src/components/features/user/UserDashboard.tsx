"use client";

import React, { useEffect, useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import {
  Bell,
  CircleHelp,
  Clapperboard,
  Home,
  KeyRound,
  LogOut,
  Trophy,
} from "lucide-react";
import { type UserSession } from "@/lib/user-session";
import BrandLogo from "@/components/common/BrandLogo";
import ThemeToggle from "@/components/common/ThemeToggle";
import SignOutConfirmDialog from "@/components/features/auth/SignOutConfirmDialog";
import {
  useGetOnboardingMeQuery,
} from "@/context/services/authApi";
import {
  useGetGameLeaderboardQuery,
  useListGamesQuery,
} from "@/context/services/gamesApi";
import { hasAuthToken } from "@/lib/auth-token";
import { clearClientAuthSession } from "@/lib/auth-session";
import { gameLogoUrl } from "@/lib/game-logos";
import { profileToUserSession } from "@/lib/profile-mappers";
import {
  handleFromEmail,
  notionistsAvatar,
  userBannerGradient,
} from "@/lib/dicebear";
import { useSignOut } from "@/hooks/useSignOut";

type NavId = "overview" | "leaderboards" | "activity";

const LINE = "border border-border";
const CARD = `rounded-2xl bg-card ${LINE} p-5`;

const mockActivity = [
  { id: "a1", title: "How I build in public", status: "ENGAGEMENT_CONFIRMED", time: "12m" },
  { id: "a2", title: "Studio setup tour", status: "VIEW_COMPLETED", time: "8m" },
  { id: "a3", title: "Q&A live clip", status: "SESSION_ACTIVE", time: "3m" },
];

export default function UserDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [ready, setReady] = useState(false);
  const [nav, setNav] = useState<NavId>("overview");
  const [avatarFailed, setAvatarFailed] = useState(false);
  const {
    confirmOpen,
    signingOut,
    requestSignOut,
    cancelSignOut,
    confirmSignOut,
  } = useSignOut();

  useEffect(() => {
    if (!hasAuthToken()) {
      router.replace("/sign-in");
      return;
    }
    setReady(true);
  }, [router]);

  const { data, isError, isLoading } = useGetOnboardingMeQuery(undefined, {
    skip: !ready || signingOut,
  });

  useEffect(() => {
    if (!data) return;
    const mapped = profileToUserSession(data);
    if (!mapped) {
      router.replace("/sign-in");
      return;
    }
    setSession(mapped);
    setAvatarFailed(false);
  }, [data, router]);

  useEffect(() => {
    if (isError) {
      clearClientAuthSession();
      router.replace("/sign-in");
    }
  }, [isError, router]);

  if (signingOut) {
    return (
      <main className="grid min-h-svh place-items-center bg-card font-sans text-[15px] text-muted-foreground">
        Signing out…
      </main>
    );
  }

  if (!session || !ready || isLoading) {
    return (
      <main className="grid min-h-svh place-items-center bg-card font-sans text-[15px] text-muted-foreground">
        Loading your account…
      </main>
    );
  }

  const avatarSeed = session.email || session.name;
  const avatarUrl = notionistsAvatar(avatarSeed, 160);
  const bannerGradient = userBannerGradient(avatarSeed);
  const handle = handleFromEmail(session.email || session.name);
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
          <RailButton
            active={nav === "overview"}
            label="Overview"
            onClick={() => setNav("overview")}
          >
            <Home className="h-5 w-5" strokeWidth={1.75} />
          </RailButton>
          <RailButton
            active={nav === "leaderboards"}
            label="Leaderboards"
            onClick={() => setNav("leaderboards")}
          >
            <Trophy className="h-5 w-5" strokeWidth={1.75} />
          </RailButton>
          <RailButton
            active={nav === "activity"}
            label="Activity"
            onClick={() => setNav("activity")}
          >
            <Clapperboard className="h-5 w-5" strokeWidth={1.75} />
          </RailButton>
        </div>
        <button
          type="button"
          aria-label="Sign out"
          onClick={requestSignOut}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </aside>

      <SignOutConfirmDialog
        open={confirmOpen}
        busy={signingOut}
        onCancel={cancelSignOut}
        onConfirm={() => {
          void confirmSignOut();
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="grid grid-cols-[1fr_auto] items-center gap-6 border-b border-border px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <BrandLogo size={36} />
            <p className="hidden text-[12px] text-muted-foreground sm:block">
              Viewer dashboard
            </p>
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
              {!avatarFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={notionistsAvatar(avatarSeed, 64)}
                  alt=""
                  className="h-8 w-8 rounded-full bg-sunrise-coral/15"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sunrise-coral/15 text-[11px] font-bold text-sunrise-coral">
                  {initials}
                </span>
              )}
              <div className="leading-tight">
                <p className="max-w-[140px] truncate text-[13px] font-medium">
                  {session.name}
                </p>
                <p className="whitespace-nowrap text-[11px] text-muted-foreground">
                  Viewer
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-6 lg:px-8">
          <div className="mb-6">
            <p className="text-[13px] text-muted-foreground">
              Your account, daily game leaderboards, and viewing history.
            </p>
            <h1 className="mt-1.5 text-[30px] font-semibold leading-[1.15] tracking-[-0.025em]">
              Hi, {session.name.split(" ")[0]}
            </h1>
          </div>

          {nav === "overview" ? (
            <Overview
              session={session}
              handle={handle}
              avatarUrl={avatarUrl}
              bannerGradient={bannerGradient}
              initials={initials}
              onOpenActivity={() => setNav("activity")}
              onOpenLeaderboards={() => setNav("leaderboards")}
            />
          ) : null}
          {nav === "leaderboards" ? <LeaderboardsPanel /> : null}
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
        active
          ? "bg-sunrise-coral/15 text-sunrise-coral"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Overview({
  session,
  handle,
  avatarUrl,
  bannerGradient,
  initials,
  onOpenActivity,
  onOpenLeaderboards,
}: {
  session: UserSession;
  handle: string;
  avatarUrl: string;
  bannerGradient: string;
  initials: string;
  onOpenActivity: () => void;
  onOpenLeaderboards: () => void;
}) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const memberSince = new Date(session.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const { data: games = [] } = useListGamesQuery();
  const previewSlug = games[0]?.slug || "bubble";
  const { data: previewLb } = useGetGameLeaderboardQuery({
    slug: previewSlug,
    limit: 5,
  });
  const previewName = games.find((g) => g.slug === previewSlug)?.name || "Mini-game";

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <section className={`${CARD} overflow-hidden p-0 lg:col-span-5`}>
        <div className="h-28 w-full" style={{ background: bannerGradient }} />
        <div className="relative px-5 pb-5 pt-0">
          <div className="-mt-10 mb-4">
            {!avatarFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="h-20 w-20 rounded-2xl border-4 border-card bg-sunrise-coral/15"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-card bg-sunrise-coral/15 text-[22px] font-bold text-sunrise-coral">
                {initials}
              </span>
            )}
          </div>
          <h2 className="text-[20px] font-semibold tracking-[-0.03em]">
            {session.name}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">{handle}</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{session.email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Pill>{session.roleName ?? "Viewer"}</Pill>
            <Pill>{session.statusName ?? "Active"}</Pill>
          </div>
        </div>
      </section>

      <section className={`${CARD} lg:col-span-7`}>
        <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
          Account details
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" value={session.name} />
          <Field label="Handle" value={handle} />
          <Field label="First name" value={session.firstName || "—"} />
          <Field label="Last name" value={session.lastName || "—"} />
          <Field label="Email" value={session.email || "—"} />
          <Field label="Phone" value={session.phone || "—"} />
          <Field label="Role" value={session.roleName ?? "Viewer"} />
          <Field label="Status" value={session.statusName ?? "Active"} />
          <Field label="Account ID" value={session.id} />
          <Field label="Member since" value={memberSince} />
        </div>
      </section>

      <section className={`${CARD} lg:col-span-7`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
              {previewName} · today
            </h2>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Your best today:{" "}
              {previewLb?.myBest != null ? previewLb.myBest : "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenLeaderboards}
            className="text-[13px] font-medium text-sky-blue hover:underline"
          >
            All boards
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {(previewLb?.entries ?? []).slice(0, 5).map((row) => (
            <div
              key={`${row.userId}-${row.rank}`}
              className={`flex items-center justify-between gap-3 rounded-xl px-3 py-3 ${LINE}`}
            >
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium">
                  #{row.rank} · {row.displayName || `Player ${row.userId}`}
                </p>
              </div>
              <span className="shrink-0 text-[13px] font-semibold">{row.score}</span>
            </div>
          ))}
          {(previewLb?.entries ?? []).length === 0 ? (
            <p className="text-[13px] text-muted-foreground">
              No scores yet today. Play in the Vero browser while watching a registered channel.
            </p>
          ) : null}
        </div>
      </section>

      <section className={`${CARD} lg:col-span-5`}>
        <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
          At a glance
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat label="Sessions" value={String(mockActivity.length)} />
          <Stat
            label="Best today"
            value={previewLb?.myBest != null ? String(previewLb.myBest) : "—"}
          />
        </div>
        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={onOpenLeaderboards}
            className="flex w-full items-center gap-2 rounded-xl border border-border px-3 py-3 text-left text-[13px] font-medium transition-colors hover:bg-muted"
          >
            <Trophy className="h-4 w-4 text-muted-foreground" />
            Daily leaderboards
          </button>
          <button
            type="button"
            onClick={onOpenActivity}
            className="flex w-full items-center gap-2 rounded-xl border border-border px-3 py-3 text-left text-[13px] font-medium transition-colors hover:bg-muted"
          >
            <Clapperboard className="h-4 w-4 text-muted-foreground" />
            Viewing activity
          </button>
          <Link
            href="/change-password"
            className="flex items-center gap-2 rounded-xl border border-border px-3 py-3 text-[13px] font-medium transition-colors hover:bg-muted"
          >
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            Change password
          </Link>
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
          Play catalog mini-games in the browser sidebar while watching registered creators. Scores update the daily leaderboard immediately.
        </p>
      </section>
    </div>
  );
}

function LeaderboardsPanel() {
  const { data: games = [] } = useListGamesQuery();
  const [slug, setSlug] = useState("bubble");
  const { data: lb, isFetching } = useGetGameLeaderboardQuery({
    slug,
    limit: 20,
  });
  const catalog = games;

  useEffect(() => {
    if (games.length && !games.some((g) => g.slug === slug)) {
      setSlug(games[0].slug);
    }
  }, [games, slug]);

  return (
    <section className={CARD}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-semibold tracking-[-0.02em]">
            Daily leaderboards
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            UTC day · {lb?.day ?? "—"} · your best today:{" "}
            {lb?.myBest != null ? lb.myBest : "—"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {catalog.map((game) => (
            <button
              key={game.slug}
              type="button"
              onClick={() => setSlug(game.slug)}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                slug === game.slug
                  ? "border border-sunrise-coral bg-sunrise-coral text-white shadow-xs"
                  : `border border-border text-muted-foreground hover:border-border/80 hover:text-foreground`
              }`}
            >
              <img
                src={gameLogoUrl(game.slug)}
                alt=""
                width={20}
                height={20}
                className="h-5 w-5 rounded-md"
              />
              {game.name}
            </button>
          ))}
          {catalog.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">Loading games…</p>
          ) : null}
        </div>
      </div>
      <div className="mt-5 overflow-x-auto">
        {isFetching && !lb ? (
          <p className="text-[13px] text-muted-foreground">Loading…</p>
        ) : (
          <table className="w-full min-w-[420px] text-left text-[13px]">
            <thead className="text-muted-foreground">
              <tr>
                <th className="pb-3 font-medium">Rank</th>
                <th className="pb-3 font-medium">Player</th>
                <th className="pb-3 text-right font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {(lb?.entries ?? []).length === 0 ? (
                <tr className="border-t border-border">
                  <td colSpan={3} className="py-4 text-muted-foreground">
                    No scores for this game today.
                  </td>
                </tr>
              ) : (
                lb!.entries.map((row) => (
                  <tr key={`${row.userId}-${row.rank}`} className="border-t border-border">
                    <td className="py-3 font-medium">#{row.rank}</td>
                    <td className="py-3">{row.displayName || `Player ${row.userId}`}</td>
                    <td className="py-3 text-right font-semibold">{row.score}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function ActivityPanel() {
  return (
    <section className={CARD}>
      <h2 className="text-[16px] font-semibold tracking-[-0.02em]">
        Viewing activity
      </h2>
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-all text-[14px] font-medium">{value}</p>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
      {children}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={`rounded-xl px-3 py-3 ${LINE}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-[22px] font-semibold tracking-[-0.03em]">{value}</p>
    </div>
  );
}
