export type AuthUserRole = {
  id?: number | string;
  name?: string | null;
};

export type AuthUser = {
  id: number | string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role?: AuthUserRole | null;
  status?: { id?: number | string; name?: string | null } | null;
  createdAt?: string;
};

export function displayName(user: AuthUser): string {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return user.email ?? "User";
}

export function isAdminRole(role?: AuthUserRole | null): boolean {
  if (!role) return false;
  if (Number(role.id) === 1) return true;
  return (role.name ?? "").toLowerCase() === "admin";
}

export function isCreatorRole(role?: AuthUserRole | null): boolean {
  if (!role) return false;
  if (Number(role.id) === 3) return true;
  return (role.name ?? "").toLowerCase() === "creator";
}

export function isViewerRole(role?: AuthUserRole | null): boolean {
  if (!role) return false;
  const id = Number(role.id);
  if (id === 2) return true;
  const name = (role.name ?? "").toLowerCase();
  return name === "viewer" || name === "user";
}

export type AppHomePath = "/admin" | "/dashboard" | "/app";

/** Post-login / post-register destination. */
export function homePathForRole(role?: AuthUserRole | null): AppHomePath {
  if (isAdminRole(role)) return "/admin";
  if (isCreatorRole(role)) return "/dashboard";
  return "/app";
}
