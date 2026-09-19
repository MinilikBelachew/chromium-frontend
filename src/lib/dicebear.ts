/** DiceBear Notionists avatar — stable per seed (email/name). */
export function notionistsAvatar(seed: string, size = 128): string {
  const s = encodeURIComponent(seed.trim() || "vireo");
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${s}&size=${size}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

function hashSeed(seed: string): number {
  let h = 2166136261;
  const s = seed.trim().toLowerCase() || "vireo";
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
