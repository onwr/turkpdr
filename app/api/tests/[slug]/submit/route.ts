import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPublicTestWhere } from "@/lib/queries/constants";
import {
  calculateMaxScore,
  interpretTestScore,
} from "@/lib/test-scoring";
import type { TestSubmitAnswer } from "@/types/test-questions";

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;

  let body: { answers?: TestSubmitAnswer };
  try {
    body = (await request.json()) as { answers?: TestSubmitAnswer };
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  if (!body.answers || typeof body.answers !== "object") {
    return NextResponse.json(
      { error: "Cevaplar gönderilmelidir." },
      { status: 400 }
    );
  }

  const test = await prisma.test.findFirst({
    where: {
      slug: { equals: slug.trim(), mode: "insensitive" },
      ...getPublicTestWhere(),
    },
    include: {
      questions: {
        orderBy: { sortOrder: "asc" },
        include: {
          options: true,
        },
      },
    },
  });

  if (!test) {
    return NextResponse.json({ error: "Test bulunamadı." }, { status: 404 });
  }

  if (test.questions.length === 0) {
    return NextResponse.json(
      { error: "Bu test için soru bulunmuyor." },
      { status: 400 }
    );
  }

  const answers = body.answers;
  let totalScore = 0;

  for (const question of test.questions) {
    const selectedOptionId = answers[question.id];
    if (!selectedOptionId) {
      return NextResponse.json(
        { error: "Tüm sorular cevaplanmalıdır." },
        { status: 400 }
      );
    }

    const selectedOption = question.options.find(
      (option) => option.id === selectedOptionId
    );

    if (!selectedOption) {
      return NextResponse.json(
        { error: "Geçersiz cevap seçimi." },
        { status: 400 }
      );
    }

    totalScore += selectedOption.score;
  }

  const maxScore = calculateMaxScore(test.questions);
  const interpretation = interpretTestScore(totalScore, maxScore);

  const user = await getCurrentUser();
  let resultId: string | null = null;

  if (user) {
    const result = await prisma.testResult.create({
      data: {
        testId: test.id,
        userId: user.id,
        totalScore,
        maxScore,
        resultLabel: interpretation.resultLabel,
        resultDescription: interpretation.resultDescription,
        answers,
      },
    });
    resultId = result.id;
  }

  return NextResponse.json({
    totalScore,
    maxScore,
    resultLabel: interpretation.resultLabel,
    resultDescription: interpretation.resultDescription,
    resultId,
    testTitle: test.title,
    testSlug: test.slug,
  });
}
