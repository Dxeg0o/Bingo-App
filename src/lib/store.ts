"use client";

import { create } from "zustand";
import {
  createBingoNumber,
  getBingoLetter,
  hasNumberBeenDrawn,
  isValidBingoNumber,
  resequence,
} from "./bingo";
import { publishState, requestState, subscribe } from "./broadcast";
import {
  DEFAULT_SETTINGS,
  createDemoState,
  createInitialState,
  createRound,
} from "./defaults";
import { getPattern } from "./patterns";
import { getPhrase } from "./phrases";
import { STORAGE_KEY, loadState, saveState } from "./storage";
import type {
  AddNumberResult,
  BingoGameState,
  BingoPattern,
  BingoRound,
  GameSettings,
  PatternCells,
  ReviewOrder,
} from "./types";
import { createCustomPattern } from "./patterns";

type GameStore = {
  game: BingoGameState;
  hydrated: boolean;

  init: () => void;
  adoptRemote: (state: BingoGameState) => void;

  addNumber: (value: number) => AddNumberResult;
  undoLast: () => number | null;
  replaceLast: (value: number) => AddNumberResult;
  dismissReveal: () => void;

  clearNumbers: () => void;
  startGame: () => void;
  backToPregame: () => void;
  togglePause: () => void;

  startReview: (order?: ReviewOrder) => void;
  endReview: () => void;

  goToRound: (index: number) => void;
  advanceRound: () => void;
  previousRound: () => void;
  setRounds: (rounds: BingoRound[]) => void;
  upsertRound: (round: BingoRound) => void;
  removeRound: (id: string) => void;
  moveRound: (id: string, direction: -1 | 1) => void;
  addRound: () => void;
  setCurrentPattern: (patternId: string) => void;

  updateSettings: (partial: Partial<GameSettings>) => void;
  resetSettings: () => void;
  setEventName: (name: string) => void;

  addCustomPattern: (name: string, cells: PatternCells) => BingoPattern;
  removeCustomPattern: (id: string) => void;

  declareWinner: (winnerName?: string) => void;
  endCelebration: () => void;

  startCountdown: (seconds: number) => void;
  cancelCountdown: () => void;

  newGame: () => void;
  loadDemo: () => void;
  applySetup: (input: {
    eventName: string;
    rounds: BingoRound[];
    settings: GameSettings;
  }) => void;
};

let listenersReady = false;

