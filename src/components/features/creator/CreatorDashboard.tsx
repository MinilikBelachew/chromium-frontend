"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clapperboard,
  Clock3,
  FolderOpen,
  Gamepad2,
  Home,
  Layers,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import {
  clearCreatorSession,
  parseYouTubeChannel,
  type CreatorSession,
} from "@/lib/creator-session";
import { gameLogoUrl } from "@/lib/game-logos";
import { handleFromEmail, notionistsAvatar } from "@/lib/dicebear";
import BrandLogo from "@/components/common/BrandLogo";
import ThemeToggle from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAddOnboardingChannelMutation,
  useGetOnboardingMeQuery,
  useLogoutMutation,
} from "@/context/services/authApi";
import {
  useGetCreatorAnalyticsSessionsQuery,
  useGetCreatorAnalyticsSummaryQuery,
  type AnalyticsPeriod,
  type AnalyticsSessionRow,
} from "@/context/services/analyticsApi";
import {
  useGetChannelLeaderboardQuery,
  useGetGameLeaderboardQuery,
  useListGamesQuery,
  useSetChannelGameMutation,
} from "@/context/services/gamesApi";
import { parseApiError } from "@/lib/auth-errors";
import { clearAuthTokens, hasAuthToken } from "@/lib/auth-token";
import { isCreatorRole } from "@/lib/auth-routing";
import { profileToCreatorSession } from "@/lib/profile-mappers";

type Period = "today" | "week" | "month" | "reports";
type NavId =
  | "overview"
  | "earnings"
  | "sessions"
  | "settlements"
  | "leaderboard"
  | "channel"
  | "settings";

const LINE = "border border-border";
const CARD = `rounded-2xl bg-card ${LINE} p-5`;

const settlementsComingSoon = true;

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

function sessionViewer(row: AnalyticsSessionRow) {
  const name = row.viewer?.name || "Unknown viewer";
  const handle =
    row.viewer?.handle ||
    (row.viewer?.email ? handleFromEmail(row.viewer.email) : "@viewer");
  const seed = row.viewer?.email || row.viewer?.handle || name || row.id;
  return { name, handle, avatar: notionistsAvatar(seed, 64) };
}

function formatSessionWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SessionPagination({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPage: (next: number) => void;
}) {
  if (total <= 0) return null;
  return (
    <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
      <p className="text-[11.5px] text-muted-foreground">
        Page {page} of {totalPages} · {total} session{total === 1 ? "" : "s"}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${LINE} bg-card text-muted-foreground disabled:opacity-40 hover:text-foreground`}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${LINE} bg-card text-muted-foreground disabled:opacity-40 hover:text-foreground`}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

function youtubeThumbUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/mqdefault.jpg`;
}

function SessionListItem({
  item,
  compact = false,
}: {
  item: AnalyticsSessionRow;
  compact?: boolean;
}) {
  const viewer = sessionViewer(item);
  const eligible =
    item.eligible ?? (item.status === "COMPLETED" || item.watchMs >= 30_000);
  const gameName = item.game?.name || "No game";
  const gameSlug = item.game?.slug;
  const videoId = item.youtubeVideoId?.trim() || "";
  const watchUrl = videoId ? youtubeWatchUrl(videoId) : null;
  const thumbUrl = videoId ? youtubeThumbUrl(videoId) : null;
  const videoTitle = item.title || videoId || "Untitled video";
  const statusLabel = item.status.replace(/_/g, " ");

  return (
    <article
      className={`rounded-xl bg-card ${compact ? "p-3" : "p-3.5"} ${LINE}`}
      style={{ borderLeft: `3px solid ${sessionAccent(item.status)}` }}
    >
      <div className="flex items-start gap-3">
        <img
          src={viewer.avatar}
          alt=""
          width={36}
          height={36}
          className="mt-0.5 h-9 w-9 shrink-0 rounded-full bg-muted"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold tracking-[-0.01em] leading-tight">
                {viewer.name}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {viewer.handle} · {formatSessionWhen(item.startedAt)}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {eligible ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" strokeWidth={2} />
              ) : (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Hold
                </span>
              )}
              {gameSlug ? (
                <img
                  src={gameLogoUrl(gameSlug)}
                  alt={gameName}
                  title={gameName}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-lg"
                />
              ) : (
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                  title={gameName}
                >
                  <Gamepad2 className="h-4 w-4" strokeWidth={1.75} />
                </span>
              )}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <Clock3 className="h-3 w-3 text-sunrise-coral" strokeWidth={2} />
              {formatWatch(item.watchMs)}
            </span>
            <span aria-hidden className="text-border">
              ·
            </span>
            <span className="truncate">{gameName}</span>
            <span aria-hidden className="text-border">
              ·
            </span>
            <span className="uppercase tracking-[0.04em]">{statusLabel}</span>
          </div>

          {watchUrl ? (
            <a
              href={watchUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2.5 flex items-center gap-2 rounded-lg bg-muted/40 p-1.5 pr-2 transition-colors hover:bg-muted/70"
              title={videoTitle}
            >
              {thumbUrl ? (
                <span className="relative h-9 w-14 shrink-0 overflow-hidden rounded-md bg-black">
                  <img
                    src={thumbUrl}
                    alt=""
                    width={56}
                    height={36}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FF0000] text-white">
                      <span className="ml-px border-y-[3px] border-l-[5px] border-y-transparent border-l-white" />
                    </span>
                  </span>
                </span>
              ) : null}
              <span className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-foreground">
                {videoTitle}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            </a>
          ) : (
            <p className="mt-2 truncate text-[11.5px] text-muted-foreground">{videoTitle}</p>
          )}
        </div>
      </div>
    </article>
  );
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
  { id: "earnings", icon: <Layers strokeWidth={1.75} />, label: "Earnings" },
  { id: "sessions", icon: <Clapperboard strokeWidth={1.75} />, label: "Sessions" },
  { id: "settlements", icon: <Layers strokeWidth={1.75} />, label: "Settlements" },
  { id: "leaderboard", icon: <Trophy strokeWidth={1.75} />, label: "Leaderboard" },
  { id: "channel", icon: <FolderOpen strokeWidth={1.75} />, label: "Channel" },
  { id: "settings", icon: <Settings strokeWidth={1.75} />, label: "Settings" },
];

function planLabel(plan: CreatorSession["plan"]): string {
  return plan === "pro" ? "Pro" : "Starter";
}

function ChannelRequiredGate({
  name,
  onAdded,
  onSignOut,
}: {
  name: string;
  onAdded: () => void;
  onSignOut: () => void;
}) {
  const [channelUrl, setChannelUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [addChannel, { isLoading }] = useAddOnboardingChannelMutation();
  const parsed = useMemo(() => parseYouTubeChannel(channelUrl), [channelUrl]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!parsed) {
      setError("Enter a valid YouTube channel link");
      return;
    }
    try {
      await addChannel({
        channelUrl: parsed.channelUrl,
        channelName: parsed.channelName,
      }).unwrap();
      onAdded();
    } catch (err) {
      setError(parseApiError(err, "Could not add channel"));
    }
  }

  return (
    <main className="grid min-h-[100svh] place-items-center bg-background px-6 font-sans text-foreground">
      <div className="w-full max-w-md">
        <BrandLogo size={48} />
        <h1 className="mt-6 text-[28px] font-semibold tracking-[-0.03em]">
          Add your YouTube channel
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          Hi {name.split(" ")[0] || "there"} — creators need a channel before the dashboard unlocks.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channelUrl">YouTube channel URL</Label>
            <Input
              id="channelUrl"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              placeholder="https://youtube.com/@yourchannel"
              className="h-11 rounded-[15px]"
              required
            />
          </div>
          {error ? (
            <p className="rounded-[15px] border border-border bg-muted px-4 py-3 text-[13px]">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving…" : "Continue"}
          </Button>
          <button
            type="button"
            onClick={onSignOut}
            className="w-full text-[13px] text-muted-foreground underline-offset-4 hover:underline"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}

export default function CreatorDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<CreatorSession | null>(null);
  const [ready, setReady] = useState(false);
  const [period, setPeriod] = useState<Period>("month");
  const [nav, setNav] = useState<NavId>("overview");
  const [query, setQuery] = useState("");
  const [logout] = useLogoutMutation();

  useEffect(() => {
    if (!hasAuthToken()) {
      router.replace("/sign-in");
      return;
    }
    setReady(true);
  }, [router]);

  const { data, isError, isLoading, refetch } = useGetOnboardingMeQuery(undefined, {
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

  async function signOut() {
    try {
      await logout().unwrap();
    } catch {
      clearAuthTokens();
    }
    clearCreatorSession();
    router.push("/sign-in");
  }

  if (!session || !ready || isLoading) {
    return (
      <main className="grid min-h-[100svh] place-items-center bg-card font-sans text-[15px] text-muted-foreground">
        Loading dashboard…
      </main>
    );
  }

  if (!session.channelId) {
    return (
      <ChannelRequiredGate
        name={session.name}
        onAdded={() => {
          void refetch();
        }}
        onSignOut={() => {
          void signOut();
        }}
      />
    );
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
        <header className="sticky top-0 z-30 grid grid-cols-[1fr_auto] items-center gap-6 border-b border-border bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
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
                <p className="whitespace-nowrap text-[11px] text-muted-foreground">
                  Creator · {planLabel(session.plan)}
                </p>
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
                  Admins review ownership before engagement counts toward revenue. Dashboard tools
                  stay available while verification is pending.
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
            <OverviewGrid
              session={session}
              period={period}
              onOpenSessions={() => setNav("sessions")}
            />
          ) : null}
          {nav === "earnings" ? <EarningsPanel /> : null}
          {nav === "sessions" ? <SessionsPanel period={period} /> : null}
          {nav === "settlements" ? <SettlementsPanel /> : null}
          {nav === "leaderboard" ? (
            <LeaderboardPanel
              session={session}
              onOpenChannel={() => setNav("channel")}
            />
          ) : null}
          {nav === "channel" || nav === "settings" ? (
            <ChannelPanel
              session={session}
              onSignOut={signOut}
              onOpenLeaderboard={() => setNav("leaderboard")}
              onGameUpdated={(game) =>
                setSession((prev) =>
                  prev
                    ? {
                        ...prev,
                        gameId: game.id,
                        gameSlug: game.slug,
                        gameName: game.name,
                      }
                    : prev,
                )
              }
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}

function OverviewGrid({
  session,
  period,
  onOpenSessions,
}: {
  session: CreatorSession;
  period: Period;
  onOpenSessions?: () => void;
}) {
  const analyticsPeriod = toAnalyticsPeriod(period);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    setPage(1);
  }, [analyticsPeriod]);

  const { data, isLoading } = useGetCreatorAnalyticsSummaryQuery(analyticsPeriod);
  const { data: sessionsData, isFetching: sessionsLoading } =
    useGetCreatorAnalyticsSessionsQuery({
      period: analyticsPeriod,
      page,
      limit: pageSize,
    });

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
  const eligible = data?.eligibleSessions ?? completed;
  const exits = data?.navigateAways ?? 0;
  const uniqueViewers = data?.uniqueViewers ?? 0;
  const avgWatch = data?.avgWatchMs ?? 0;
  const totalWatch = data?.totalWatchMs ?? 0;
  const gamePlays = data?.gamePlays ?? 0;
  const games = data?.games ?? [];
  const topVideos = data?.topVideos ?? [];
  const watchBuckets = data?.watchBuckets ?? [];
  const daily = data?.daily ?? [];
  const recent = sessionsData?.items ?? [];
  const totalSessions = sessionsData?.total ?? data?.recentTotal ?? 0;
  const totalPages =
    sessionsData?.totalPages ?? Math.max(1, Math.ceil(totalSessions / pageSize) || 1);

  const eligiblePct = views > 0 ? Math.round((eligible / views) * 100) : 0;
  const exitPct = views > 0 ? Math.round((exits / views) * 100) : 0;
  const otherPct = Math.max(0, 100 - eligiblePct - exitPct);
  const bucketMax = Math.max(1, ...watchBuckets.map((b) => b.count));
  const dailyMax = Math.max(1, ...daily.map((d) => d.sessions));
  const gameSessionMax = Math.max(1, ...games.map((g) => g.sessions));
  const gameColors = ["#fc5f2b", "#3B82F6", "#10B981", "#A78BFA", "#F59E0B", "#EC4899"];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
      <section className={`${CARD} md:col-span-2 lg:col-span-3`}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Recent sessions</h2>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              Viewer · watch · game · video
            </p>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
            {totalSessions}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {isLoading || (sessionsLoading && recent.length === 0) ? (
            <p className="text-[13px] text-muted-foreground">Loading sessions…</p>
          ) : null}
          {!isLoading && !sessionsLoading && recent.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">
              No Fanaye browser views yet for this period.
            </p>
          ) : null}
          {recent.map((item) => (
            <SessionListItem key={item.id} item={item} compact />
          ))}
        </div>
        <SessionPagination
          page={page}
          totalPages={totalPages}
          total={totalSessions}
          onPage={setPage}
        />
        {onOpenSessions && totalSessions > 0 ? (
          <button
            type="button"
            onClick={onOpenSessions}
            className="mt-3 w-full text-left text-[12px] font-medium text-sunrise-coral hover:underline"
          >
            Open full sessions →
          </button>
        ) : null}
      </section>

      <div className="flex flex-col gap-5 md:col-span-2 lg:col-span-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatMini label="Sessions" value={String(views)} hint={`Fanaye browser · ${periodLabel}`} />
          <StatMini label="Unique viewers" value={String(uniqueViewers)} hint="Distinct accounts" />
          <StatMini label="Total watch" value={formatWatch(totalWatch)} hint="Sum of session watch time" />
          <StatMini label="Avg watch" value={formatWatch(avgWatch)} hint="Per session" />
          <StatMini label="Eligible" value={String(eligible)} hint="≥30s or completed" />
          <StatMini label="Game plays" value={String(gamePlays)} hint="Scores submitted while watching" />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <section className={CARD}>
            <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Session outcomes</h2>
            <p className="mt-1 text-[12px] text-muted-foreground">{periodLabel}</p>
            <div className="mt-5 flex items-center gap-5">
              <div
                className="relative size-28 shrink-0 rounded-full"
                style={{
                  background: `conic-gradient(#fc5f2b 0 ${eligiblePct}%, #A1A1AA ${eligiblePct}% ${eligiblePct + otherPct}%, #E4E4E7 ${eligiblePct + otherPct}% 100%)`,
                }}
              >
                <div className="absolute inset-4 grid place-items-center rounded-full bg-card">
                  <div className="text-center">
                    <p className="text-[16px] font-semibold tracking-[-0.02em]">{eligiblePct}%</p>
                    <p className="text-[10px] text-muted-foreground">eligible</p>
                  </div>
                </div>
              </div>
              <ul className="min-w-0 flex-1 space-y-2.5 text-[12.5px]">
                <LegendDot color="#fc5f2b" label="Eligible" value={`${eligible} · ${eligiblePct}%`} />
                <LegendDot color="#A1A1AA" label="Other" value={`${Math.max(0, views - eligible - exits)} · ${otherPct}%`} />
                <LegendDot color="#E4E4E7" label="Left early" value={`${exits} · ${exitPct}%`} />
              </ul>
            </div>
          </section>

          <section className={CARD}>
            <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Watch length</h2>
            <p className="mt-1 text-[12px] text-muted-foreground">How long viewers stayed</p>
            <div className="mt-5 space-y-3">
              {watchBuckets.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">No watch data yet.</p>
              ) : (
                watchBuckets.map((bucket) => (
                  <div key={bucket.key} className="flex items-center gap-3">
                    <p className="w-[72px] shrink-0 text-[12px] text-muted-foreground">{bucket.label}</p>
                    <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-sunrise-coral"
                        style={{ width: `${Math.round((bucket.count / bucketMax) * 100)}%` }}
                      />
                    </div>
                    <p className="w-7 shrink-0 text-right text-[12px] font-medium">{bucket.count}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className={CARD}>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Games while watching</h2>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Channel game on sessions · plays from submitted scores
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {games.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">No game activity in this period.</p>
            ) : (
              games.map((game, idx) => (
                <div key={game.slug} className="flex items-center gap-3">
                  <img
                    src={gameLogoUrl(game.slug)}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 shrink-0 rounded-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[13px] font-medium">{game.name}</p>
                      <p className="shrink-0 text-[11.5px] text-muted-foreground">
                        {game.sessions} sess · {game.plays} plays · {formatWatch(game.watchMs)}
                      </p>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round((game.sessions / gameSessionMax) * 100)}%`,
                          background: gameColors[idx % gameColors.length],
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <section className={CARD}>
            <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Daily activity</h2>
            <p className="mt-1 text-[12px] text-muted-foreground">Sessions per UTC day</p>
            {daily.length === 0 ? (
              <p className="mt-5 text-[13px] text-muted-foreground">No daily points yet.</p>
            ) : (
              <div className="mt-5 flex h-28 items-end gap-1">
                {daily.map((point) => {
                  const h = Math.max(8, Math.round((point.sessions / dailyMax) * 100));
                  const label = point.day.slice(5);
                  return (
                    <div key={point.day} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md bg-[#fc5f2b]/85"
                        style={{ height: `${h}%` }}
                        title={`${point.day}: ${point.sessions} sessions · ${formatWatch(point.watchMs)} · ${point.uniqueViewers} viewers`}
                      />
                      <span className="truncate text-[9px] text-muted-foreground">{label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className={CARD}>
            <h2 className="text-[15px] font-semibold tracking-[-0.02em]">Top videos</h2>
            <p className="mt-1 text-[12px] text-muted-foreground">Most watched this period</p>
            <div className="mt-4 space-y-2.5">
              {topVideos.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">No videos yet.</p>
              ) : (
                topVideos.map((video) => (
                  <a
                    key={video.youtubeVideoId}
                    href={youtubeWatchUrl(video.youtubeVideoId)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-muted/50"
                  >
                    <img
                      src={youtubeThumbUrl(video.youtubeVideoId)}
                      alt=""
                      width={56}
                      height={36}
                      className="h-9 w-14 shrink-0 rounded-md object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium">{video.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {video.sessions} sess · {formatWatch(video.watchMs)}
                      </p>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </a>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="flex flex-col gap-5 md:col-span-2 lg:col-span-3">
        <section className={CARD}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Snapshot
          </p>
          <p className="mt-2 text-[14px] font-semibold tracking-[-0.02em]">{periodLabel}</p>
          <dl className="mt-4 space-y-3 text-[12.5px]">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Completed</dt>
              <dd className="font-medium">{completed}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Still active / started</dt>
              <dd className="font-medium">{data?.activeSessions ?? 0}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Abandoned</dt>
              <dd className="font-medium">{data?.abandonedSessions ?? 0}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Left early</dt>
              <dd className="font-medium">{exits}</dd>
            </div>
          </dl>
        </section>

        <section className={CARD}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Channel
          </p>
          <p className="mt-2 truncate text-[16px] font-semibold tracking-[-0.02em]">
            {session.channelName}
          </p>
          <p className="mt-1 text-[12.5px] capitalize text-muted-foreground">
            {session.verificationStatus} · {planLabel(session.plan)} plan
          </p>
          {session.gameName ? (
            <div className="mt-3 flex items-center gap-2">
              {session.gameSlug ? (
                <img
                  src={gameLogoUrl(session.gameSlug)}
                  alt=""
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-md"
                />
              ) : null}
              <p className="text-[12.5px] text-muted-foreground">
                Live game · <span className="font-medium text-foreground">{session.gameName}</span>
              </p>
            </div>
          ) : null}
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

        <section className={CARD}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Earnings
          </p>
          <p className="mt-2 text-[15px] font-semibold tracking-[-0.02em]">Coming later</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Payouts and settlements are not live yet. Engagement analytics above are real.
          </p>
        </section>

        <section className={CARD}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Data source
          </p>
          <p className="mt-2 text-[13px] leading-normal text-muted-foreground">
            Sessions, watch time, viewers, and game plays are first-party signals from the Fanaye
            browser — not YouTube Studio.
          </p>
        </section>
      </div>
    </div>
  );
}

function EarningsPanel() {
  return (
    <section className={CARD}>
      <h2 className="text-[16px] font-semibold tracking-[-0.02em]">Earnings</h2>
      <p className="mt-2 max-w-xl text-[13.5px] text-muted-foreground">
        Creator payouts are not live yet. Use Sessions and Leaderboard for real engagement data from
        the Fanaye browser.
      </p>
    </section>
  );
}

function SessionsPanel({ period }: { period: Period }) {
  const analyticsPeriod = toAnalyticsPeriod(period);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    setPage(1);
  }, [analyticsPeriod]);

  const { data, isLoading, isFetching } = useGetCreatorAnalyticsSessionsQuery({
    period: analyticsPeriod,
    page,
    limit: pageSize,
  });
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  if (isLoading && items.length === 0) {
    return (
      <p className="text-[14px] text-muted-foreground">Loading sessions…</p>
    );
  }

  if (!isLoading && items.length === 0) {
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
    <section className={CARD}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold tracking-[-0.02em]">Sessions</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Who watched, how long, and which game they played
            {isFetching ? " · updating…" : ""}
          </p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-[12px] font-semibold text-muted-foreground">
          {total} total
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <SessionListItem key={item.id} item={item} />
        ))}
      </div>
      <SessionPagination
        page={page}
        totalPages={totalPages}
        total={total}
        onPage={setPage}
      />
    </section>
  );
}

function SettlementsPanel() {
  return (
    <section className={CARD}>
      <h2 className="text-[16px] font-semibold tracking-[-0.02em]">Settlements & payouts</h2>
      <p className="mt-2 max-w-xl text-[13.5px] text-muted-foreground">
        Settlements are coming later. When payments ship, this page will show review, payout, and
        status without mock balances.
      </p>
      {settlementsComingSoon ? (
        <p className="mt-6 rounded-2xl border border-dashed border-border px-4 py-6 text-center text-[13px] text-muted-foreground">
          No settlements yet
        </p>
      ) : null}
    </section>
  );
}

function ChannelPanel({
  session,
  onSignOut,
  onOpenLeaderboard,
  onGameUpdated,
}: {
  session: CreatorSession;
  onSignOut: () => void;
  onOpenLeaderboard: () => void;
  onGameUpdated: (game: { id: number; slug: string; name: string }) => void;
}) {
  const { data: games = [] } = useListGamesQuery();
  const [setChannelGame, { isLoading: savingGame }] = useSetChannelGameMutation();
  const channelId = session.channelId;
  const selectedSlug = session.gameSlug || "bubble";
  const selectedName =
    session.gameName ||
    games.find((g) => g.slug === selectedSlug)?.name ||
    selectedSlug;

  const fields = [
    ["Channel name", session.channelName],
    ["YouTube ID", session.youtubeChannelId],
    ["URL", session.channelUrl],
    ["Verification", session.verificationStatus],
    ["Plan", planLabel(session.plan)],
    ["Email", session.email],
  ] as const;

  async function onPickGame(slug: string) {
    if (!channelId || slug === selectedSlug) return;
    try {
      const updated = await setChannelGame({ channelId, gameSlug: slug }).unwrap();
      if (updated.game) onGameUpdated(updated.game);
    } catch {
      /* keep current selection */
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <section className={`${CARD} lg:col-span-7`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[16px] font-semibold tracking-[-0.02em]">Channel & account</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/change-password"
              className={`inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-[13px] font-medium text-muted-foreground ${LINE} hover:text-foreground`}
            >
              Change password
            </Link>
            <button
              type="button"
              onClick={onSignOut}
              className={`inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-[13px] font-medium text-muted-foreground ${LINE} hover:text-foreground`}
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
              Sign out
            </button>
          </div>
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

      <section className={`${CARD} lg:col-span-5`}>
        <h2 className="text-[16px] font-semibold tracking-[-0.02em]">Channel mini-game</h2>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Viewers play this game in the browser sidebar while watching your videos. You can switch anytime.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {games.map((game) => {
            const active = selectedSlug === game.slug;
            return (
              <button
                key={game.slug}
                type="button"
                disabled={!channelId || savingGame}
                onClick={() => void onPickGame(game.slug)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${LINE} ${
                  active
                    ? "bg-[#FFF1E9] text-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <img
                  src={gameLogoUrl(game.slug)}
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 shrink-0 rounded-lg"
                />
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold">{game.name}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {active ? "Selected for your channel" : "Click to switch"}
                  </p>
                </div>
              </button>
            );
          })}
          {games.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">Loading game catalog…</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onOpenLeaderboard}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-[13px] font-medium text-background"
        >
          <Trophy className="h-3.5 w-3.5" strokeWidth={1.75} />
          View {selectedName} leaderboard
        </button>
      </section>
    </div>
  );
}

function LeaderboardPanel({
  session,
  onOpenChannel,
}: {
  session: CreatorSession;
  onOpenChannel: () => void;
}) {
  const { data: games = [] } = useListGamesQuery();
  const channelId = session.channelId;
  const channelGameSlug = session.gameSlug || "bubble";
  const [viewSlug, setViewSlug] = useState(channelGameSlug);

  useEffect(() => {
    setViewSlug(channelGameSlug);
  }, [channelGameSlug]);

  const viewGame =
    games.find((g) => g.slug === viewSlug) ||
    games.find((g) => g.slug === channelGameSlug);
  const gameName = viewGame?.name || session.gameName || viewSlug;
  const isChannelGame = viewSlug === channelGameSlug;

  const { data: channelLb, isFetching: channelLoading } = useGetChannelLeaderboardQuery(
    { channelId: channelId!, limit: 25, gameSlug: viewSlug },
    { skip: !channelId || !viewSlug },
  );
  const { data: gameLb, isFetching: gameLoading } = useGetGameLeaderboardQuery(
    { slug: viewSlug, limit: 10 },
    { skip: !viewSlug },
  );

  const leaders = channelLb?.entries ?? [];
  const top = leaders.slice(0, 3);
  const leader = leaders[0];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <section className={`${CARD} lg:col-span-12`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[13px] text-muted-foreground">Daily standings · UTC</p>
            <h2 className="mt-1 flex items-center gap-3 text-[22px] font-semibold tracking-[-0.03em]">
              <img
                src={gameLogoUrl(viewSlug)}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-xl"
              />
              {gameName} leaderboard
            </h2>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Channel: {session.channelName || "—"} · Day {channelLb?.day ?? gameLb?.day ?? "—"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-2 rounded-full bg-[#FFF1E9] px-4 py-2 text-[13px] font-medium text-sunrise-coral ${LINE}`}>
              <Trophy className="h-3.5 w-3.5" strokeWidth={1.75} />
              Channel game · {session.gameName || channelGameSlug}
            </span>
            <button
              type="button"
              onClick={onOpenChannel}
              className={`inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-[13px] font-medium text-muted-foreground ${LINE} hover:text-foreground`}
            >
              Change channel game
            </button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {games.map((game) => {
            const active = viewSlug === game.slug;
            const isDefault = game.slug === channelGameSlug;
            return (
              <button
                key={game.slug}
                type="button"
                onClick={() => setViewSlug(game.slug)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium ${LINE} ${
                  active
                    ? "bg-[#FFF1E9] text-foreground"
                    : "text-muted-foreground hover:text-foreground"
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
                {isDefault ? " · live" : ""}
              </button>
            );
          })}
        </div>
        {!isChannelGame ? (
          <p className="mt-3 text-[12px] text-muted-foreground">
            Viewing {gameName} history on your channel. Viewers currently play{" "}
            <span className="font-medium text-foreground">
              {session.gameName || channelGameSlug}
            </span>{" "}
            in the browser sidebar.
          </p>
        ) : null}
      </section>

      <section className={`${CARD} lg:col-span-4`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Leading now
        </p>
        {!channelId ? (
          <p className="mt-4 text-[13px] text-muted-foreground">Register a channel to track scores.</p>
        ) : channelLoading && !channelLb ? (
          <p className="mt-4 text-[13px] text-muted-foreground">Loading…</p>
        ) : leader ? (
          <div className="mt-4">
            <p className="text-[28px] font-semibold tracking-[-0.03em]">
              {leader.displayName || `Player ${leader.userId}`}
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              #{leader.rank} on {gameName} today
            </p>
            <p className="mt-4 text-[32px] font-semibold tracking-[-0.04em] text-sunrise-coral">
              {leader.score}
            </p>
            <p className="text-[12px] text-muted-foreground">Best score today</p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            <p className="text-[13px] text-muted-foreground">
              No one has scored on <span className="font-medium text-foreground">{gameName}</span>{" "}
              for your channel today.
            </p>
            <p className="text-[12px] text-muted-foreground">
              Open another game tab above if viewers played a different title, or watch your channel
              in the Fanaye browser with VPN on and finish a run.
            </p>
          </div>
        )}
      </section>

      <section className={`${CARD} lg:col-span-8`}>
        <h3 className="text-[15px] font-semibold tracking-[-0.02em]">Top on your channel</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => {
            const row = top[i];
            return (
              <div
                key={i}
                className={`rounded-xl px-4 py-4 ${LINE} ${i === 0 ? "bg-[#FFF1E9]" : "bg-card"}`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  #{i + 1}
                </p>
                {row ? (
                  <>
                    <p className="mt-2 truncate text-[14px] font-semibold">
                      {row.displayName || `Player ${row.userId}`}
                    </p>
                    <p className="mt-1 text-[20px] font-semibold tracking-[-0.03em]">{row.score}</p>
                  </>
                ) : (
                  <p className="mt-2 text-[13px] text-muted-foreground">Open slot</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className={`${CARD} lg:col-span-7`}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-[16px] font-semibold tracking-[-0.02em]">
              Channel board · {gameName}
            </h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Viewers who played this game while watching your videos today
            </p>
          </div>
        </div>
        {!channelId ? (
          <p className="mt-4 text-[13px] text-muted-foreground">Register a channel to see scores.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-[13px]">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="pb-3 font-medium">Rank</th>
                  <th className="pb-3 font-medium">Player</th>
                  <th className="pb-3 text-right font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaders.length === 0 ? (
                  <tr className="border-t border-border">
                    <td colSpan={3} className="py-4 text-muted-foreground">
                      No scores yet today for {gameName} on this channel.
                    </td>
                  </tr>
                ) : (
                  leaders.map((row) => (
                    <tr key={`${row.userId}-${row.rank}`} className="border-t border-border">
                      <td className="py-3 font-medium">#{row.rank}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              row.avatarUrl ||
                              `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(
                                row.displayName || String(row.userId),
                              )}&size=64`
                            }
                            alt=""
                            className="h-8 w-8 shrink-0 rounded-lg bg-[#FFF1E9]"
                          />
                          <span>{row.displayName || `Player ${row.userId}`}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right font-semibold">{row.score}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={`${CARD} lg:col-span-5`}>
        <h3 className="text-[16px] font-semibold tracking-[-0.02em]">
          Global · {gameName}
        </h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Top players on this game across all channels today
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {gameLoading && !gameLb ? (
            <p className="text-[13px] text-muted-foreground">Loading…</p>
          ) : (gameLb?.entries ?? []).length === 0 ? (
            <p className="text-[13px] text-muted-foreground">No global scores yet today.</p>
          ) : (
            (gameLb?.entries ?? []).map((row) => (
              <div
                key={`g-${row.userId}-${row.rank}`}
                className={`flex items-center justify-between gap-3 rounded-xl px-3 py-3 ${LINE}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      row.avatarUrl ||
                      `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(
                        row.displayName || String(row.userId),
                      )}&size=64`
                    }
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-xl bg-[#FFF1E9]"
                  />
                  <p className="truncate text-[14px] font-medium">
                    #{row.rank} · {row.displayName || `Player ${row.userId}`}
                  </p>
                </div>
                <span className="shrink-0 text-[13px] font-semibold">{row.score}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
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
