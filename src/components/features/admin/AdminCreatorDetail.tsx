"use client";

import { useMemo, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ArrowLeft,
  ExternalLink,
  LogOut,
  Shield,
} from "lucide-react";
import BrandLogo from "@/components/common/BrandLogo";
import ThemeToggle from "@/components/common/ThemeToggle";
import SignOutConfirmDialog from "@/components/features/auth/SignOutConfirmDialog";
import {
  AdminActivityAreaChart,
  AdminGamesBarChart,
  AdminWeeklyBarChart,
} from "@/components/features/admin/AdminOverviewCharts";
import { Button } from "@/components/ui/button";
import {
  useGetAdminCreatorDetailQuery,
  useUpdateChannelVerificationMutation,
  type AdminCreatorChannel,
} from "@/context/services/adminApi";
import { displayName, isAdminRole } from "@/lib/auth-routing";
import { parseApiError } from "@/lib/auth-errors";
import { hasAuthToken } from "@/lib/auth-token";
import { clearClientAuthSession } from "@/lib/auth-session";
import {
  glassAvatar,
  notionistsAvatar,
  userBannerGradient,
  youtubeChannelBanner,
  youtubeChannelLogo,
} from "@/lib/dicebear";
import {
  formatAmharicChannelHandle,
  formatAmharicChannelName,
} from "@/lib/channel-display";
import { gameLogoUrl } from "@/lib/game-logos";
import { useSignOut } from "@/hooks/useSignOut";
import { useGetOnboardingMeQuery } from "@/context/services/authApi";
import { useEffect } from "react";

const LINE = "border border-border";
const CARD = `rounded-2xl bg-card ${LINE} p-5`;

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(value);
  }
}

function formatDuration(ms: number) {
  if (!ms || ms < 1000) return "0s";
  const totalSec = Math.round(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  if (mins < 60) return secs ? `${mins}m ${secs}s` : `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins ? `${hours}h ${remMins}m` : `${hours}h`;
}

function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?rel=0`;
}

function isRawVideoId(title: string | null | undefined, videoId: string): boolean {
  const t = (title ?? "").trim();
  const id = videoId.trim();
  if (!t) return true;
  if (t === id) return true;
  return /^[a-zA-Z0-9_-]{11}$/.test(t);
}

function friendlyVideoTitle(title: string | null | undefined, videoId: string): string {
  if (isRawVideoId(title, videoId)) return "Untitled YouTube video";
  return String(title).trim();
}

function friendlyStatus(status: string): string {
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatWhen(value?: string | null): string {
  if (!value) return "—";
  try {
    const date = new Date(value);
    const now = Date.now();
    const diffMs = now - date.getTime();
    const mins = Math.floor(diffMs / 60_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return String(value);
  }
}

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: "green" | "coral" | "muted" | "red";
}) {
  const styles =
    tone === "green"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
      : tone === "coral"
        ? "bg-sunrise-coral/15 text-sunrise-coral"
        : tone === "red"
          ? "bg-red-500/10 text-red-600 dark:text-red-400"
          : "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.04em] ${styles}`}
    >
      {label}
    </span>
  );
}

function CreatorAvatar({
  channels,
  fallbackSeed,
  size = 56,
  className,
}: {
  channels: AdminCreatorChannel[];
  fallbackSeed: string;
  size?: number;
  className?: string;
}) {
  const primaryId = channels[0]?.youtubeChannelId ?? "";
  const yt = youtubeChannelLogo(primaryId, size * 2);
  const fallback = glassAvatar(fallbackSeed, size * 2);
  const [src, setSrc] = useState(yt || fallback);

  useEffect(() => {
    setSrc(yt || fallback);
  }, [yt, fallback]);

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={className}
      onError={() => {
        if (src !== fallback) setSrc(fallback);
      }}
    />
  );
}

