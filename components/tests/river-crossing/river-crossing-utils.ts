export const RIVER_CROSSING_BEST_KEY = "turkpdr-river-crossing-best";

export type CharacterId =
  | "baba"
  | "anne"
  | "boy1"
  | "boy2"
  | "girl1"
  | "girl2"
  | "polis"
  | "hirsiz";

export type Shore = "left" | "right";
export type CharacterLocation = Shore | "boat";

export type GameStatus = "idle" | "playing" | "won";

export type RiverCrossingBest = {
  bestTimeMs: number | null;
  bestMoves: number | null;
};

export type RiverCrossingState = {
  positions: Record<CharacterId, CharacterLocation>;
  boatShore: Shore;
  boatPassengers: CharacterId[];
  moves: number;
  startedAt: number | null;
  elapsedMs: number;
  status: GameStatus;
};

export type CharacterMeta = {
  id: CharacterId;
  label: string;
  emoji: string;
  canRow: boolean;
  isFamily: boolean;
};

export const CHARACTERS: CharacterMeta[] = [
  { id: "baba", label: "Baba", emoji: "👨", canRow: true, isFamily: true },
  { id: "anne", label: "Anne", emoji: "👩", canRow: true, isFamily: true },
  { id: "boy1", label: "Erkek Çocuk 1", emoji: "👦", canRow: false, isFamily: true },
  { id: "boy2", label: "Erkek Çocuk 2", emoji: "👦", canRow: false, isFamily: true },
  { id: "girl1", label: "Kız Çocuk 1", emoji: "👧", canRow: false, isFamily: true },
  { id: "girl2", label: "Kız Çocuk 2", emoji: "👧", canRow: false, isFamily: true },
  { id: "polis", label: "Polis", emoji: "👮", canRow: true, isFamily: false },
  { id: "hirsiz", label: "Hırsız", emoji: "🦹", canRow: false, isFamily: false },
];

export const CHARACTER_IDS = CHARACTERS.map((c) => c.id);

export const FAMILY_IDS: CharacterId[] = CHARACTERS.filter((c) => c.isFamily).map(
  (c) => c.id
);

export const ROWER_IDS: CharacterId[] = CHARACTERS.filter((c) => c.canRow).map(
  (c) => c.id
);

export const RULE_VIOLATION_MESSAGE = "Bu hamle kurallara aykırı.";

export function createInitialState(): RiverCrossingState {
  const positions = Object.fromEntries(
    CHARACTER_IDS.map((id) => [id, "left" as CharacterLocation])
  ) as Record<CharacterId, CharacterLocation>;

  return {
    positions,
    boatShore: "left",
    boatPassengers: [],
    moves: 0,
    startedAt: null,
    elapsedMs: 0,
    status: "idle",
  };
}

export function getCharactersOnShore(
  state: RiverCrossingState,
  shore: Shore
): CharacterId[] {
  return CHARACTER_IDS.filter((id) => state.positions[id] === shore);
}

export function getCharactersOnBoat(state: RiverCrossingState): CharacterId[] {
  return [...state.boatPassengers];
}

export function validateShoreRules(onShore: CharacterId[]): string | null {
  const has = (id: CharacterId) => onShore.includes(id);
  const hasGirl = has("girl1") || has("girl2");
  const hasBoy = has("boy1") || has("boy2");

  if (hasGirl && has("baba") && !has("anne")) {
    return "Baba, Anne olmadan kız çocuklarıyla aynı kıyıda kalamaz.";
  }

  if (hasBoy && has("anne") && !has("baba")) {
    return "Anne, Baba olmadan erkek çocuklarıyla aynı kıyıda kalamaz.";
  }

  if (has("hirsiz") && !has("polis")) {
    const familyPresent = FAMILY_IDS.some((id) => has(id));
    if (familyPresent) {
      return "Hırsız, Polis olmadan aile bireyleriyle aynı kıyıda kalamaz.";
    }
  }

  return null;
}

export function validateGameState(state: RiverCrossingState): string | null {
  const leftViolation = validateShoreRules(getCharactersOnShore(state, "left"));
  if (leftViolation) return leftViolation;

  const rightViolation = validateShoreRules(getCharactersOnShore(state, "right"));
  if (rightViolation) return rightViolation;

  return null;
}

