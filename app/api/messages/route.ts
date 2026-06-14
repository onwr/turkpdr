import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import {
  getConversations,
  getTotalUnreadCount,
  parseConversationFilter,
  sendMessage,
} from "@/lib/queries/messages";
import { notifyNewMessage } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ENTITY_TYPES,
  logActivity,
} from "@/lib/activity-log";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const filter = parseConversationFilter(searchParams.get("filter"));
  const search = searchParams.get("search") ?? "";

  try {
    const [conversations, unreadCount] = await Promise.all([
      getConversations(auth.user.id, { filter, search }),
      getTotalUnreadCount(auth.user.id),
    ]);

    return NextResponse.json({ conversations, unreadCount });
  } catch {
    return NextResponse.json(
      { error: "Konuşmalar yüklenemedi." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  let body: { receiverId?: string; message?: string };
  try {
    body = (await request.json()) as { receiverId?: string; message?: string };
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  const receiverId = body.receiverId?.trim();
  const text = body.message?.trim();

  if (!receiverId) {
    return NextResponse.json(
      { error: "Alıcı kullanıcı belirtilmedi." },
      { status: 400 }
    );
  }

  if (!text) {
    return NextResponse.json(
      { error: "Mesaj içeriği boş olamaz." },
      { status: 400 }
    );
  }

  if (text.length > 2000) {
    return NextResponse.json(
      { error: "Mesaj en fazla 2000 karakter olabilir." },
      { status: 400 }
    );
  }

  if (receiverId === auth.user.id) {
    return NextResponse.json(
      { error: "Kendinize mesaj gönderemezsiniz." },
      { status: 400 }
    );
  }

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { id: true, status: true, name: true },
  });

  if (!receiver || receiver.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Alıcı kullanıcı bulunamadı." },
      { status: 404 }
    );
  }

  try {
    const message = await sendMessage(auth.user.id, receiverId, text);

    void logActivity({
      userId: auth.user.id,
      action: ACTIVITY_ACTIONS.MESSAGE_SENT,
      entityType: ACTIVITY_ENTITY_TYPES.MESSAGE,
      entityId: message.id,
      description: `${receiver.name} kullanıcısına mesaj gönderildi`,
      metadata: { receiverId },
    });

    void notifyNewMessage({
      receiverId,
      senderId: auth.user.id,
      senderName: auth.user.name,
    });

    return NextResponse.json(
      {
        message: {
          id: message.id,
          message: message.message,
          isRead: message.isRead,
          senderId: message.senderId,
          receiverId: message.receiverId,
          createdAt: message.createdAt.toISOString(),
          isMine: true,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Mesaj gönderilemedi." },
      { status: 500 }
    );
  }
}
