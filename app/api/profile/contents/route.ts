import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import {
  generateUniqueSlug,
  validateContentInput,
} from "@/lib/admin/content-utils";
import { notifyPendingContent } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

type ShareContentBody = {
  title?: string;
  summary?: string | null;
  content?: string | null;
  categoryId?: string | null;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Paylaşım yapmak için giriş yapmalısınız." },
      { status: 401 }
    );
  }

  let body: ShareContentBody;
  try {
    body = (await request.json()) as ShareContentBody;
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  const validationError = validateContentInput(body, true);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  if (!body.content?.trim()) {
    return NextResponse.json(
      { error: "İçerik metni zorunludur." },
      { status: 400 }
    );
  }

  const slug = await generateUniqueSlug(body.title!.trim());

  const content = await prisma.content.create({
    data: {
      title: body.title!.trim(),
      slug,
      summary: body.summary?.trim() || null,
      content: body.content.trim(),
      type: "ARTICLE",
      status: "PENDING",
      authorId: user.id,
      categoryId: body.categoryId || null,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
    },
  });

  void notifyPendingContent({
    title: content.title,
    contentId: content.id,
  });

  return NextResponse.json(
    {
      message: "Paylaşımınız onay için gönderildi.",
      content,
    },
    { status: 201 }
  );
}
