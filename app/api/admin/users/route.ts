import type { Prisma, UserRole, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireContentManager } from "@/lib/admin/api-auth";
import {
  buildPaginationMeta,
  parsePagination,
} from "@/lib/admin/pagination";
import { prisma } from "@/lib/prisma";
import type { AdminUserListItem } from "@/types/admin";

function serializeUser(user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string | null;
  createdAt: Date;
  _count: { contents: number };
}): AdminUserListItem {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    avatar: user.avatar,
    createdAt: user.createdAt.toISOString(),
    contentCount: user._count.contents,
  };
}

export async function GET(request: Request) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);
  const search = searchParams.get("search")?.trim();
  const role = searchParams.get("role") as UserRole | null;
  const status = searchParams.get("status") as UserStatus | null;

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (status) {
    where.status = status;
  }

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          avatar: true,
          createdAt: true,
          _count: { select: { contents: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return NextResponse.json({
      users: users.map(serializeUser),
      ...meta,
    });
  } catch {
    return NextResponse.json(
      { error: "Üyeler yüklenemedi." },
      { status: 500 }
    );
  }
}
