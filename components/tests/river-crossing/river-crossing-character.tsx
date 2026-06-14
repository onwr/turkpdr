"use client";

import type { CharacterMeta } from "@/components/tests/river-crossing/river-crossing-utils";
import { cn } from "@/lib/utils";

type RiverCrossingCharacterProps = {
  character: CharacterMeta;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  compact?: boolean;
};

export function RiverCrossingCharacter({
  character,
  selected = false,
  disabled = false,
  onClick,
  compact = false,
}: RiverCrossingCharacterProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border bg-white text-center shadow-sm transition-all",
        compact ? "min-w-[72px] px-2 py-2" : "min-w-[88px] px-3 py-3",
        selected
          ? "border-brand-blue bg-brand-blue/5 ring-2 ring-brand-blue/30"
          : "border-slate-200 hover:border-brand-blue/40 hover:bg-slate-50",
        disabled && "cursor-not-allowed opacity-50 hover:border-slate-200 hover:bg-white"
      )}
    >
      <span className={cn("leading-none", compact ? "text-2xl" : "text-3xl")}>
        {character.emoji}
      </span>
      <span
        className={cn(
          "mt-1 font-medium text-brand-navy",
          compact ? "text-[10px] leading-tight" : "text-xs"
        )}
      >
        {character.label}
      </span>
    </button>
  );
}