export function isGameWon(state: RiverCrossingState): boolean {
  return CHARACTER_IDS.every((id) => state.positions[id] === "right");
}

export function canToggleCharacter(
  state: RiverCrossingState,
  characterId: CharacterId
): boolean {
  if (state.status !== "playing") return false;

  const location = state.positions[characterId];

  if (location === "boat") return true;

  if (location === state.boatShore && state.boatPassengers.length < 2) {
    return true;
  }

  return false;
}

export function toggleCharacterOnBoat(
  state: RiverCrossingState,
  characterId: CharacterId
): { state: RiverCrossingState; error: string | null } {
  if (!canToggleCharacter(state, characterId)) {
    return { state, error: null };
  }

  const next: RiverCrossingState = {
    ...state,
    positions: { ...state.positions },
    boatPassengers: [...state.boatPassengers],
    startedAt: state.startedAt ?? Date.now(),
    status: "playing",
  };

  const location = next.positions[characterId];

  if (location === "boat") {
    next.boatPassengers = next.boatPassengers.filter((id) => id !== characterId);
    next.positions[characterId] = next.boatShore;
  } else {
    next.boatPassengers.push(characterId);
    next.positions[characterId] = "boat";
  }

  const violation = validateGameState(next);
  if (violation) {
    return { state, error: RULE_VIOLATION_MESSAGE };
  }

  return { state: next, error: null };
}

export function canCrossRiver(state: RiverCrossingState): boolean {
  if (state.status !== "playing") return false;
  if (state.boatPassengers.length === 0) return false;
  if (state.boatPassengers.length > 2) return false;
  return state.boatPassengers.some((id) => ROWER_IDS.includes(id));
}

export function crossRiver(
  state: RiverCrossingState
): { state: RiverCrossingState; error: string | null } {
  if (!canCrossRiver(state)) {
    if (state.boatPassengers.length === 0) {
      return { state, error: "Sal boş hareket edemez." };
    }
    return { state, error: "Salı yalnızca Anne, Baba veya Polis kullanabilir." };
  }

  const nextShore: Shore = state.boatShore === "left" ? "right" : "left";
  const next: RiverCrossingState = {
    ...state,
    boatShore: nextShore,
    moves: state.moves + 1,
    startedAt: state.startedAt ?? Date.now(),
    status: "playing",
  };

  const violation = validateGameState(next);
  if (violation) {
    return { state, error: RULE_VIOLATION_MESSAGE };
  }

  if (isGameWon(next)) {
    const elapsedMs =
      (next.startedAt ? Date.now() - next.startedAt : 0) + next.elapsedMs;
    return {
      state: { ...next, status: "won", elapsedMs },
      error: null,
    };
  }

  return { state: next, error: null };
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes} dk ${seconds} sn`;
  }
  return `${seconds} sn`;
}

export function loadBestScores(): RiverCrossingBest {
  if (typeof window === "undefined") {
    return { bestTimeMs: null, bestMoves: null };
  }

  try {
    const raw = window.localStorage.getItem(RIVER_CROSSING_BEST_KEY);
    if (!raw) return { bestTimeMs: null, bestMoves: null };
    const parsed = JSON.parse(raw) as RiverCrossingBest;
    return {
      bestTimeMs:
        typeof parsed.bestTimeMs === "number" ? parsed.bestTimeMs : null,
      bestMoves:
        typeof parsed.bestMoves === "number" ? parsed.bestMoves : null,
    };
  } catch {
    return { bestTimeMs: null, bestMoves: null };
  }
}

export function saveBestScores(
  timeMs: number,
  moves: number
): RiverCrossingBest {
  const current = loadBestScores();
  const next: RiverCrossingBest = {
    bestTimeMs:
      current.bestTimeMs === null
        ? timeMs
        : Math.min(current.bestTimeMs, timeMs),
    bestMoves:
      current.bestMoves === null
        ? moves
        : Math.min(current.bestMoves, moves),
  };

  window.localStorage.setItem(RIVER_CROSSING_BEST_KEY, JSON.stringify(next));
  return next;
}
