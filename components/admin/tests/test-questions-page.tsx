"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ClipboardList,
  GripVertical,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TestQuestionInput } from "@/types/test-questions";

type TestQuestionsPageProps = {
  testId: string;
};

function createEmptyQuestion(sortOrder: number): TestQuestionInput {
  return {
    text: "",
    sortOrder,
    options: [
      { text: "", score: 0, sortOrder: 0 },
      { text: "", score: 1, sortOrder: 1 },
    ],
  };
}

export function TestQuestionsPage({ testId }: TestQuestionsPageProps) {
  const [testTitle, setTestTitle] = useState("");
  const [testSlug, setTestSlug] = useState("");
  const [questions, setQuestions] = useState<TestQuestionInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadQuestions() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/tests/${testId}/questions`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Sorular yüklenemedi.");
        if (!active) return;

        setTestTitle(data.test.title);
        setTestSlug(data.test.slug);
        setQuestions(
          data.questions.length > 0
            ? data.questions
            : [createEmptyQuestion(0)]
        );
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadQuestions();

    return () => {
      active = false;
    };
  }, [testId]);

  function updateQuestion(
    questionIndex: number,
    patch: Partial<TestQuestionInput>
  ) {
    setQuestions((prev) =>
      prev.map((question, index) =>
        index === questionIndex ? { ...question, ...patch } : question
      )
    );
  }

  function updateOption(
    questionIndex: number,
    optionIndex: number,
    patch: Partial<TestQuestionInput["options"][number]>
  ) {
    setQuestions((prev) =>
      prev.map((question, qIndex) => {
        if (qIndex !== questionIndex) return question;
        return {
          ...question,
          options: question.options.map((option, oIndex) =>
            oIndex === optionIndex ? { ...option, ...patch } : option
          ),
        };
      })
    );
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, createEmptyQuestion(prev.length)]);
  }

  function removeQuestion(questionIndex: number) {
    setQuestions((prev) => {
      if (prev.length <= 1) return prev;
      return prev
        .filter((_, index) => index !== questionIndex)
        .map((question, index) => ({ ...question, sortOrder: index }));
    });
  }

  function addOption(questionIndex: number) {
    setQuestions((prev) =>
      prev.map((question, index) => {
        if (index !== questionIndex) return question;
        return {
          ...question,
          options: [
            ...question.options,
            {
              text: "",
              score: question.options.length,
              sortOrder: question.options.length,
            },
          ],
        };
      })
    );
  }

  function removeOption(questionIndex: number, optionIndex: number) {
    setQuestions((prev) =>
      prev.map((question, qIndex) => {
        if (qIndex !== questionIndex) return question;
        if (question.options.length <= 2) return question;
        return {
          ...question,
          options: question.options
            .filter((_, oIndex) => oIndex !== optionIndex)
            .map((option, index) => ({ ...option, sortOrder: index })),
        };
      })
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = questions.map((question, index) => ({
      ...question,
      sortOrder: index,
      options: question.options.map((option, optionIndex) => ({
        ...option,
        sortOrder: optionIndex,
        score: Number(option.score) || 0,
      })),
    }));

    try {
      const res = await fetch(`/api/admin/tests/${testId}/questions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kayıt başarısız.");

      setQuestions(data.questions);
      setSuccess("Sorular başarıyla kaydedildi.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <Button variant="ghost" size="sm" className="-ml-2" asChild>
              <Link href={`/admin/tests/${testId}/edit`}>
                <ArrowLeft className="size-4" />
                Test Düzenlemeye Dön
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">
              Test Soruları
            </h1>
            {testTitle && (
              <p className="text-sm text-muted-foreground">{testTitle}</p>
            )}
          </div>
          <div className="flex gap-2">
            {testSlug && (
              <Button variant="outline" asChild>
                <Link href={`/test-merkezi/${testSlug}/coz`} target="_blank">
                  Önizle
                </Link>
              </Button>
            )}
            <Button onClick={() => void handleSave()} disabled={saving || loading}>
              <Save className="size-4" />
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {loading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Sorular yükleniyor...
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((question, questionIndex) => (
              <Card key={questionIndex}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="size-4 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-base">
                          Soru {questionIndex + 1}
                        </CardTitle>
                        <CardDescription>
                          Her şık için puan değeri girin.
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => removeQuestion(questionIndex)}
                      disabled={questions.length <= 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`question-${questionIndex}`}>
                      Soru Metni
                    </Label>
                    <Textarea
                      id={`question-${questionIndex}`}
                      value={question.text}
                      onChange={(event) =>
                        updateQuestion(questionIndex, {
                          text: event.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Soru metnini yazın..."
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Şıklar</Label>
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center"
                      >
                        <Input
                          value={option.text}
                          onChange={(event) =>
                            updateOption(questionIndex, optionIndex, {
                              text: event.target.value,
                            })
                          }
                          placeholder={`Şık ${optionIndex + 1}`}
                          className="flex-1"
                        />
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={`score-${questionIndex}-${optionIndex}`}
                            className="whitespace-nowrap text-xs text-muted-foreground"
                          >
                            Puan
                          </Label>
                          <Input
                            id={`score-${questionIndex}-${optionIndex}`}
                            type="number"
                            value={option.score}
                            onChange={(event) =>
                              updateOption(questionIndex, optionIndex, {
                                score: parseInt(event.target.value, 10) || 0,
                              })
                            }
                            className="w-20"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() =>
                              removeOption(questionIndex, optionIndex)
                            }
                            disabled={question.options.length <= 2}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(questionIndex)}
                    >
                      <Plus className="size-4" />
                      Şık Ekle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" onClick={addQuestion} className="w-full">
              <Plus className="size-4" />
              Soru Ekle
            </Button>
          </div>
        )}

        {!loading && questions.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <ClipboardList className="size-10 text-muted-foreground" />
              <p className="text-muted-foreground">
                Henüz soru eklenmemiş. İlk soruyu ekleyerek başlayın.
              </p>
              <Button onClick={addQuestion}>
                <Plus className="size-4" />
                İlk Soruyu Ekle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
