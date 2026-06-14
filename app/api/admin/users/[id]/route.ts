import { NextResponse } from "next/server";

import { requireContentManager } from "@/lib/admin/api-auth";
import { prisma } from "@/lib/prisma";
import type { AdminUserDetail } from "@/types/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        title: true,
        bio: true,
        phone: true,
        city: true,
        website: true,
        createdAt: true,
        _count: { select: { contents: true, comments: true, files: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    const detail: AdminUserDetail = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      createdAt: user.createdAt.toISOString(),
      contentCount: user._count.contents,
      title: user.title,
      bio: user.bio,
      phone: user.phone,
      city: user.city,
      website: user.website,
      commentCount: user._count.comments,
      fileCount: user._count.files,
    };

    return NextResponse.json({ user: detail });
  } catch {
    return NextResponse.json(
      { error: "Kullanıcı bilgileri yüklenemedi." },
      { status: 500 }
    );
  }
}
