import type { BingoGameState, BingoRound, GameSettings } from "./types";

export const STATE_VERSION = 1;

export const DEFAULT_SETTINGS: GameSettings = {
  revealDuration: 5,
  autoReviewEvery: 10,
  reviewOrder: "draw",
  reviewDuration: 8,
  soundsEnabled: false,
  volume: 0.5,
  freeCenter: true,
  hostMode: false,
  countdownSeconds: null,
  celebrationDuration: 12,
  autoAdvanceOnWin: true,
};

export function createId(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createRound(partial: Partial<BingoRound> = {}): BingoRound {
  return {
    id: createId("ronda"),
    name: "Nueva ronda",
    patternId: "one-line",
    prize: "Premio sorpresa",
    description: "",
    ...partial,
  };
}

export const DEMO_ROUNDS: BingoRound[] = [
  {
    id: "ronda-demo-1",
    name: "Ronda 1",
    patternId: "first-3",
    prize: "Chocolates",
    description: "Para entrar en calor.",
  },
  {
    id: "ronda-demo-2",
    name: "Ronda 2",
    patternId: "one-line",
    prize: "Caja Dieciochera",
    description: "",
  },
  {
    id: "ronda-demo-3",
    name: "Ronda 3",
    patternId: "diagonal-lr",
    prize: "Gift Card $30.000",
    description: "",
  },
  {
    id: "ronda-demo-4",
    name: "Ronda 4",
    patternId: "full-card",
    prize: "Gran Premio",
    description: "El premio mayor de la noche.",
  },
];

export function createInitialState(): BingoGameState {
  return {
    version: STATE_VERSION,
    eventName: "Bingo Dieciochero",
    status: "setup",
    drawnNumbers: [],
    rounds: [createRound({ name: "Ronda 1", patternId: "one-line", prize: "Premio 1" })],
    currentRoundIndex: 0,
    settings: { ...DEFAULT_SETTINGS },
    customPatterns: [],
    reveal: null,
    review: null,
    winner: null,
    intermission: null,
    verification: null,
    countdown: null,
    setupCompleted: false,
    updatedAt: Date.now(),
  };
}

export function createDemoState(): BingoGameState {
  return {
    ...createInitialState(),
    eventName: "Bingo Dieciochero 2026",
    rounds: DEMO_ROUNDS.map((r) => ({ ...r })),
    status: "pregame",
    setupCompleted: true,
    updatedAt: Date.now(),
  };
}
