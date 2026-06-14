"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ReflexGameStatus = "idle" | "playing" | "gameover";

type ReflexScoreCardProps = {
  elapsed: number;
  bestScore: number;
  status: ReflexGameStatus;
  onStart: () => void;
};

function formatSeconds(value: number): string {
  return `${value.toFixed(1)} sn`;
}

const statusLabels: Record<ReflexGameStatus, string> = {
  idle: "Hazır",
  playing: "Oynanıyor",
  gameover: "Bitti",
};

export function ReflexScoreCard({
  elapsed,
  bestScore,
  status,
  onStart,
}: ReflexScoreCardProps) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm shadow-slate-200/50">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid flex-1 grid-cols-3 gap-3 text-center sm:text-left">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Süre
            </p>
            <p className="mt-1 text-2xl font-bold text-brand-navy">
              {formatSeconds(elapsed)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              En İyi Süre
            </p>
            <p className="mt-1 text-2xl font-bold text-brand-blue">
              {bestScore > 0 ? formatSeconds(bestScore) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Durum
            </p>
            <p
              className={cn(
                "mt-1 text-lg font-semibold",
                status === "playing" && "text-emerald-600",
                status === "gameover" && "text-rose-600",
                status === "idle" && "text-brand-navy"
              )}
            >
              {statusLabels[status]}
            </p>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full shrink-0 rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20 sm:w-auto"
          onClick={onStart}
        >
          {status === "gameover" ? "Tekrar Dene" : "Başlat"}
        </Button>
      </CardContent>
    </Card>
  );
}
