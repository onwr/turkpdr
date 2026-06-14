"use client";

import { AlertTriangle, Printer, RotateCcw } from "lucide-react";

import {
  getSeverityColor,
  getSeverityLabel,
  type Scl90Result,
} from "@/components/tests/scl90r/scl90r-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Scl90rResultViewProps = {
  result: Scl90Result;
  onRetake: () => void;
};

function formatScore(score: number): string {
  return score.toFixed(2);
}

export function Scl90rResultView({ result, onRetake }: Scl90rResultViewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="scl90r-result-print" className="space-y-6 print:space-y-4">
      <Card className="rounded-2xl border-slate-200 shadow-sm shadow-slate-200/50">
        <CardHeader>
          <CardTitle className="text-xl text-brand-navy">
            Genel Semptom İndeksi (GSI)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-4xl font-bold text-brand-blue">
                {formatScore(result.gsi)}
              </p>
              <p
                className={cn(
                  "mt-1 text-sm font-semibold",
                  result.gsiSeverity === "very-high" && "text-rose-600",
                  result.gsiSeverity === "high" && "text-amber-600",
                  result.gsiSeverity === "low" && "text-emerald-600"
                )}
              >
                {getSeverityLabel(result.gsiSeverity)}
              </p>
            </div>
            <div className="flex-1 sm:max-w-md">
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    getSeverityColor(result.gsiSeverity)
                  )}
                  style={{ width: `${Math.min((result.gsi / 4) * 100, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                0–4 ölçeğinde ortalama belirti düzeyi
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {result.subscales.map((scale) => (
          <Card
            key={scale.id}
            className={cn(
              "rounded-2xl border shadow-sm",
              scale.severity !== "low"
                ? "border-amber-200 bg-amber-50/30"
                : "border-slate-200"
            )}
          >
            <CardContent className="space-y-3 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-brand-navy">{scale.name}</p>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                    scale.severity === "very-high" &&
                      "bg-rose-100 text-rose-700",
                    scale.severity === "high" && "bg-amber-100 text-amber-700",
                    scale.severity === "low" &&
                      "bg-emerald-100 text-emerald-700"
                  )}
                >
                  {getSeverityLabel(scale.severity)}
                </span>
              </div>
              <p className="text-2xl font-bold text-brand-blue">
                {formatScore(scale.score)}
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    "h-full rounded-full",
                    getSeverityColor(scale.severity)
                  )}
                  style={{
                    width: `${Math.min((scale.score / 4) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {scale.itemIds.length} madde ortalaması
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-amber-200 bg-amber-50/50">
        <CardContent className="space-y-3 p-4 sm:p-5">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div className="space-y-2 text-sm leading-relaxed text-amber-900">
              <p className="font-semibold">
                Bu test tanı koymaz; sonuçlar yalnızca bilgilendirme amaçlıdır.
              </p>
              <p>
                1.00 ve üzeri değerler yüksek belirti düzeyini, 2.00 ve üzeri
                değerler çok yüksek belirti düzeyini gösterebilir. Kesin
                değerlendirme için bir ruh sağlığı uzmanına başvurun.
              </p>
              {result.highRiskItems.length > 0 && (
                <p>
                  Bazı maddelerde yüksek puan verdiniz (ör. yaşam sonu,
                  kendine zarar veya aşırı korku düşünceleri). Lütfen bir
                  uzmandan destek almayı değerlendirin:{" "}
                  <strong>ALO 182 Psikolojik Destek Hattı</strong>.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3 print:hidden">
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={handlePrint}
        >
          <Printer className="size-4" />
          Sonucu Yazdır
        </Button>
        <Button
          className="rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20"
          onClick={onRetake}
        >
          <RotateCcw className="size-4" />
          Yeniden Çöz
        </Button>
      </div>

      <p className="text-xs text-muted-foreground print:block">
        Tamamlanma:{" "}
        {new Date(result.completedAt).toLocaleString("tr-TR", {
          dateStyle: "long",
          timeStyle: "short",
        })}
      </p>
    </div>
  );
}
