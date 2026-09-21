"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import {
  Clapperboard,
  ExternalLink,
  Home,
  LogOut,
  Plus,
  Search,
  Shield,
  Users,
} from "lucide-react";
import BrandLogo from "@/components/common/BrandLogo";
import ThemeToggle from "@/components/common/ThemeToggle";
import SignOutConfirmDialog from "@/components/features/auth/SignOutConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetOnboardingMeQuery } from "@/context/services/authApi";
import {
  useCreateCreatorMutation,
  useGetAdminOverviewQuery,
  useListCreatorsQuery,
  useListUsersByRoleQuery,
  useUpdateChannelVerificationMutation,
  type AdminCreatorRow,
} from "@/context/services/adminApi";
import {
  displayName,
  isAdminRole,
  type AuthUser,
} from "@/lib/auth-routing";
import { parseApiError } from "@/lib/auth-errors";
import { hasAuthToken } from "@/lib/auth-token";
import { clearClientAuthSession } from "@/lib/auth-session";
import {
  formatAmharicChannelHandle,
  formatAmharicChannelName,
} from "@/lib/channel-display";
import { parseYouTubeChannel } from "@/lib/creator-session";
import { glassAvatar, notionistsAvatar, youtubeChannelLogo } from "@/lib/dicebear";
import { normalizePhone } from "@/lib/user-session";
import { useSignOut } from "@/hooks/useSignOut";
import {
  AdminActivityAreaChart,
  AdminGamesBarChart,
  AdminWeeklyBarChart,
} from "@/components/features/admin/AdminOverviewCharts";
import AdminAllGamesLeaderboard from "@/components/features/admin/AdminAllGamesLeaderboard";

type TabId = "overview" | "creators" | "viewers";

const LINE = "border border-border";
const CARD = `rounded-2xl bg-card ${LINE} p-5`;
const ROLE_VIEWER = 2;

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

function creatorDisplayName(row: AdminCreatorRow) {
  return displayName(row.user);
}

