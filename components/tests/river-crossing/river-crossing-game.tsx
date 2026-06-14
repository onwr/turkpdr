"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ArrowLeftRight, Play, RotateCcw } from "lucide-react";

import { RiverCrossingCharacter } from "@/components/tests/river-crossing/river-crossing-character";
import { RiverCrossingResultDialog } from "@/components/tests/river-crossing/river-crossing-result-dialog";
import {
  canCrossRiver,
  canToggleCharacter,
  CHARACTERS,
  createInitialState,
  crossRiver,
  formatDuration,
  loadBestScores,
  saveBestScores,
  toggleCharacterOnBoat,
  type CharacterId,
  type RiverCrossingBest,
  type RiverCrossingState,
} from "@/components/tests/river-crossing/river-crossing-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function getElapsedMs(state: RiverCrossingState, now: number): number {
  if (!state.startedAt) return 0;
  return state.elapsedMs + (now - state.startedAt);
}

export function RiverCrossingGame() {
  const [state, setState] = useState<RiverCrossingState>(createInitialState);
  const [error, setError] = useState<string | null>(null);
  const [best, setBest] = useState<RiverCrossingBest>(loadBestScores);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (state.status !== "playing" || !state.startedAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [state.status, state.startedAt]);

  const elapsedMs = getElapsedMs(state, now);

  const handleStart = useCallback(() => {
    setState({
      ...createInitialState(),
      status: "playing",
      startedAt: Date.now(),
    });
    setError(null);
    setNow(Date.now());
  }, []);

  const handleReset = useCallback(() => {
    setState(createInitialState());
    setError(null);
    setNow(Date.now());
  }, []);

  const handlePlayAgain = useCallback(() => {
    handleStart();
  }, [handleStart]);

  const handleCharacterClick = useCallback(
    (characterId: CharacterId) => {
      if (state.status === "idle") {
        handleStart();
        const started = {
          ...createInitialState(),
          status: "playing" as const,
          startedAt: Date.now(),
        };
        const result = toggleCharacterOnBoat(started, characterId);
        if (result.error) {
          setError(result.error);
          setState(started);
          return;
        }
        setError(null);
        setState(result.state);
        setNow(Date.now());
        return;
      }

      if (state.status !== "playing") return;

      const result = toggleCharacterOnBoat(state, characterId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      setState(result.state);
    },
    [handleStart, state]
  );

  const handleCross = useCallback(() => {
    if (state.status === "idle") {
      setError("Önce oyunu başlatın.");
      return;
    }
    if (state.status !== "playing") return;

    const result = crossRiver(state);
    if (result.error) {
      setError(result.error);
      return;
    }

    setError(null);
    let next = result.state;

    if (next.status === "won") {
      const finalElapsed = getElapsedMs(next, Date.now());
      next = { ...next, elapsedMs: finalElapsed, startedAt: null };
      const updatedBest = saveBestScores(finalElapsed, next.moves);
      setBest(updatedBest);
    }

    setState(next);
    setNow(Date.now());
  }, [state]);

  const leftCharacters = CHARACTERS.filter(
    (c) => state.positions[c.id] === "left"
  );
  const rightCharacters = CHARACTERS.filter(
    (c) => state.positions[c.id] === "right"
  );
  const boatCharacters = CHARACTERS.filter((c) =>
    state.boatPassengers.includes(c.id)
  );

  const isPlaying = state.status === "playing";
  const canCross = isPlaying && canCrossRiver(state);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <span className="text-muted-foreground">Süre: </span>
            <span className="font-semibold text-brand-navy">
              {formatDuration(elapsedMs)}
            </span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <span className="text-muted-foreground">Hamle: </span>
            <span className="font-semibold text-brand-navy">{state.moves}</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <span className="text-muted-foreground">En İyi: </span>
            <span className="font-semibold text-brand-blue">
              {best.bestTimeMs !== null
                ? formatDuration(best.bestTimeMs)
                : "—"}{" "}
              / {best.bestMoves !== null ? `${best.bestMoves} hamle` : "—"}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {state.status === "idle" ? (
            <Button
              className="rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20"
              onClick={handleStart}
            >
              <Play className="size-4" />
              Başlat
            </Button>
          ) : null}
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={handleReset}
          >
            <RotateCcw className="size-4" />
            Sıfırla
          </Button>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm shadow-slate-200/50">
        <CardContent className="p-3 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,1.2fr)_1fr] lg:gap-6">
            <ShorePanel
              title="Sol Kıyı"
              characters={leftCharacters}
              state={state}
              onCharacterClick={handleCharacterClick}
            />

            <div className="relative flex min-h-[220px] flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-sky-100 via-sky-200 to-sky-300 px-3 py-6 sm:min-h-[280px]">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-sky-700/80">
                Nehir
              </p>

              <div
                className={cn(
                  "flex w-full max-w-xs flex-col items-center gap-3 transition-all duration-300",
                  state.boatShore === "left"
                    ? "self-start pl-2 sm:pl-4"
                    : "self-end pr-2 sm:pr-4"
                )}
              >
                <div className="relative w-full max-w-[200px] rounded-2xl border-2 border-amber-700/60 bg-amber-600/90 px-3 py-4 shadow-lg">
                  <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wide text-amber-100">
                    Sal ({state.boatPassengers.length}/2)
                  </p>
                  <div className="flex min-h-[72px] flex-wrap items-center justify-center gap-2">
                    {boatCharacters.length === 0 ? (
                      <span className="text-xs text-amber-100/70">Boş</span>
                    ) : (
                      boatCharacters.map((character) => (
                        <RiverCrossingCharacter
                          key={character.id}
                          character={character}
                          selected
                          compact
                          onClick={() => handleCharacterClick(character.id)}
                        />
                      ))
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCross}
                  disabled={!canCross}
                  aria-label="Karşıya Geçir"
                  className={cn(
                    "flex size-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30 transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300 disabled:shadow-none sm:size-16",
                    canCross && "animate-pulse"
                  )}
                >
                  <ArrowLeftRight className="size-6" />
                </button>
                <span className="text-xs font-medium text-sky-900">
                  Karşıya Geçir
                </span>
              </div>
            </div>

            <ShorePanel
              title="Sağ Kıyı"
              characters={rightCharacters}
              state={state}
              onCharacterClick={handleCharacterClick}
            />
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Karakterlere dokunarak sala binin veya inin. Salı yalnızca Anne, Baba
        veya Polis karşıya geçirebilir.
      </p>

      <RiverCrossingResultDialog
        open={state.status === "won"}
        timeMs={state.elapsedMs}
        moves={state.moves}
        best={best}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
}

type ShorePanelProps = {
  title: string;
  characters: (typeof CHARACTERS)[number][];
  state: RiverCrossingState;
  onCharacterClick: (id: CharacterId) => void;
};

function ShorePanel({
  title,
  characters,
  state,
  onCharacterClick,
}: ShorePanelProps) {
  return (
    <Card className="rounded-2xl border-slate-200 bg-slate-50/80 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-sm font-semibold text-brand-navy">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex min-h-[120px] flex-wrap items-start justify-center gap-2 sm:min-h-[160px] sm:gap-3">
          {characters.length === 0 ? (
            <span className="py-8 text-xs text-muted-foreground">Boş</span>
          ) : (
            characters.map((character) => (
              <RiverCrossingCharacter
                key={character.id}
                character={character}
                compact
                disabled={
                  state.status === "won" ||
                  !canToggleCharacter(state, character.id)
                }
                onClick={() => onCharacterClick(character.id)}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
