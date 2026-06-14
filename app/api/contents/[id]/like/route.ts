import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { getPublishedContentById } from "@/lib/api/content";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const content = await getPublishedContentById(id);
  if (!content) {
    return NextResponse.json(
      { error: "İçerik bulunamadı veya yayında değil." },
      { status: 404 }
    );
  }

  const user = await getCurrentUser();

  const [likeCount, existingLike] = await Promise.all([
    prisma.like.count({ where: { postId: id } }),
    user
      ? prisma.like.findUnique({
          where: {
            userId_postId: { userId: user.id, postId: id },
          },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  return NextResponse.json({
    likeCount,
    liked: !!existingLike,
  });
}

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  const content = await getPublishedContentById(id);
  if (!content) {
    return NextResponse.json(
      { error: "İçerik bulunamadı veya yayında değil." },
      { status: 404 }
    );
  }

  const existing = await prisma.like.findUnique({
    where: {
      userId_postId: { userId: auth.user.id, postId: id },
    },
  });

  if (existing) {
    await prisma.like.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.like.create({
      data: { userId: auth.user.id, postId: id },
    });
  }

  const likeCount = await prisma.like.count({ where: { postId: id } });

  return NextResponse.json({
    liked: !existing,
    likeCount,
    message: existing ? "Beğeni kaldırıldı." : "İçerik beğenildi.",
  });
}
