export type DownloadFamily = "desktop" | "mobile";

export type DownloadPlatformId = "windows" | "android";

export type DownloadPlatform = {
    id: DownloadPlatformId;
    family: DownloadFamily;
    name: string;
    shortName: string;
    fileKind: string;
    version: string;
    sizeLabel: string | null;
    href: string | null;
    checksum: string | null;
    requirements: string[];
    notes: string;
};

const VERSION = process.env.NEXT_PUBLIC_DOWNLOAD_VERSION?.trim() || "1.0.0";

function envUrl(key: string): string | null {
    const value = process.env[key]?.trim();
    return value || null;
}

/** Vero Browser (Windows) + Android APK. Empty href = coming soon. */
export const DOWNLOAD_PLATFORMS: DownloadPlatform[] = [
    {
        id: "windows",
        family: "desktop",
        name: "Windows",
        shortName: "Windows",
        fileKind: "Installer (.exe)",
        version: VERSION,
        sizeLabel:
            process.env.NEXT_PUBLIC_DOWNLOAD_WINDOWS_SIZE?.trim() || "~113 MB",
        href:
            envUrl("NEXT_PUBLIC_DOWNLOAD_WINDOWS") ||
            "https://github.com/MinilikBelachew/browser-version01/releases/download/v1.0.0/Browser.Setup.1.0.0.exe",
        checksum: envUrl("NEXT_PUBLIC_DOWNLOAD_WINDOWS_SHA512"),
        requirements: [
            "Windows 10 or Windows 11 (64-bit)",
            "4 GB RAM recommended",
            "Internet connection for verified watching",
        ],
        notes: "Vero Browser installer for Windows PCs.",
    },
    {
        id: "android",
        family: "mobile",
        name: "Android",
        shortName: "Android",
        fileKind: "APK",
        version: VERSION,
        sizeLabel:
            process.env.NEXT_PUBLIC_DOWNLOAD_ANDROID_SIZE?.trim() || null,
        href: envUrl("NEXT_PUBLIC_DOWNLOAD_ANDROID"),
        checksum: envUrl("NEXT_PUBLIC_DOWNLOAD_ANDROID_SHA512"),
        requirements: [
            "Android 10 or later",
            "Allow install from unknown sources if sideloading the APK",
            "Stable network for sessions and games",
        ],
        notes: "Direct APK for Vero on Android phones and tablets.",
    },
];

export function getPlatform(
    id: DownloadPlatformId,
): DownloadPlatform | undefined {
    return DOWNLOAD_PLATFORMS.find(p => p.id === id);
}

export function desktopPlatforms(): DownloadPlatform[] {
    return DOWNLOAD_PLATFORMS.filter(p => p.family === "desktop");
}

export function mobilePlatforms(): DownloadPlatform[] {
    return DOWNLOAD_PLATFORMS.filter(p => p.family === "mobile");
}

/** Best-effort client OS guess for the recommended download. */
export function detectRecommendedPlatformId(
    userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "",
): DownloadPlatformId {
    const ua = userAgent.toLowerCase();
    if (/android/.test(ua)) return "android";
    return "windows";
}

export function formatReleaseDate(iso?: string | null): string {
    if (!iso) return "Current release";
    try {
        return new Date(iso).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return "Current release";
    }
}

export const DOWNLOAD_RELEASE_DATE =
    process.env.NEXT_PUBLIC_DOWNLOAD_RELEASE_DATE?.trim() || "2026-09-21";
