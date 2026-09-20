import type { OnboardingProfile } from "@/context/services/authApi";
import { displayName } from "@/lib/auth-routing";
import type { CreatorSession, VerificationStatus } from "@/lib/creator-session";
import type { UserSession, WalletEntry, WalletEntryType } from "@/lib/user-session";

function mapVerification(status?: string): VerificationStatus {
  const s = (status ?? "pending").toLowerCase();
  if (s === "verified" || s === "rejected") return s;
  return "pending";
}

export function profileToCreatorSession(
  profile: OnboardingProfile,
): CreatorSession | null {
  if (!profile.creator) return null;
  const channel = profile.creator.channels[0];
  return {
    id: String(profile.creator.id),
    name: displayName(profile.user),
    email: profile.user.email ?? "",
    channelId: channel?.id ?? null,
    channelUrl: channel?.channelUrl ?? "",
    channelName: channel?.channelName ?? "YouTube Channel",
    youtubeChannelId: channel?.youtubeChannelId ?? "",
    verificationStatus: mapVerification(channel?.verificationStatus),
    plan: profile.creator.plan === "PRO" ? "pro" : "none",
    planStartedAt: profile.creator.planStartedAt
      ? String(profile.creator.planStartedAt)
      : null,
    createdAt: profile.user.createdAt
      ? String(profile.user.createdAt)
      : new Date().toISOString(),
    gameId: channel?.gameId ?? null,
    gameSlug: channel?.gameSlug ?? null,
    gameName: channel?.gameName ?? null,
  };
}

export function profileToUserSession(
  profile: OnboardingProfile,
): UserSession | null {
  if (!profile.user) return null;
  return {
    id: String(profile.user.id),
    name: displayName(profile.user),
    email: profile.user.email ?? "",
    phone: profile.user.phone ?? "",
    firstName: profile.user.firstName ?? undefined,
    lastName: profile.user.lastName ?? undefined,
    roleName: profile.user.role?.name ?? "Viewer",
    statusName: profile.user.status?.name ?? "Active",
    createdAt: profile.user.createdAt
      ? String(profile.user.createdAt)
      : new Date().toISOString(),
  };
}

function mapWalletType(type: string): WalletEntryType {
  const t = type.toLowerCase();
  if (t === "debit" || t === "reward" || t === "topup") return t;
  return "credit";
}

export function profileToWalletLedger(profile: OnboardingProfile): WalletEntry[] {
  if (!profile.wallet?.entries) return [];
  return profile.wallet.entries.map((entry) => ({
    id: String(entry.id),
    label: entry.label,
    amount: Number(entry.amount),
    type: mapWalletType(entry.type),
    date: entry.createdAt
      ? String(entry.createdAt).slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  }));
}
