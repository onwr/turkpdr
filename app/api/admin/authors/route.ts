import type { Prisma, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireContentManager } from "@/lib/admin/api-auth";
import {
  buildPaginationMeta,
  parsePagination,
} from "@/lib/admin/pagination";
import { prisma } from "@/lib/prisma";
import type { AdminAuthorItem } from "@/types/admin";

const AUTHOR_ROLES: UserRole[] = ["AUTHOR", "EDITOR", "ADMIN"];

function serializeAuthor(user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string | null;
  bio: string | null;
  avatar: string | null;
  expertiseAreas: string[];
  workAreas: string[];
  _count: { contents: number };
}): AdminAuthorItem {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    title: user.title,
    bio: user.bio,
    avatar: user.avatar,
    expertiseAreas: user.expertiseAreas,
    workAreas: user.workAreas,
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

  const where: Prisma.UserWhereInput = {
    role: role && AUTHOR_ROLES.includes(role) ? role : { in: AUTHOR_ROLES },
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [authors, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          title: true,
          bio: true,
          avatar: true,
          expertiseAreas: true,
          workAreas: true,
          _count: { select: { contents: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return NextResponse.json({
      authors: authors.map(serializeAuthor),
      ...meta,
    });
  } catch {
    return NextResponse.json(
      { error: "Yazarlar yüklenemedi." },
      { status: 500 }
    );
  }
}
