/** DiceBear Notionists — same style as Vero browser (viewers / accounts). */
export function notionistsAvatar(seed: string, size = 128): string {
  const s = encodeURIComponent(seed.trim() || "vero");
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${s}&size=${size}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

/** DiceBear Glass — fallback when a YouTube logo is unavailable. */
export function glassAvatar(seed: string, size = 128): string {
  const s = encodeURIComponent(seed.trim() || "vero");
  return `https://api.dicebear.com/10.x/glass/svg?seed=${s}&size=${size}`;
}

/**
 * YouTube channel profile image from UC… id or @handle.
 * Uses public avatar resolvers (no YouTube API key).
 */
export function youtubeChannelLogo(
  youtubeChannelId: string,
  size = 128,
): string | null {
  const id = youtubeChannelId.trim();
  if (!id) return null;
  if (/^UC[\w-]{22}$/.test(id)) {
    return `https://banner.yt/${encodeURIComponent(id)}/avatar?width=${size}&height=${size}`;
  }
  let handle = id.replace(/^@/, "");
  if (!handle) return null;
  // Amharic handles may be stored percent-encoded — decode before resolving.
  if (/%[0-9A-Fa-f]{2}/.test(handle)) {
    try {
      const decoded = decodeURIComponent(handle);
      if (/[\u1200-\u137F]/.test(decoded)) handle = decoded;
    } catch {
      /* keep encoded */
    }
  }
  return `https://unavatar.io/youtube/${encodeURIComponent(handle)}?size=${size}`;
}

/**
 * YouTube channel banner image from UC… id.
 * Falls back to null when we only have a handle (needs canonical UC id).
 */
export function youtubeChannelBanner(
  youtubeChannelId: string,
  width = 1280,
): string | null {
  const id = youtubeChannelId.trim();
  if (!id) return null;
  if (/^UC[\w-]{22}$/.test(id)) {
    return `https://banner.yt/${encodeURIComponent(id)}?width=${width}&format=webp`;
  }
  return null;
}

function hashSeed(seed: string): number {
  let h = 2166136261;
  const s = seed.trim().toLowerCase() || "vero";
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Stable per-user banner gradient. */
export function userBannerGradient(seed: string): string {
  const h = hashSeed(seed);
  const hueA = h % 360;
  const hueB = (hueA + 38 + (h % 50)) % 360;
  const hueC = (hueA + 95 + ((h >>> 8) % 70)) % 360;
  const hueD = (hueA + 160 + ((h >>> 16) % 80)) % 360;
  const satA = 62 + (h % 22);
  const satB = 55 + ((h >>> 4) % 28);
  const litA = 52 + ((h >>> 6) % 14);
  const litB = 44 + ((h >>> 10) % 16);
  const litC = 48 + ((h >>> 12) % 18);
  const angle = 110 + (h % 50);
  return `linear-gradient(${angle}deg,
    hsl(${hueA} ${satA}% ${litA}%) 0%,
    hsl(${hueB} ${satB}% ${litB}%) 32%,
    hsl(${hueC} ${satA}% ${litC}%) 62%,
    hsl(${hueD} ${satB}% ${Math.max(38, litB - 6)}%) 100%)`;
}

export function handleFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim() || "user";
  return `@${local}`;
}
