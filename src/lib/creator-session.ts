export type CreatorPlan = "none" | "pro";

export type VerificationStatus = "pending" | "verified" | "rejected";

export type CreatorSession = {
  id: string;
  name: string;
  email: string;
  channelId: number | null;
  channelUrl: string;
  channelName: string;
  youtubeChannelId: string;
  verificationStatus: VerificationStatus;
  plan: CreatorPlan;
  planStartedAt: string | null;
  createdAt: string;
  gameId: number | null;
  gameSlug: string | null;
  gameName: string | null;
};

const STORAGE_KEY = "fanaye.creator.session";

export function parseYouTubeChannel(input: string): {
  channelUrl: string;
  channelName: string;
  youtubeChannelId: string;
} | null {
  const raw = input.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  if (!/(^|\.)youtube\.com$/.test(url.hostname) && url.hostname !== "youtu.be") {
    return null;
  }

  const parts = url.pathname.split("/").filter(Boolean);
  let youtubeChannelId = "";
  let channelName = "";

  if (parts[0] === "channel" && parts[1]) {
    youtubeChannelId = parts[1];
    channelName = parts[1];
  } else if (parts[0] === "c" && parts[1]) {
    youtubeChannelId = parts[1];
    channelName = parts[1].replace(/[-_]/g, " ");
  } else if (parts[0] === "user" && parts[1]) {
    youtubeChannelId = parts[1];
    channelName = parts[1];
  } else if (parts[0]?.startsWith("@")) {
    youtubeChannelId = parts[0];
    channelName = parts[0].slice(1);
  } else if (parts[0]) {
    youtubeChannelId = parts[0];
    channelName = parts[0].replace(/^@/, "");
  } else {
    return null;
  }

  return {
    channelUrl: url.toString(),
    channelName: channelName || "YouTube Channel",
    youtubeChannelId,
  };
}

export function getCreatorSession(): CreatorSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CreatorSession;
  } catch {
    return null;
  }
}

export function saveCreatorSession(session: CreatorSession): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearCreatorSession(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function createCreatorSession(input: {
  name: string;
  email: string;
  channelUrl: string;
}): CreatorSession {
  const parsed = parseYouTubeChannel(input.channelUrl);
  if (!parsed) {
    throw new Error("Enter a valid YouTube channel link");
  }

  return {
    id: `creator_${Date.now()}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    channelId: null,
    channelUrl: parsed.channelUrl,
    channelName: parsed.channelName,
    youtubeChannelId: parsed.youtubeChannelId,
    verificationStatus: "pending",
    plan: "none",
    planStartedAt: null,
    createdAt: new Date().toISOString(),
    gameId: null,
    gameSlug: null,
    gameName: null,
  };
}

export function activateProPlan(session: CreatorSession): CreatorSession {
  return {
    ...session,
    plan: "pro",
    planStartedAt: new Date().toISOString(),
    // Frontend-only: treat Pro activation as ready for dashboard; verification still pending until admin.
    verificationStatus: session.verificationStatus,
  };
}
