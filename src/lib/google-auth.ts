"use client";

export type GoogleCredentialResponse = {
  credential: string;
};

type GoogleAccountsId = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    use_fedcm_for_prompt?: boolean;
  }) => void;
  prompt: (
    momentListener?: (notification: {
      isNotDisplayed: () => boolean;
      isSkippedMoment: () => boolean;
      isDismissedMoment: () => boolean;
      getNotDisplayedReason: () => string;
      getSkippedReason: () => string;
      getDismissedReason: () => string;
    }) => void,
  ) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: "standard" | "icon";
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill" | "circle" | "square";
      logo_alignment?: "left" | "center";
      width?: number;
    },
  ) => void;
  cancel: () => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

let scriptPromise: Promise<void> | null = null;

export function loadGoogleScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google sign-in is only available in the browser"));
  }
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Could not load Google sign-in")),
        { once: true },
      );
      if (window.google?.accounts?.id) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Google sign-in"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function getGoogleClientId(): string | null {
  const id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  return id || null;
}

/**
 * Returns a Google ID token using One Tap / account chooser,
 * falling back to a programmatic click on a temporary GIS button.
 */
export async function requestGoogleIdToken(): Promise<string> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error(
      "Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID.",
    );
  }

  await loadGoogleScript();
  const googleId = window.google?.accounts?.id;
  if (!googleId) {
    throw new Error("Google sign-in failed to initialize");
  }

  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (error?: Error, token?: string) => {
      if (settled) return;
      settled = true;
      try {
        googleId.cancel();
      } catch {
        /* ignore */
      }
      cleanupFallback();
      if (error) reject(error);
      else if (token) resolve(token);
      else reject(new Error("Google sign-in was cancelled"));
    };

    let fallbackHost: HTMLDivElement | null = null;

    function cleanupFallback() {
      if (fallbackHost?.parentNode) {
        fallbackHost.parentNode.removeChild(fallbackHost);
      }
      fallbackHost = null;
    }

    function onCredential(response: GoogleCredentialResponse) {
      if (!response?.credential) {
        finish(new Error("Google did not return a credential"));
        return;
      }
      finish(undefined, response.credential);
    }

    googleId.initialize({
      client_id: clientId,
      auto_select: false,
      cancel_on_tap_outside: true,
      callback: onCredential,
    });

    googleId.prompt((notification) => {
      if (settled) return;

      const blocked =
        notification.isNotDisplayed() ||
        notification.isSkippedMoment() ||
        notification.isDismissedMoment();

      if (!blocked) return;

      // Fallback: hidden official button, then click it
      fallbackHost = document.createElement("div");
      fallbackHost.setAttribute("aria-hidden", "true");
      fallbackHost.style.cssText =
        "position:fixed;left:-9999px;top:0;width:400px;height:44px;overflow:hidden;opacity:0;pointer-events:auto;";
      document.body.appendChild(fallbackHost);

      googleId.renderButton(fallbackHost, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: 400,
      });

      window.setTimeout(() => {
        if (settled) return;
        const clickable =
          fallbackHost?.querySelector<HTMLElement>("div[role='button']") ||
          fallbackHost?.querySelector<HTMLElement>("iframe") ||
          fallbackHost?.firstElementChild;

        if (clickable instanceof HTMLElement) {
          clickable.click();
          // Give the popup a moment; if nothing returns, fail
          window.setTimeout(() => {
            if (!settled) {
              finish(new Error("Google sign-in was cancelled"));
            }
          }, 120_000);
        } else {
          const reason =
            notification.getNotDisplayedReason?.() ||
            notification.getSkippedReason?.() ||
            notification.getDismissedReason?.() ||
            "unavailable";
          finish(new Error(`Google sign-in unavailable (${reason})`));
        }
      }, 50);
    });
  });
}
