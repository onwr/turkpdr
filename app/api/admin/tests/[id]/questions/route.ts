import { NextResponse } from "next/server";

import { requireContentManager } from "@/lib/admin/api-auth";
import { prisma } from "@/lib/prisma";
import type { TestQuestionInput } from "@/types/test-questions";

type RouteContext = { params: Promise<{ id: string }> };

function serializeQuestions(
  questions: {
    id: string;
    text: string;
    sortOrder: number;
    options: {
      id: string;
      text: string;
      score: number;
      sortOrder: number;
    }[];
  }[]
) {
  return questions.map((question) => ({
    id: question.id,
    text: question.text,
    sortOrder: question.sortOrder,
    options: question.options.map((option) => ({
      id: option.id,
      text: option.text,
      score: option.score,
      sortOrder: option.sortOrder,
    })),
  }));
}

function validateQuestions(questions: TestQuestionInput[]): string | null {
  if (!Array.isArray(questions)) {
    return "Sorular geçerli bir liste olmalıdır.";
  }

  for (const [index, question] of questions.entries()) {
    if (!question.text?.trim()) {
      return `${index + 1}. soru metni boş olamaz.`;
    }
    if (!Array.isArray(question.options) || question.options.length < 2) {
      return `${index + 1}. soru için en az 2 şık gereklidir.`;
    }
    for (const [optionIndex, option] of question.options.entries()) {
      if (!option.text?.trim()) {
        return `${index + 1}. sorunun ${optionIndex + 1}. şıkkı boş olamaz.`;
      }
      if (!Number.isInteger(option.score)) {
        return `${index + 1}. sorunun ${optionIndex + 1}. şıkkı için geçerli bir puan girin.`;
      }
    }
  }

  return null;
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  const test = await prisma.test.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      questions: {
        orderBy: { sortOrder: "asc" },
        include: {
          options: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  if (!test) {
    return NextResponse.json({ error: "Test bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({
    test: {
      id: test.id,
      title: test.title,
      slug: test.slug,
    },
    questions: serializeQuestions(test.questions),
  });
}

export async function PUT(request: Request, context: RouteContext) {
  const auth = await requireContentManager();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  let body: { questions?: TestQuestionInput[] };
  try {
    body = (await request.json()) as { questions?: TestQuestionInput[] };
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  const validationError = validateQuestions(body.questions ?? []);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const existing = await prisma.test.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Test bulunamadı." }, { status: 404 });
  }

  const questions = body.questions ?? [];

  await prisma.$transaction(async (tx) => {
    await tx.testQuestion.deleteMany({ where: { testId: id } });

    for (const [questionIndex, question] of questions.entries()) {
      await tx.testQuestion.create({
        data: {
          testId: id,
          text: question.text.trim(),
          sortOrder: question.sortOrder ?? questionIndex,
          options: {
            create: question.options.map((option, optionIndex) => ({
              text: option.text.trim(),
              score: option.score,
              sortOrder: option.sortOrder ?? optionIndex,
            })),
          },
        },
      });
    }

    await tx.test.update({
      where: { id },
      data: { questionCount: questions.length },
    });
  });

  const updated = await prisma.test.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      questions: {
        orderBy: { sortOrder: "asc" },
        include: {
          options: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  return NextResponse.json({
    message: "Test soruları kaydedildi.",
    test: {
      id: updated!.id,
      title: updated!.title,
      slug: updated!.slug,
    },
    questions: serializeQuestions(updated!.questions),
  });
}
