const ERROR_MESSAGES: Record<string, string> = {
  emailAlreadyExists: "An account with this email already exists.",
  phoneAlreadyExists: "An account with this phone number already exists.",
  invalidPhone: "Enter a valid Ethiopian mobile number (e.g. 09xxxxxxxx).",
  invalidYouTubeChannel: "Enter a valid YouTube channel link.",
  channelAlreadyLinked: "This channel is already linked to an account.",
  channelAlreadyRegistered: "This YouTube channel is already registered.",
  channelGameLocked: "Channel game is locked after onboarding and cannot be changed.",
  notFound: "No account found for this email.",
  incorrectPassword: "Incorrect password.",
  emailNotExists: "No account found for this email.",
  emailNotVerified: "Verify your email before continuing.",
  invalidOrExpiredCode: "Invalid or expired verification code.",
  incorrectOldPassword: "Current password is incorrect.",
  missingOldPassword: "Enter your current password.",
  userNotFound: "Account not found.",
  googleViewerOnly:
    "Google sign-in is for viewers only. Creators register with email.",
};

type NestErrorBody = {
  errors?: Record<string, string | string[]>;
  message?: string | string[];
  statusCode?: number;
};

export function parseApiError(error: unknown, fallback = "Something went wrong"): string {
  if (!error || typeof error !== "object") return fallback;

  const err = error as {
    status?: number | string;
    data?: NestErrorBody | string;
    error?: string;
  };

  const data = err.data;
  if (data && typeof data === "object" && data.errors) {
    const first = Object.values(data.errors)[0];
    const key = Array.isArray(first) ? first[0] : first;
    if (typeof key === "string") {
      if (key.startsWith("needLoginViaProvider:")) {
        return `Please sign in with ${key.split(":")[1]}.`;
      }
      return ERROR_MESSAGES[key] ?? key;
    }
  }

  if (data && typeof data === "object" && data.message) {
    const msg = Array.isArray(data.message) ? data.message[0] : data.message;
    if (typeof msg === "string") return msg;
  }

  if (typeof data === "string" && data.trim()) return data;

  return fallback;
}
