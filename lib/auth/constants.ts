export const TOKEN_COOKIE = "turkpdr_token";

export const ADMIN_ROLES = ["ADMIN", "EDITOR"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export function canAccessAdmin(role: string): boolean {
  return (ADMIN_ROLES as readonly string[]).includes(role);
}
