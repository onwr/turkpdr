import type { UserRole } from "@prisma/client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
  title: string | null;
};

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};