function ChannelActions({ channel }: { channel: AdminCreatorChannel }) {
  const [updateVerification, { isLoading }] =
    useUpdateChannelVerificationMutation();
  const [error, setError] = useState<string | null>(null);

  async function setStatus(status: "VERIFIED" | "REJECTED" | "PENDING") {
    setError(null);
    try {
      await updateVerification({ id: channel.id, status }).unwrap();
    } catch (err) {
      setError(parseApiError(err, "Could not update verification"));
    }
  }

  return (
    <div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge
          tone={
            channel.verificationStatus === "VERIFIED"
              ? "green"
              : channel.verificationStatus === "REJECTED"
                ? "red"
                : "muted"
          }
          label={channel.verificationStatus}
        />
        {channel.verificationStatus !== "VERIFIED" ? (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void setStatus("VERIFIED")}
            className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-500/25 disabled:opacity-50 dark:text-emerald-400"
          >
            Verify
          </button>
        ) : null}
        {channel.verificationStatus !== "REJECTED" ? (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void setStatus("REJECTED")}
            className="rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-medium text-red-600 hover:bg-red-500/20 disabled:opacity-50 dark:text-red-400"
          >
            Reject
          </button>
        ) : null}
        {channel.verificationStatus !== "PENDING" ? (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void setStatus("PENDING")}
            className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground disabled:opacity-50"
          >
            Reset
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-1 text-[11px] text-red-600">{error}</p> : null}
    </div>
  );
}