export const useGameStore = create<GameStore>()((set, get) => {
  /** Única vía de escritura: guarda en localStorage y avisa a las otras pestañas. */
  const commit = (updater: (game: BingoGameState) => BingoGameState) => {
    const next = { ...updater(get().game), updatedAt: Date.now() };
    set({ game: next });
    saveState(next);
    publishState(next);
    return next;
  };

  const revealFor = (game: BingoGameState, value: number, sequence: number) => {
    const now = Date.now();
    const duration = game.settings.revealDuration;
    return {
      value,
      letter: getBingoLetter(value),
      sequence,
      startedAt: now,
      endsAt: duration === "manual" ? null : now + duration * 1000,
      phrase: game.settings.hostMode ? getPhrase(value) : undefined,
    };
  };

  return {
    game: createInitialState(),
    hydrated: false,

    init: () => {
      if (typeof window === "undefined") return;
      const stored = loadState();
      if (stored) {
        set({ game: stored, hydrated: true });
      } else {
        set({ hydrated: true });
      }

      if (!listenersReady) {
        listenersReady = true;
        subscribe((message) => {
          if (message.type === "state") {
            get().adoptRemote(message.state);
          } else if (message.type === "request") {
            publishState(get().game);
          }
        });
        window.addEventListener("storage", (event) => {
          if (event.key !== STORAGE_KEY || !event.newValue) return;
          try {
            get().adoptRemote(JSON.parse(event.newValue) as BingoGameState);
          } catch {
            /* ignorar payload corrupto */
          }
        });
        requestState();
      }
    },

    adoptRemote: (state) => {
      if (!state || typeof state !== "object") return;
      if (state.updatedAt < get().game.updatedAt) return;
      set({ game: state, hydrated: true });
    },

    addNumber: (value) => {
      const game = get().game;
      if (!isValidBingoNumber(value)) {
        return {
          ok: false,
          reason: "invalid",
          message: `${value} no es un número válido (1 a 75)`,
        };
      }
      if (game.status === "paused") {
        return {
          ok: false,
          reason: "paused",
          message: "El bingo está en pausa. Reanuda para seguir sorteando.",
        };
      }
      if (hasNumberBeenDrawn(game.drawnNumbers, value)) {
        return {
          ok: false,
          reason: "duplicate",
          message: `El ${value} ya había salido`,
        };
      }

      const number = createBingoNumber(value, game.drawnNumbers.length + 1);
      commit((g) => {
        const drawnNumbers = [...g.drawnNumbers, number];
        const reveal = revealFor(g, value, number.sequence);
        const every = g.settings.autoReviewEvery;
        const shouldReview = !!every && drawnNumbers.length % every === 0;
        const reviewStart = reveal.endsAt ?? Date.now() + 1500;
        return {
          ...g,
          status: "playing" as const,
          drawnNumbers,
          reveal,
          countdown: null,
          // Un número nuevo siempre manda: corta el repaso o la celebración en curso.
          winner: null,
          review: shouldReview
            ? {
                order: g.settings.reviewOrder,
                startedAt: reviewStart,
                endsAt: reviewStart + g.settings.reviewDuration * 1000,
                auto: true,
              }
            : null,
        };
      });
      return { ok: true, number };
    },

    undoLast: () => {
      const game = get().game;
      const last = game.drawnNumbers[game.drawnNumbers.length - 1];
      if (!last) return null;
      commit((g) => ({
        ...g,
        drawnNumbers: resequence(g.drawnNumbers.slice(0, -1)),
        reveal: null,
      }));
      return last.value;
    },

    replaceLast: (value) => {
      const game = get().game;
      const last = game.drawnNumbers[game.drawnNumbers.length - 1];
      if (!last) {
        return {
          ok: false,
          reason: "invalid",
          message: "Todavía no hay números para corregir",
        };
      }
      if (!isValidBingoNumber(value)) {
        return {
          ok: false,
          reason: "invalid",
          message: `${value} no es un número válido (1 a 75)`,
        };
      }
      if (
        value !== last.value &&
        hasNumberBeenDrawn(game.drawnNumbers.slice(0, -1), value)
      ) {
        return { ok: false, reason: "duplicate", message: `El ${value} ya había salido` };
      }

      const replaced = {
        ...last,
        value,
        letter: getBingoLetter(value),
      };
      commit((g) => ({
        ...g,
        drawnNumbers: [...g.drawnNumbers.slice(0, -1), replaced],
        reveal: revealFor(g, value, replaced.sequence),
      }));
      return { ok: true, number: replaced };
    },

    dismissReveal: () => commit((g) => ({ ...g, reveal: null })),

    clearNumbers: () =>
      commit((g) => ({
        ...g,
        drawnNumbers: [],
        reveal: null,
        review: null,
        winner: null,
      })),

    startGame: () =>
      commit((g) => ({
        ...g,
        status: "playing",
        setupCompleted: true,
        countdown: null,
      })),

    backToPregame: () =>
      commit((g) => ({ ...g, status: "pregame", reveal: null, review: null })),

    togglePause: () =>
      commit((g) => ({
        ...g,
        status: g.status === "paused" ? "playing" : "paused",
        reveal: g.status === "paused" ? g.reveal : null,
        review: null,
      })),

    startReview: (order) => {
      const now = Date.now();
      commit((g) => ({
        ...g,
        reveal: null,
        review: {
          order: order ?? g.settings.reviewOrder,
          startedAt: now,
          endsAt: now + g.settings.reviewDuration * 1000,
          auto: false,
        },
      }));
    },

    endReview: () => commit((g) => ({ ...g, review: null })),

    goToRound: (index) =>
      commit((g) => {
        const safeIndex = Math.max(0, Math.min(index, g.rounds.length - 1));
        const round = g.rounds[safeIndex];
        const reset = round?.resetNumbersOnStart ?? false;
        return {
          ...g,
          currentRoundIndex: safeIndex,
          drawnNumbers: reset ? [] : g.drawnNumbers,
          reveal: reset ? null : g.reveal,
          review: null,
          winner: null,
        };
      }),

    advanceRound: () => get().goToRound(get().game.currentRoundIndex + 1),
    previousRound: () => get().goToRound(get().game.currentRoundIndex - 1),

    setRounds: (rounds) =>
      commit((g) => ({
        ...g,
        rounds: rounds.length > 0 ? rounds : [createRound()],
        currentRoundIndex: Math.min(g.currentRoundIndex, Math.max(0, rounds.length - 1)),
      })),

    upsertRound: (round) =>
      commit((g) => ({
        ...g,
        rounds: g.rounds.some((r) => r.id === round.id)
          ? g.rounds.map((r) => (r.id === round.id ? round : r))
          : [...g.rounds, round],
      })),

    removeRound: (id) =>
      commit((g) => {
        const rounds = g.rounds.filter((r) => r.id !== id);
        const safe = rounds.length > 0 ? rounds : [createRound()];
        return {
          ...g,
          rounds: safe,
          currentRoundIndex: Math.min(g.currentRoundIndex, safe.length - 1),
        };
      }),

    moveRound: (id, direction) =>
      commit((g) => {
        const index = g.rounds.findIndex((r) => r.id === id);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= g.rounds.length) return g;
        const rounds = [...g.rounds];
        [rounds[index], rounds[target]] = [rounds[target], rounds[index]];
        return { ...g, rounds };
      }),

    addRound: () =>
      commit((g) => ({
        ...g,
        rounds: [
          ...g.rounds,
          createRound({ name: `Ronda ${g.rounds.length + 1}`, prize: "Premio" }),
        ],
      })),

    setCurrentPattern: (patternId) =>
      commit((g) => ({
        ...g,
        rounds: g.rounds.map((r, i) =>
          i === g.currentRoundIndex ? { ...r, patternId } : r,
        ),
      })),

    updateSettings: (partial) =>
      commit((g) => ({ ...g, settings: { ...g.settings, ...partial } })),

    resetSettings: () => commit((g) => ({ ...g, settings: { ...DEFAULT_SETTINGS } })),

    setEventName: (name) => commit((g) => ({ ...g, eventName: name })),

    addCustomPattern: (name, cells) => {
      const pattern = createCustomPattern(name, cells);
      commit((g) => ({ ...g, customPatterns: [...g.customPatterns, pattern] }));
      return pattern;
    },

    removeCustomPattern: (id) =>
      commit((g) => ({
        ...g,
        customPatterns: g.customPatterns.filter((p) => p.id !== id),
      })),

    declareWinner: (winnerName) =>
      commit((g) => {
        const round = g.rounds[g.currentRoundIndex];
        const pattern = getPattern(round?.patternId ?? "one-line", g.customPatterns);
        return {
          ...g,
          reveal: null,
          review: null,
          winner: {
            prize: round?.prize ?? "Premio",
            roundName: round?.name ?? "Ronda",
            patternName: pattern.name,
            winnerName: winnerName?.trim() || undefined,
            startedAt: Date.now(),
          },
        };
      }),

    endCelebration: () => commit((g) => ({ ...g, winner: null })),

    startCountdown: (seconds) =>
      commit((g) => ({
        ...g,
        status: "pregame",
        countdown: { endsAt: Date.now() + seconds * 1000 },
      })),

    cancelCountdown: () => commit((g) => ({ ...g, countdown: null })),

    newGame: () =>
      commit((g) => ({
        ...g,
        status: "pregame",
        drawnNumbers: [],
        currentRoundIndex: 0,
        reveal: null,
        review: null,
        winner: null,
        countdown: null,
      })),

    loadDemo: () => commit((g) => ({ ...createDemoState(), customPatterns: g.customPatterns })),

    applySetup: ({ eventName, rounds, settings }) =>
      commit((g) => ({
        ...g,
        eventName,
        rounds: rounds.length > 0 ? rounds : [createRound()],
        settings,
        currentRoundIndex: 0,
        drawnNumbers: [],
        status: "pregame",
        setupCompleted: true,
        reveal: null,
        review: null,
        winner: null,
        countdown: null,
      })),
  };
});

export function useGame() {
  return useGameStore((s) => s.game);
}

export function useHydrated() {
  return useGameStore((s) => s.hydrated);
}
