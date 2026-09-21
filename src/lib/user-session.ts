export type UserSession = {
  id: string;
  name: string;
  email: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  roleName?: string;
  statusName?: string;
  createdAt: string;
};

const USER_KEY = "vero.user.session";

export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "");
  if (/^\+251[79]\d{8}$/.test(digits)) return digits;
  if (/^0[79]\d{8}$/.test(digits)) return `+251${digits.slice(1)}`;
  if (/^[79]\d{8}$/.test(digits)) return `+251${digits}`;
  if (/^\+\d{10,15}$/.test(digits)) return digits;
  return null;
}

export function getUserSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

export function saveUserSession(session: UserSession): void {
  window.localStorage.setItem(USER_KEY, JSON.stringify(session));
}

export function clearUserSession(): void {
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem("vero.user.wallet");
}

export function createUserSession(input: {
  name: string;
  email: string;
  phone: string;
}): UserSession {
  const phone = normalizePhone(input.phone);
  if (!phone) {
    throw new Error("Enter a valid phone number, e.g. 09xxxxxxxx or +2519xxxxxxxx");
  }

  const createdAt = new Date().toISOString();
  const userId = `user_${Date.now()}`;

  const session: UserSession = {
    id: userId,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone,
    createdAt,
  };

  saveUserSession(session);
  return session;
}