export default function AdminCreatorDetail({ creatorId }: { creatorId: number }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [videoPage, setVideoPage] = useState(1);
  const [sessionPage, setSessionPage] = useState(1);
  const [tab, setTab] = useState<"home" | "videos" | "sessions" | "analytics" | "about">(
    "home",
  );
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

  const { data: me, isError: meError, isLoading: meLoading } =
    useGetOnboardingMeQuery(undefined, { skip: !ready || signingOut });

  useEffect(() => {
    if (!me) return;
    if (!isAdminRole(me.user.role)) router.replace("/");
  }, [me, router]);

  useEffect(() => {
    if (meError) {
      clearClientAuthSession();
      router.replace("/sign-in");
    }
  }, [meError, router]);

  const { data, isLoading, isError, isFetching, refetch } =
    useGetAdminCreatorDetailQuery(
      {
        id: creatorId,
        days: 90,
        videoPage,
        sessionPage,
        limit: 5,
      },
      { skip: !ready || signingOut || !me || !isAdminRole(me.user.role) },
    );

  const activityForChart = useMemo(
    () =>
      (data?.activity ?? []).map(({ date, sessions, plays }) => ({
        date,
        sessions,
        plays,
      })),
    [data?.activity],
  );

  if (signingOut) {
    return (
      <main className="grid min-h-svh place-items-center bg-background font-sans text-[15px] text-muted-foreground">
        Signing out…
      </main>
    );
  }

  if (!ready || meLoading || !me || !isAdminRole(me.user.role)) {
    return (
      <main className="grid min-h-svh place-items-center bg-background font-sans text-[15px] text-muted-foreground">
        Loading…
      </main>
    );
  }

  if (isLoading && !data) {
    return (
      <main className="grid min-h-svh place-items-center bg-background font-sans text-[15px] text-muted-foreground">
        Loading creator…
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="grid min-h-svh place-items-center bg-background px-6 font-sans">
        <div className={`${CARD} max-w-md text-center`}>
          <p className="text-[15px]">Could not load this creator.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Button type="button" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
            <Button type="button" asChild>
              <Link href="/admin">Back to admin</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const { creator, totals } = data;
  const name = displayName(creator.user);
  const seed = creator.user.email || name;
  const primaryChannel = creator.channels[0];
  const bannerUrl = primaryChannel
    ? youtubeChannelBanner(primaryChannel.youtubeChannelId, 2560)
    : null;
  const bannerFallback = userBannerGradient(seed);
  const channelTitle = formatAmharicChannelName(
    primaryChannel?.channelName || name,
  );
  const handle =
    formatAmharicChannelHandle(
      primaryChannel?.youtubeChannelId ?? "",
      primaryChannel?.channelName,
      primaryChannel?.channelUrl,
    ) ?? channelHandle(primaryChannel);

  const tabs = [
    { id: "home" as const, label: "Home" },
    { id: "videos" as const, label: "Videos" },
    { id: "sessions" as const, label: "Sessions" },
    { id: "analytics" as const, label: "Analytics" },
    { id: "about" as const, label: "About" },
  ];

  return (
    <div className="flex min-h-svh bg-background font-sans text-foreground">
      <aside className="sticky top-0 hidden h-svh w-[72px] shrink-0 flex-col items-center gap-3 border-r border-border bg-sidebar px-3 py-6 sm:flex">
        <BrandLogo size={40} />
        <div className="flex flex-1 flex-col items-center gap-2">
          <Link
            href="/admin"
            title="Creators"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Shield className="h-5 w-5" strokeWidth={1.75} />
          </Link>
        </div>
        <ThemeToggle />
        <button
          type="button"
          onClick={requestSignOut}
          className="grid size-10 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Sign out"
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

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="border-b border-border px-4 py-3 sm:px-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Creators
          </Link>
        </div>

        {/* YouTube-style channel header */}
        <div className="mx-auto w-full max-w-[1280px] px-4 pt-4 sm:px-6">
          <div className="relative aspect-[6/1] w-full overflow-hidden rounded-2xl bg-muted sm:aspect-[6.2/1]">
            {bannerUrl ? (
              <img
                src={bannerUrl}
                alt=""
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                  const fallback = event.currentTarget
                    .nextElementSibling as HTMLElement | null;
                  if (fallback) fallback.style.display = "block";
                }}
              />
            ) : null}
            <div
              className="absolute inset-0"
              style={{
                display: bannerUrl ? "none" : "block",
                background: bannerFallback,
              }}
              aria-hidden
            />
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:mt-5 sm:flex-row sm:items-start sm:gap-6">
            <CreatorAvatar
              channels={creator.channels}
              fallbackSeed={seed}
              size={160}
              className="mx-auto size-[96px] shrink-0 rounded-full bg-muted object-cover sm:mx-0 sm:size-[136px] lg:size-[160px]"
            />

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h1 className="truncate text-[28px] font-bold leading-tight tracking-[-0.02em] sm:text-[36px]">
                    {channelTitle}
                  </h1>
                  <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-[14px] text-muted-foreground sm:justify-start">
                    {handle ? (
                      <span className="font-medium text-foreground">{handle}</span>
                    ) : null}
                    {handle ? <span aria-hidden>·</span> : null}
                    <span>
                      {totals.uniqueViewers.toLocaleString()}{" "}
                      {totals.uniqueViewers === 1 ? "viewer" : "viewers"}
                    </span>
                    <span aria-hidden>·</span>
                    <span>
                      {totals.sessions.toLocaleString()}{" "}
                      {totals.sessions === 1 ? "session" : "sessions"}
                    </span>
                    <span aria-hidden>·</span>
                    <span>{formatDuration(totals.totalWatchMs)} watched</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[14px] text-muted-foreground">
                    {name}
                    {creator.user.email ? ` · ${creator.user.email}` : ""}
                    {" · "}
                    Joined {formatDate(creator.createdAt)}
                    {primaryChannel
                      ? ` · ${formatAmharicChannelName(primaryChannel.channelName)}`
                      : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <Badge
                      tone={creator.status === "active" ? "green" : "muted"}
                      label={creator.status}
                    />
                    <Badge
                      tone={creator.plan === "PRO" ? "coral" : "muted"}
                      label={creator.plan === "NONE" ? "No plan" : creator.plan}
                    />
                    {primaryChannel ? (
                      <Badge
                        tone={
                          primaryChannel.verificationStatus === "VERIFIED"
                            ? "green"
                            : primaryChannel.verificationStatus === "REJECTED"
                              ? "red"
                              : "muted"
                        }
                        label={friendlyStatus(primaryChannel.verificationStatus)}
                      />
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:justify-end">
                  {primaryChannel ? (
                    <a
                      href={primaryChannel.channelUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-[14px] font-semibold text-background hover:opacity-90"
                    >
                      View on YouTube
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* YouTube-style tabs */}
          <div className="mt-5 border-b border-border">
            <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Channel sections">
              {tabs.map((item) => {
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={`shrink-0 border-b-2 px-4 py-3 text-[15px] font-medium transition-colors ${
                      active
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <main className="mx-auto w-full max-w-[1280px] flex-1 space-y-8 px-4 py-6 sm:px-6">
          {tab === "home" ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatCard label="Sessions" value={String(totals.sessions)} hint="Last 90 days" />
                <StatCard
                  label="Viewers"
                  value={String(totals.uniqueViewers)}
                  hint="Unique"
                />
                <StatCard label="Plays" value={String(totals.plays)} hint="Game plays" />
                <StatCard
                  label="Watch time"
                  value={formatDuration(totals.totalWatchMs)}
                  hint={`Avg ${formatDuration(totals.avgWatchMs)}`}
                />
                <StatCard
                  label="Eligible"
                  value={String(totals.eligibleSessions)}
                  hint={`${totals.completedViews} completed`}
                />
                <StatCard
                  label="Channels"
                  value={String(totals.channels)}
                  hint={`${totals.verifiedChannels} verified`}
                />
              </div>

              <section>
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-[20px] font-bold tracking-[-0.02em]">For you</h2>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      Top watched videos this period
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab("videos")}
                    className="text-[13px] font-semibold text-foreground hover:opacity-70"
                  >
                    View all
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {data.topVideos.data.length === 0 ? (
                    <p className="text-[13px] text-muted-foreground col-span-full">
                      No videos yet.
                    </p>
                  ) : (
                    data.topVideos.data.map((video) => {
                      const title = friendlyVideoTitle(video.title, video.youtubeVideoId);
                      return (
                        <a
                          key={video.youtubeVideoId}
                          href={youtubeWatchUrl(video.youtubeVideoId)}
                          target="_blank"
                          rel="noreferrer"
                          className="group min-w-0"
                        >
                          <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
                            <iframe
                              src={youtubeEmbedUrl(video.youtubeVideoId)}
                              title={title}
                              className="pointer-events-none absolute inset-0 h-full w-full border-0"
                              loading="lazy"
                              tabIndex={-1}
                            />
                          </div>
                          <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-snug group-hover:text-sunrise-coral">
                            {title}
                          </p>
                          <p className="mt-1 text-[12px] text-muted-foreground">
                            {video.sessions} sessions · {formatDuration(video.watchMs)}
                          </p>
                        </a>
                      );
                    })
                  )}
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-[20px] font-bold tracking-[-0.02em]">
                      Recent activity
                    </h2>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      Latest viewer sessions
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab("sessions")}
                    className="text-[13px] font-semibold text-foreground hover:opacity-70"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-3">
                  {data.recentSessions.data.slice(0, 3).map((session) => (
                    <SessionRow key={session.id} session={session} />
                  ))}
                  {data.recentSessions.data.length === 0 ? (
                    <p className="text-[13px] text-muted-foreground">No sessions yet.</p>
                  ) : null}
                </div>
              </section>
            </>
          ) : null}

          {tab === "videos" ? (
            <section>
              <h2 className="text-[20px] font-bold tracking-[-0.02em]">Videos</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Most watched in the last 90 days
              </p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {data.topVideos.data.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground col-span-full">
                    No video sessions yet.
                  </p>
                ) : (
                  data.topVideos.data.map((video) => {
                    const title = friendlyVideoTitle(video.title, video.youtubeVideoId);
                    return (
                      <article key={video.youtubeVideoId} className="min-w-0">
                        <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
                          <iframe
                            src={youtubeEmbedUrl(video.youtubeVideoId)}
                            title={title}
                            className="absolute inset-0 h-full w-full border-0"
                            loading="lazy"
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            referrerPolicy="strict-origin-when-cross-origin"
                          />
                        </div>
                        <a
                          href={youtubeWatchUrl(video.youtubeVideoId)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2.5 block line-clamp-2 text-[15px] font-medium leading-snug hover:text-sunrise-coral"
                        >
                          {title}
                        </a>
                        <p className="mt-1 text-[13px] text-muted-foreground">
                          {video.sessions}{" "}
                          {video.sessions === 1 ? "session" : "sessions"} ·{" "}
                          {formatDuration(video.watchMs)} watched
                        </p>
                      </article>
                    );
                  })
                )}
              </div>
              <ListPager
                page={data.topVideos.page}
                hasNextPage={data.topVideos.hasNextPage}
                isFetching={isFetching}
                onPrev={() => setVideoPage((p) => Math.max(1, p - 1))}
                onNext={() => setVideoPage((p) => p + 1)}
              />
            </section>
          ) : null}

          {tab === "sessions" ? (
            <section>
              <h2 className="text-[20px] font-bold tracking-[-0.02em]">Sessions</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Latest viewer watches on this creator
              </p>
              <div className="mt-5 space-y-3">
                {data.recentSessions.data.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground">No sessions yet.</p>
                ) : (
                  data.recentSessions.data.map((session) => (
                    <SessionRow key={session.id} session={session} />
                  ))
                )}
              </div>
              <ListPager
                page={data.recentSessions.page}
                hasNextPage={data.recentSessions.hasNextPage}
                isFetching={isFetching}
                onPrev={() => setSessionPage((p) => Math.max(1, p - 1))}
                onNext={() => setSessionPage((p) => p + 1)}
              />
            </section>
          ) : null}

          {tab === "analytics" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-[20px] font-bold tracking-[-0.02em]">Analytics</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Engagement and game performance
                </p>
              </div>
              <AdminActivityAreaChart data={activityForChart} />
              <div className="grid gap-6 lg:grid-cols-2">
                <AdminWeeklyBarChart data={data.weeklyPlays} />
                <AdminGamesBarChart data={data.gameStats} />
              </div>
              {data.gameStats.length > 0 ? (
                <section>
                  <h3 className="text-[16px] font-semibold">Games</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {data.gameStats.map((game) => (
                      <div
                        key={game.slug}
                        className={`flex items-center gap-3 rounded-xl p-3 ${LINE}`}
                      >
                        <img
                          src={gameLogoUrl(game.slug)}
                          alt=""
                          width={36}
                          height={36}
                          className="size-9 rounded-lg"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-medium">{game.name}</p>
                          <p className="text-[12px] text-muted-foreground">
                            {game.plays} plays · avg {game.avgScore}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
              <section>
                <h3 className="text-[16px] font-semibold">Top viewers</h3>
                <ul className="mt-3 space-y-3">
                  {data.topViewers.length === 0 ? (
                    <li className="text-[13px] text-muted-foreground">
                      No viewer activity yet.
                    </li>
                  ) : (
                    data.topViewers.map((viewer) => (
                      <li key={viewer.id} className="flex items-center gap-3">
                        <img
                          src={notionistsAvatar(viewer.email || viewer.name, 64)}
                          alt=""
                          width={40}
                          height={40}
                          className="size-10 shrink-0 rounded-full bg-muted object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-medium">{viewer.name}</p>
                          <p className="truncate text-[12px] text-muted-foreground">
                            {viewer.sessions} sessions · {formatDuration(viewer.watchMs)}
                          </p>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </section>
            </div>
          ) : null}

          {tab === "about" ? (
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <section>
                <h2 className="text-[20px] font-bold tracking-[-0.02em]">Description</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                  Vero creator account for{" "}
                  <span className="font-medium text-foreground">{channelTitle}</span>.
                  Linked to {name}
                  {creator.user.email ? ` (${creator.user.email})` : ""}. Joined{" "}
                  {formatDate(creator.createdAt)}.
                </p>
                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                  <AboutField label="Creator ID" value={`#${creator.id}`} />
                  <AboutField label="User ID" value={`#${creator.user.id}`} />
                  <AboutField label="Plan" value={creator.plan} />
                  <AboutField label="Status" value={creator.status} />
                  <AboutField label="Email" value={creator.user.email ?? "—"} />
                  <AboutField label="Phone" value={creator.user.phone ?? "—"} />
                </dl>
              </section>

              <section>
                <h2 className="text-[20px] font-bold tracking-[-0.02em]">Channels</h2>
                <ul className="mt-4 space-y-4">
                  {creator.channels.length === 0 ? (
                    <li className="text-[13px] text-muted-foreground">No channels linked.</li>
                  ) : (
                    creator.channels.map((ch) => {
                      const chBanner = youtubeChannelBanner(ch.youtubeChannelId, 800);
                      return (
                        <li key={ch.id} className={`overflow-hidden rounded-2xl ${LINE}`}>
                          <div className="relative h-24 w-full bg-muted">
                            {chBanner ? (
                              <img
                                src={chBanner}
                                alt=""
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div
                                className="h-full w-full"
                                style={{
                                  background: userBannerGradient(ch.channelName),
                                }}
                              />
                            )}
                          </div>
                          <div className="flex items-start gap-3 p-4">
                            <img
                              src={
                                youtubeChannelLogo(ch.youtubeChannelId, 80) ||
                                glassAvatar(ch.channelName, 80)
                              }
                              alt=""
                              width={48}
                              height={48}
                              className="-mt-10 size-12 shrink-0 rounded-full border-[3px] border-card bg-muted object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="truncate text-[15px] font-semibold">
                                  {formatAmharicChannelName(ch.channelName)}
                                </p>
                                <a
                                  href={ch.channelUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="shrink-0 text-muted-foreground hover:text-foreground"
                                >
                                  <ExternalLink className="size-3.5" />
                                </a>
                              </div>
                              <p className="mt-0.5 text-[13px] text-muted-foreground">
                                {formatAmharicChannelHandle(
                                  ch.youtubeChannelId,
                                  ch.channelName,
                                  ch.channelUrl,
                                ) || formatAmharicChannelName(ch.youtubeChannelId)}
                              </p>
                              {ch.game ? (
                                <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
                                  <img
                                    src={gameLogoUrl(ch.game.slug)}
                                    alt=""
                                    width={16}
                                    height={16}
                                    className="size-4 rounded"
                                  />
                                  {ch.game.name}
                                </p>
                              ) : null}
                              <ChannelActions channel={ch} />
                            </div>
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
              </section>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function channelHandle(channel?: AdminCreatorChannel | null): string | null {
  if (!channel) return null;
  return formatAmharicChannelHandle(
    channel.youtubeChannelId,
    channel.channelName,
    channel.channelUrl,
  );
}

function AboutField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-[14px] font-medium break-all">{value}</dd>
    </div>
  );
}

function SessionRow({
  session,
}: {
  session: {
    id: string;
    title: string;
    youtubeVideoId: string;
    channelName: string;
    status: string;
    watchMs: number;
    startedAt: string;
    viewer: { id: number; name: string; email: string | null };
  };
}) {
  const title = friendlyVideoTitle(session.title, session.youtubeVideoId);
  const viewerSeed = session.viewer.email || session.viewer.name;

  return (
    <article className={`rounded-2xl p-3 ${LINE}`}>
      <div className="flex items-start gap-3">
        <div className="relative h-[72px] w-[128px] shrink-0 overflow-hidden rounded-xl bg-black">
          <iframe
            src={youtubeEmbedUrl(session.youtubeVideoId)}
            title={title}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <a
              href={youtubeWatchUrl(session.youtubeVideoId)}
              target="_blank"
              rel="noreferrer"
              className="line-clamp-2 text-[14px] font-medium leading-snug hover:text-sunrise-coral"
            >
              {title}
            </a>
            <Badge
              tone={
                session.status === "COMPLETED"
                  ? "green"
                  : session.status === "ABANDONED"
                    ? "red"
                    : "muted"
              }
              label={friendlyStatus(session.status)}
            />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <img
              src={notionistsAvatar(viewerSeed, 48)}
              alt=""
              width={24}
              height={24}
              className="size-6 rounded-full bg-muted object-cover"
            />
            <p className="truncate text-[13px] text-muted-foreground">
              <span className="font-medium text-foreground">{session.viewer.name}</span>
              {" · "}
              {formatAmharicChannelName(session.channelName)}
            </p>
          </div>
          <p className="mt-1.5 text-[12px] text-muted-foreground">
            {formatWhen(session.startedAt)} · watched {formatDuration(session.watchMs)}
          </p>
        </div>
      </div>
    </article>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className={CARD}>
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-gray">
        {label}
      </p>
      <p className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-foreground">
        {value}
      </p>
      <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function ListPager({
  page,
  hasNextPage,
  isFetching,
  onPrev,
  onNext,
}: {
  page: number;
  hasNextPage: boolean;
  isFetching: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (page <= 1 && !hasNextPage) return null;

  return (
    <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
      <button
        type="button"
        onClick={onPrev}
        disabled={page <= 1 || isFetching}
        className="rounded-full border border-border px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-40"
      >
        Previous
      </button>
      <p className="text-[12px] text-muted-foreground">
        Page {page}
        {isFetching ? " · Loading…" : ""}
      </p>
      <button
        type="button"
        onClick={onNext}
        disabled={!hasNextPage || isFetching}
        className="rounded-full border border-border px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
