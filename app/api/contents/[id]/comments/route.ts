import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { getPublishedContentById } from "@/lib/api/content";
import { notifyAuthorNewComment, notifyNewComment } from "@/lib/notifications";
import { DEFAULT_AVATAR } from "@/lib/queries/constants";
import { formatDateTR } from "@/lib/queries/format";
import { prisma } from "@/lib/prisma";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ENTITY_TYPES,
  logActivity,
} from "@/lib/activity-log";

type RouteContext = { params: Promise<{ id: string }> };

function serializeComment(comment: {
  id: string;
  content: string;
  createdAt: Date;
  user: { name: string; avatar: string | null };
}) {
  return {
    id: comment.id,
    author: comment.user.name,
    avatar: comment.user.avatar ?? DEFAULT_AVATAR,
    date: formatDateTR(comment.createdAt),
    content: comment.content,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const content = await getPublishedContentById(id);
  if (!content) {
    return NextResponse.json(
      { error: "İçerik bulunamadı veya yayında değil." },
      { status: 404 }
    );
  }

  const comments = await prisma.comment.findMany({
    where: { postId: id },
    include: {
      user: { select: { name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    comments: comments.map(serializeComment),
    count: comments.length,
  });
}

export async function POST(request: Request, context: RouteContext) {
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

  let body: { content?: string };
  try {
    body = (await request.json()) as { content?: string };
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  const text = body.content?.trim();
  if (!text) {
    return NextResponse.json(
      { error: "Yorum içeriği boş olamaz." },
      { status: 400 }
    );
  }

  if (text.length > 2000) {
    return NextResponse.json(
      { error: "Yorum en fazla 2000 karakter olabilir." },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.create({
    data: {
      content: text,
      userId: auth.user.id,
      postId: id,
    },
    include: {
      user: { select: { name: true, avatar: true } },
    },
  });

  void notifyNewComment({
    authorName: auth.user.name,
    contentTitle: content.title,
    contentSlug: content.slug,
  });

  void notifyAuthorNewComment({
    authorId: content.authorId,
    commenterId: auth.user.id,
    commenterName: auth.user.name,
    contentTitle: content.title,
    contentSlug: content.slug,
    contentType: content.type,
  });

  void logActivity({
    userId: auth.user.id,
    action: ACTIVITY_ACTIONS.COMMENT_ADDED,
    entityType: ACTIVITY_ENTITY_TYPES.COMMENT,
    entityId: comment.id,
    description: `"${content.title}" içeriğine yorum eklendi`,
    metadata: { postId: id },
  });

  return NextResponse.json(
    {
      comment: serializeComment(comment),
      message: "Yorumunuz eklendi.",
    },
    { status: 201 }
  );
}