export default function AdminDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<TabId>("overview");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
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
    if (!isAdminRole(me.user.role)) {
      router.replace("/");
    }
  }, [me, router]);

  useEffect(() => {
    if (meError) {
      clearClientAuthSession();
      router.replace("/sign-in");

    }
  }, [meError, router]);

  const adminReady = Boolean(ready && me && isAdminRole(me.user.role));

  const creatorsQuery = useListCreatorsQuery(
    { page: tab === "overview" ? 1 : page, limit: tab === "overview" ? 100 : 20 },
    { skip: !adminReady || (tab !== "creators" && tab !== "overview") },
  );

  const viewersQuery = useListUsersByRoleQuery(
    {
      page: tab === "overview" ? 1 : page,
      limit: tab === "overview" ? 100 : 20,
      roleId: ROLE_VIEWER,
    },
    { skip: !adminReady || (tab !== "viewers" && tab !== "overview") },
  );

  const overviewQuery = useGetAdminOverviewQuery(
    { days: 90 },
    { skip: !adminReady || tab !== "overview" },
  );

  const isFetching =
    tab === "creators"
      ? creatorsQuery.isFetching
      : tab === "viewers"
        ? viewersQuery.isFetching
        : creatorsQuery.isFetching || viewersQuery.isFetching;
  const isError =
    tab === "creators"
      ? creatorsQuery.isError
      : tab === "viewers"
        ? viewersQuery.isError
        : creatorsQuery.isError || viewersQuery.isError;
  const refetch =
    tab === "creators"
      ? creatorsQuery.refetch
      : tab === "viewers"
        ? viewersQuery.refetch
        : () => {
            void creatorsQuery.refetch();
            void viewersQuery.refetch();
          };
  const hasNextPage =
    tab === "creators"
      ? creatorsQuery.data?.hasNextPage
      : tab === "viewers"
        ? viewersQuery.data?.hasNextPage
        : false;

  const creators = useMemo(() => {
    const rows = creatorsQuery.data?.data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const channels = row.channels
        .map((c) =>
          [c.channelName, c.channelUrl, c.youtubeChannelId, c.verificationStatus].join(
            " ",
          ),
        )
        .join(" ");
      const hay = [
        creatorDisplayName(row),
        row.user.email,
        row.user.phone,
        row.plan,
        row.status,
        channels,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [creatorsQuery.data?.data, query]);

  const viewers = useMemo(() => {
    const rows = viewersQuery.data?.data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((user) => {
      const hay = [
        displayName(user),
        user.email,
        user.phone,
        user.firstName,
        user.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [viewersQuery.data?.data, query]);

  useEffect(() => {
    setPage(1);
    setQuery("");
  }, [tab]);

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
        Loading admin…
      </main>
    );
  }

  const adminName = displayName(me.user);
  const shownCount = tab === "creators" ? creators.length : viewers.length;
  const overviewCreators = creatorsQuery.data?.data ?? [];
  const overviewViewers = viewersQuery.data?.data ?? [];
  const overview = overviewQuery.data;
  const pendingChannels =
    overview?.totals.pendingChannels ??
    overviewCreators.reduce(
      (count, row) =>
        count +
        row.channels.filter((ch) => ch.verificationStatus === "PENDING").length,
      0,
    );
  const verifiedChannels =
    overview?.totals.verifiedChannels ??
    overviewCreators.reduce(
      (count, row) =>
        count +
        row.channels.filter((ch) => ch.verificationStatus === "VERIFIED").length,
      0,
    );
  const activeCreators = overviewCreators.filter(
    (row) => row.status === "active",
  ).length;
  const overviewLoading =
    overviewQuery.isFetching || creatorsQuery.isFetching || viewersQuery.isFetching;
  const overviewError = overviewQuery.isError && creatorsQuery.isError;

  return (
    <div className="flex min-h-svh bg-background font-sans text-foreground">
      <aside className="sticky top-0 hidden h-svh w-[72px] shrink-0 flex-col items-center gap-3 border-r border-border bg-sidebar px-3 py-6 sm:flex">
        <BrandLogo size={40} />
        <div className="flex flex-1 flex-col items-center gap-2">
          <RailButton
            active={tab === "overview"}
            label="Overview"
            onClick={() => setTab("overview")}
          >
            <Home className="h-5 w-5" strokeWidth={1.75} />
          </RailButton>
          <RailButton
            active={tab === "creators"}
            label="Creators"
            onClick={() => setTab("creators")}
          >
            <Clapperboard className="h-5 w-5" strokeWidth={1.75} />
          </RailButton>
          <RailButton
            active={tab === "viewers"}
            label="Viewers"
            onClick={() => setTab("viewers")}
          >
            <Users className="h-5 w-5" strokeWidth={1.75} />
          </RailButton>
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

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5 sm:px-8">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-gray">
              Super admin
            </p>
            <h1 className="text-onboarding-title mt-1 text-[28px] sm:text-[32px]">
              {tab === "overview"
                ? "Overview"
                : tab === "creators"
                  ? "Creators"
                  : "Viewers"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {tab === "creators" ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setShowCreate((v) => !v)}
              >
                <Plus className="size-4" />
                {showCreate ? "Hide form" : "Create creator"}
              </Button>
            ) : null}
            <span className="hidden items-center gap-2 rounded-full border border-mist-gray bg-fog-gray px-3 py-1.5 text-[13px] text-zinc-gray sm:inline-flex">
              <Shield className="size-3.5 text-sunrise-coral" />
              {adminName}
            </span>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 border-b border-border px-6 py-3 sm:hidden">
          <TabChip active={tab === "overview"} onClick={() => setTab("overview")}>
            Overview
          </TabChip>
          <TabChip active={tab === "creators"} onClick={() => setTab("creators")}>
            Creators
          </TabChip>
          <TabChip active={tab === "viewers"} onClick={() => setTab("viewers")}>
            Viewers
          </TabChip>
        </div>

        <main className="flex-1 space-y-6 px-6 py-6 sm:px-8">
          {tab === "overview" ? (
            <OverviewPanel
              loading={overviewLoading}
              error={overviewError}
              onRetry={() => {
                void overviewQuery.refetch();
                void creatorsQuery.refetch();
                void viewersQuery.refetch();
              }}
              creatorCount={overview?.totals.creators ?? overviewCreators.length}
              viewerCount={overview?.totals.viewers ?? overviewViewers.length}
              activeCreators={activeCreators}
              pendingChannels={pendingChannels}
              verifiedChannels={verifiedChannels}
              sessions={overview?.totals.sessions ?? 0}
              plays={overview?.totals.plays ?? 0}
              activity={overview?.activity ?? []}
              weeklyPlays={overview?.weeklyPlays ?? []}
              gameStats={overview?.gameStats ?? []}
              recentCreators={overviewCreators.slice(0, 5)}
              recentViewers={overviewViewers.slice(0, 5)}
              onOpenCreators={() => setTab("creators")}
              onOpenViewers={() => setTab("viewers")}
              hasMoreCreators={Boolean(creatorsQuery.data?.hasNextPage)}
              hasMoreViewers={Boolean(viewersQuery.data?.hasNextPage)}
            />
          ) : (
            <>
              {tab === "creators" && showCreate ? (
                <CreateCreatorPanel
                  onCreated={() => {
                    setShowCreate(false);
                    setPage(1);
                    void creatorsQuery.refetch();
                  }}
                  onCancel={() => setShowCreate(false)}
                />
              ) : null}

              <div className={CARD}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative w-full max-w-md">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ash-gray" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={`Search ${tab}…`}
                      className="h-11 rounded-full border-border bg-background pl-10 text-[15px] shadow-none"
                    />
                  </div>
                  <p className="text-[13px] tracking-[-0.02em] text-zinc-gray">
                    {isFetching
                      ? "Loading…"
                      : `${shownCount} shown${hasNextPage ? " · more pages available" : ""}`}
                  </p>
                </div>
              </div>

              {isError ? (
                <div className={`${CARD} text-[15px] text-carbon-black`}>
                  Could not load {tab}.{" "}
                  <button
                    type="button"
                    className="underline underline-offset-4"
                    onClick={() => refetch()}
                  >
                    Retry
                  </button>
                </div>
              ) : tab === "creators" ? (
                <CreatorsTable
                  rows={creators}
                  isFetching={isFetching}
                  page={page}
                  hasNextPage={Boolean(hasNextPage)}
                  onPrev={() => setPage((p) => Math.max(1, p - 1))}
                  onNext={() => setPage((p) => p + 1)}
                />
              ) : (
                <ViewersTable
                  rows={viewers}
                  isFetching={isFetching}
                  page={page}
                  hasNextPage={Boolean(hasNextPage)}
                  onPrev={() => setPage((p) => Math.max(1, p - 1))}
                  onNext={() => setPage((p) => p + 1)}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function OverviewPanel({
  loading,
  error,
  onRetry,
  creatorCount,
  viewerCount,
  activeCreators,
  pendingChannels,
  verifiedChannels,
  sessions,
  plays,
  activity,
  weeklyPlays,
  gameStats,
  recentCreators,
  recentViewers,
  onOpenCreators,
  onOpenViewers,
  hasMoreCreators,
  hasMoreViewers,
}: {
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  creatorCount: number;
  viewerCount: number;
  activeCreators: number;
  pendingChannels: number;
  verifiedChannels: number;
  sessions: number;
  plays: number;
  activity: Array<{ date: string; sessions: number; plays: number }>;
  weeklyPlays: Array<{ date: string; plays: number; highScore: number }>;
  gameStats: Array<{
    slug: string;
    name: string;
    plays: number;
    avgScore: number;
  }>;
  recentCreators: AdminCreatorRow[];
  recentViewers: AuthUser[];
  onOpenCreators: () => void;
  onOpenViewers: () => void;
  hasMoreCreators: boolean;
  hasMoreViewers: boolean;
}) {
  if (error) {
    return (
      <div className={`${CARD} text-[15px] text-carbon-black`}>
        Could not load overview.{" "}
        <button type="button" className="underline underline-offset-4" onClick={onRetry}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          label="Creators"
          value={loading ? "…" : String(creatorCount)}
          hint={hasMoreCreators ? "Platform total" : "On platform"}
        />
        <StatCard
          label="Active creators"
          value={loading ? "…" : String(activeCreators)}
          hint="Status = active"
        />
        <StatCard
          label="Viewers"
          value={loading ? "…" : String(viewerCount)}
          hint={hasMoreViewers ? "Platform total" : "On platform"}
        />
        <StatCard
          label="Pending channels"
          value={loading ? "…" : String(pendingChannels)}
          hint={`${verifiedChannels} verified`}
        />
        <StatCard
          label="Watch sessions"
          value={loading ? "…" : String(sessions)}
          hint="All time"
        />
        <StatCard
          label="Game plays"
          value={loading ? "…" : String(plays)}
          hint="All time scores"
        />
      </div>

      <AdminActivityAreaChart data={activity} />

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminWeeklyBarChart data={weeklyPlays} />
        <AdminGamesBarChart data={gameStats} />
      </div>

      <AdminAllGamesLeaderboard />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={CARD}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-semibold tracking-[-0.02em]">Recent creators</h2>
            <button
              type="button"
              onClick={onOpenCreators}
              className="text-[13px] font-medium text-sunrise-coral underline-offset-4 hover:underline"
            >
              View all
            </button>
          </div>
          <ul className="mt-4 space-y-3">
            {loading && recentCreators.length === 0 ? (
              <li className="text-[13px] text-muted-foreground">Loading…</li>
            ) : null}
            {!loading && recentCreators.length === 0 ? (
              <li className="text-[13px] text-muted-foreground">No creators yet.</li>
            ) : null}
            {recentCreators.map((row) => {
              const name = creatorDisplayName(row);
              const seed = row.user.email || name;
              return (
                <li key={row.id}>
                  <Link
                    href={`/admin/creators/${row.id}`}
                    className="flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-sunrise-coral/40"
                  >
                    <CreatorAvatar
                      channels={row.channels}
                      fallbackSeed={seed}
                      size={40}
                      className="size-10 shrink-0 rounded-full bg-muted object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium hover:underline">
                        {name}
                      </p>
                      <p className="truncate text-[12px] text-muted-foreground">
                        {row.user.email ?? "—"} · {row.plan}
                      </p>
                    </div>
                    <Badge
                      tone={row.status === "active" ? "green" : "muted"}
                      label={row.status}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={CARD}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-semibold tracking-[-0.02em]">Recent viewers</h2>
            <button
              type="button"
              onClick={onOpenViewers}
              className="text-[13px] font-medium text-sunrise-coral underline-offset-4 hover:underline"
            >
              View all
            </button>
          </div>
          <ul className="mt-4 space-y-3">
            {loading && recentViewers.length === 0 ? (
              <li className="text-[13px] text-muted-foreground">Loading…</li>
            ) : null}
            {!loading && recentViewers.length === 0 ? (
              <li className="text-[13px] text-muted-foreground">No viewers yet.</li>
            ) : null}
            {recentViewers.map((user) => {
              const name = displayName(user);
              const seed = user.email || name;
              return (
                <li key={String(user.id)} className="flex items-center gap-3">
                  <img
                    src={notionistsAvatar(seed, 72)}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 shrink-0 rounded-[10px] bg-muted object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium">{name}</p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {user.email ?? "—"}
                    </p>
                  </div>
                  <Badge
                    tone={
                      (user.status?.name ?? "").toLowerCase() === "active"
                        ? "green"
                        : "muted"
                    }
                    label={user.status?.name ?? "—"}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

function CreatorAvatar({
  channels,
  fallbackSeed,
  size = 36,
  className,
}: {
  channels: AdminCreatorRow["channels"];
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
      <p className="mt-2 text-[32px] font-semibold tracking-[-0.04em] text-foreground">
        {value}
      </p>
      <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function CreateCreatorPanel({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [createCreator, { isLoading }] = useCreateCreatorMutation();

  const parsed = useMemo(
    () => parseYouTubeChannel(channelUrl),
    [channelUrl],
  );

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim() || !channelUrl.trim()) {
      setError("Fill in name, email, password, and channel URL");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!parsed) {
      setError("Enter a valid YouTube channel link");
      return;
    }
    if (phone.trim() && !normalizePhone(phone)) {
      setError("Enter a valid Ethiopian phone number, or leave it blank");
      return;
    }

    try {
      await createCreator({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        channelUrl: parsed.channelUrl,
        phone: phone.trim() ? normalizePhone(phone) ?? undefined : undefined,
      }).unwrap();
      onCreated();
    } catch (err) {
      setError(parseApiError(err, "Could not create creator"));
    }
  }

  return (
    <section className={`${CARD} space-y-5`}>
      <div>
        <h2 className="text-[22px] font-medium tracking-[-0.03em] text-carbon-black">
          Create creator account
        </h2>
        <p className="mt-1 text-[14px] tracking-[-0.02em] text-zinc-gray">
          Provision a creator from outside the public signup flow. They can sign
          in with this email and password.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid gap-4 md:grid-cols-2"
      >
        <Field label="Full name" htmlFor="admin-creator-name">
          <Input
            id="admin-creator-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-[15px]"
            required
          />
        </Field>
        <Field label="Email" htmlFor="admin-creator-email">
          <Input
            id="admin-creator-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-[15px]"
            required
          />
        </Field>
        <Field label="Password" htmlFor="admin-creator-password">
          <Input
            id="admin-creator-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-[15px]"
            minLength={8}
            required
          />
        </Field>
        <Field label="Phone (optional)" htmlFor="admin-creator-phone">
          <Input
            id="admin-creator-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09xxxxxxxx"
            className="h-11 rounded-[15px]"
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="YouTube channel URL" htmlFor="admin-creator-channel">
            <Input
              id="admin-creator-channel"
              type="url"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              placeholder="https://youtube.com/@channel"
              className="h-11 rounded-[15px]"
              required
            />
            {parsed ? (
              <p className="mt-1.5 text-[12px] text-zinc-gray">
                Detected: {formatAmharicChannelName(parsed.channelName)} ·{" "}
                {formatAmharicChannelHandle(
                  parsed.youtubeChannelId,
                  parsed.channelName,
                  parsed.channelUrl,
                ) || formatAmharicChannelName(parsed.youtubeChannelId)}
              </p>
            ) : null}
          </Field>
        </div>

        {error ? (
          <p className="md:col-span-2 rounded-[15px] border border-mist-gray bg-fog-gray px-4 py-3 text-[13px]">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3 md:col-span-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating…" : "Create creator"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </section>
  );
}

function CreatorsTable({
  rows,
  isFetching,
  page,
  hasNextPage,
  onPrev,
  onNext,
}: {
  rows: AdminCreatorRow[];
  isFetching: boolean;
  page: number;
  hasNextPage: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl bg-card ${LINE}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-[14px]">
          <thead className="border-b border-border bg-fog-gray/70 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-gray">
            <tr>
              <th className="px-5 py-3.5 font-medium">Creator</th>
              <th className="px-5 py-3.5 font-medium">Contact</th>
              <th className="px-5 py-3.5 font-medium">Plan</th>
              <th className="px-5 py-3.5 font-medium">Creator status</th>
              <th className="px-5 py-3.5 font-medium">Channels</th>
              <th className="px-5 py-3.5 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !isFetching ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-[15px] text-zinc-gray"
                >
                  No creators found.
                </td>
              </tr>
            ) : null}
            {rows.map((row) => {
              const name = creatorDisplayName(row);
              return (
                <tr
                  key={row.id}
                  className="border-b border-border align-top last:border-0 hover:bg-fog-gray/40"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/creators/${row.id}`}
                      className="flex items-start gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-sunrise-coral/40"
                    >
                      <CreatorAvatar
                        channels={row.channels}
                        fallbackSeed={row.user.email || name}
                        size={36}
                        className="size-9 shrink-0 rounded-full bg-muted object-cover"
                      />
                      <div>
                        <p className="font-medium tracking-[-0.02em] text-carbon-black underline-offset-4 group-hover:underline hover:underline">
                          {name}
                        </p>
                        <p className="mt-0.5 text-[12px] text-zinc-gray">
                          Creator #{row.id} · User #{row.user.id}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-zinc-gray">{row.user.email ?? "—"}</p>
                    <p className="mt-0.5 text-[12px] text-ash-gray">
                      {row.user.phone ?? "No phone"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      tone={row.plan === "PRO" ? "coral" : "muted"}
                      label={row.plan}
                    />
                    {row.planStartedAt ? (
                      <p className="mt-1 text-[12px] text-ash-gray">
                        since {formatDate(row.planStartedAt)}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      tone={row.status === "active" ? "green" : "muted"}
                      label={row.status}
                    />
                    <p className="mt-1 text-[12px] text-ash-gray">
                      Account: {row.user.status?.name ?? "—"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    {row.channels.length === 0 ? (
                      <span className="text-zinc-gray">No channels</span>
                    ) : (
                      <ul className="space-y-3">
                        {row.channels.map((ch) => (
                          <li key={ch.id} className="max-w-[320px]">
                            <ChannelAdminRow channel={ch} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-5 py-4 text-zinc-gray">
                    {formatDate(row.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pager
        page={page}
        hasNextPage={hasNextPage}
        isFetching={isFetching}
        onPrev={onPrev}
        onNext={onNext}
      />
    </div>
  );
}

function ChannelAdminRow({
  channel,
}: {
  channel: AdminCreatorRow["channels"][number];
}) {
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
      <div className="flex items-center gap-1.5">
        <span className="truncate font-medium text-carbon-black">
          {formatAmharicChannelName(channel.channelName)}
        </span>
        <a
          href={channel.channelUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-sunrise-coral"
          title={channel.channelUrl}
        >
          <ExternalLink className="size-3.5" />
        </a>
      </div>
      <p className="truncate text-[12px] text-ash-gray">
        {formatAmharicChannelHandle(
          channel.youtubeChannelId,
          channel.channelName,
          channel.channelUrl,
        ) || formatAmharicChannelName(channel.youtubeChannelId)}
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
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
            className="rounded-full bg-fog-gray px-2.5 py-1 text-[11px] font-medium text-zinc-gray hover:bg-mist-gray disabled:opacity-50"
          >
            Reset
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-1 text-[11px] text-red-600">{error}</p> : null}
    </div>
  );
}

function ViewersTable({
  rows,
  isFetching,
  page,
  hasNextPage,
  onPrev,
  onNext,
}: {
  rows: AuthUser[];
  isFetching: boolean;
  page: number;
  hasNextPage: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl bg-card ${LINE}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[14px]">
          <thead className="border-b border-border bg-fog-gray/70 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-gray">
            <tr>
              <th className="px-5 py-3.5 font-medium">Name</th>
              <th className="px-5 py-3.5 font-medium">Email</th>
              <th className="px-5 py-3.5 font-medium">Phone</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !isFetching ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-[15px] text-zinc-gray"
                >
                  No viewers found.
                </td>
              </tr>
            ) : null}
            {rows.map((user) => {
              const active =
                (user.status?.name ?? "").toLowerCase() === "active";
              const name = displayName(user);
              const seed = user.email || name;
              return (
                <tr
                  key={String(user.id)}
                  className="border-b border-border last:border-0 hover:bg-fog-gray/40"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={notionistsAvatar(seed, 72)}
                        alt=""
                        width={36}
                        height={36}
                        className="size-9 shrink-0 rounded-[10px] bg-muted object-cover"
                      />
                      <span className="font-medium tracking-[-0.02em] text-carbon-black">
                        {name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-zinc-gray">
                    {user.email ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-zinc-gray">
                    {user.phone ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      tone={active ? "green" : "muted"}
                      label={user.status?.name ?? "—"}
                    />
                  </td>
                  <td className="px-5 py-4 text-zinc-gray">
                    {formatDate(user.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pager
        page={page}
        hasNextPage={hasNextPage}
        isFetching={isFetching}
        onPrev={onPrev}
        onNext={onNext}
      />
    </div>
  );
}

function Pager({
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
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page <= 1 || isFetching}
        onClick={onPrev}
      >
        Previous
      </Button>
      <span className="text-[13px] text-zinc-gray">Page {page}</span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!hasNextPage || isFetching}
        onClick={onNext}
      >
        Next
      </Button>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-onboarding-label text-carbon-black">
        {label}
      </Label>
      {children}
    </div>
  );
}

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: "green" | "coral" | "muted" | "red";
}) {
  const styles = {
    green: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    coral: "bg-sunrise-coral/15 text-sunrise-coral",
    muted: "bg-fog-gray text-zinc-gray",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
  }[tone];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.04em] ${styles}`}
    >
      {label}
    </span>
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
      onClick={onClick}
      className={`grid size-10 place-items-center rounded-full transition-colors ${
        active
          ? "bg-sunrise-coral text-paper-white"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function TabChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-[13px] font-medium tracking-[-0.02em] ${
        active
          ? "bg-sunrise-coral text-paper-white"
          : "border border-border text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}
