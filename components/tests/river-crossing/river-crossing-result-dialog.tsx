"use client";

import { RotateCcw, Trophy } from "lucide-react";

import {
  formatDuration,
  type RiverCrossingBest,
} from "@/components/tests/river-crossing/river-crossing-utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type RiverCrossingResultDialogProps = {
  open: boolean;
  timeMs: number;
  moves: number;
  best: RiverCrossingBest;
  onPlayAgain: () => void;
};

export function RiverCrossingResultDialog({
  open,
  timeMs,
  moves,
  best,
  onPlayAgain,
}: RiverCrossingResultDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-brand-navy">
            <Trophy className="size-5 text-amber-500" />
            Tebrikler!
          </DialogTitle>
          <DialogDescription>
            Tüm karakterleri başarıyla nehrin karşısına geçirdiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="rounded-xl bg-slate-50 p-4 text-center">
            <p className="text-xs text-muted-foreground">Süre</p>
            <p className="mt-1 text-xl font-bold text-brand-navy">
              {formatDuration(timeMs)}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 text-center">
            <p className="text-xs text-muted-foreground">Hamle</p>
            <p className="mt-1 text-xl font-bold text-brand-navy">{moves}</p>
          </div>
          <div className="rounded-xl bg-brand-blue/5 p-4 text-center">
            <p className="text-xs text-muted-foreground">En İyi Süre</p>
            <p className="mt-1 text-lg font-semibold text-brand-blue">
              {best.bestTimeMs !== null
                ? formatDuration(best.bestTimeMs)
                : "—"}
            </p>
          </div>
          <div className="rounded-xl bg-brand-blue/5 p-4 text-center">
            <p className="text-xs text-muted-foreground">En Az Hamle</p>
            <p className="mt-1 text-lg font-semibold text-brand-blue">
              {best.bestMoves !== null ? best.bestMoves : "—"}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            className="w-full rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20"
            onClick={onPlayAgain}
          >
            <RotateCcw className="size-4" />
            Tekrar Oyna
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
