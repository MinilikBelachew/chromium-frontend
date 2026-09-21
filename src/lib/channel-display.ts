/** Ethiopic / Amharic Unicode ranges. */
const AMHARIC_RE =
  /[\u1200-\u137F\u1380-\u139F\u2D80-\u2DDF\uAB00-\uAB2F]/;

/**
 * Decode percent-encoded Amharic channel names/handles for display.
 * e.g. "%E1%8B%A8%E1%8A%AE..." → "የኮሪያፊልም"
 * Only rewrites when the decoded text contains Amharic (Ethiopic) script.
 */
export function formatAmharicChannelName(value: string | null | undefined): string {
  if (!value) return "";
  const raw = value.trim();
  if (!raw) return "";

  if (!/%[0-9A-Fa-f]{2}/.test(raw)) {
    return raw;
  }

  try {
    const decoded = decodeURIComponent(raw.replace(/\+/g, " "));
    if (AMHARIC_RE.test(decoded)) {
      return decoded;
    }
  } catch {
    /* keep original */
  }

  return raw;
}

/** Display handle; decodes Amharic percent-encoding when present. */
export function formatAmharicChannelHandle(
  youtubeChannelId: string,
  channelName?: string | null,
  channelUrl?: string | null,
): string | null {
  const id = youtubeChannelId.trim();
  if (id.startsWith("@")) {
    const decoded = formatAmharicChannelName(id.slice(1));
    return decoded ? `@${decoded}` : id;
  }

  const fromUrl = channelUrl?.match(/youtube\.com\/(@[^/?#]+)/i)?.[1];
  if (fromUrl) {
    const decoded = formatAmharicChannelName(fromUrl.slice(1));
    return decoded ? `@${decoded}` : fromUrl;
  }

  if (channelName) {
    const decoded = formatAmharicChannelName(channelName);
    if (AMHARIC_RE.test(decoded)) return `@${decoded}`;
  }

  return null;
}
