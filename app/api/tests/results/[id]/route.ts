import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Bu sonucu görüntülemek için giriş yapmalısınız." },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  const result = await prisma.testResult.findUnique({
    where: { id },
    include: {
      test: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  if (!result || result.userId !== user.id) {
    return NextResponse.json({ error: "Sonuç bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({
    result: {
      id: result.id,
      totalScore: result.totalScore,
      maxScore: result.maxScore,
      resultLabel: result.resultLabel,
      resultDescription: result.resultDescription,
      createdAt: result.createdAt.toISOString(),
      testTitle: result.test.title,
      testSlug: result.test.slug,
    },
  });
}
