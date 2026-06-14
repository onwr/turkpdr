import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getPublicTestWhere } from "@/lib/queries/constants";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;

  const test = await prisma.test.findFirst({
    where: {
      slug: { equals: slug.trim(), mode: "insensitive" },
      ...getPublicTestWhere(),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      questions: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          text: true,
          sortOrder: true,
          options: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              text: true,
            },
          },
        },
      },
    },
  });

  if (!test) {
    return NextResponse.json({ error: "Test bulunamadı." }, { status: 404 });
  }

  if (test.questions.length === 0) {
    return NextResponse.json(
      { error: "Bu test için henüz soru eklenmemiş." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    test: {
      id: test.id,
      title: test.title,
      slug: test.slug,
      description: test.description,
      questionCount: test.questions.length,
    },
    questions: test.questions,
  });
}
