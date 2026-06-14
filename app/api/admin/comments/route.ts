import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireContentManager } from "@/lib/admin/api-auth";
import {
  buildPaginationMeta,
  parsePagination,
} from "@/lib/admin/pagination";
import { prisma } from "@/lib/prisma";
import type { AdminCommentItem } from "@/types/admin";

function serializeComment(comment: {
  id: string;
  content: string;
  createdAt: Date;
  user: { id: string; name: string; email: string; avatar: string | null };
  post: { id: string; title: string; slug: string; type: AdminCommentItem["post"]["type"] };
}): AdminCommentItem {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    user: comment.user,
    post: comment.post,
  };
}

export async function GET(request: Request) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);
  const search = searchParams.get("search")?.trim();
  const postId = searchParams.get("postId")?.trim();

  const where: Prisma.CommentWhereInput = {};

  if (search) {
    where.OR = [
      { content: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { post: { title: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (postId) {
    where.postId = postId;
  }

  try {
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          post: {
            select: { id: true, title: true, slug: true, type: true },
          },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return NextResponse.json({
      comments: comments.map(serializeComment),
      ...meta,
    });
  } catch {
    return NextResponse.json(
      { error: "Yorumlar yüklenemedi." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  let body: { ids?: string[] };
  try {
    body = (await request.json()) as { ids?: string[] };
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  if (!body.ids?.length) {
    return NextResponse.json(
      { error: "Silinecek yorum seçilmedi." },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.comment.deleteMany({
      where: { id: { in: body.ids } },
    });

    return NextResponse.json({
      deleted: result.count,
      message: `${result.count} yorum silindi.`,
    });
  } catch {
    return NextResponse.json(
      { error: "Yorumlar silinemedi. İlişkili kayıtlar olabilir." },
      { status: 500 }
    );
  }
}
