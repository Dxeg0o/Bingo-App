import { DEFAULT_SETTINGS, STATE_VERSION, createInitialState } from "./defaults";
import type { BingoGameState } from "./types";

export const STORAGE_KEY = "bingo-dieciochero:state:v1";

export function loadState(): BingoGameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BingoGameState;
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.version !== STATE_VERSION) return null;
    // Rellena campos nuevos si el estado guardado es más antiguo. `settings` se
    // mezcla aparte: un spread superficial dejaría fuera los ajustes nuevos.
    return {
      ...createInitialState(),
      ...parsed,
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    };
  } catch {
    return null;
  }
}

export function saveState(state: BingoGameState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Sin espacio o modo privado: el juego sigue funcionando en memoria.
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

export function hasSavedGame(): boolean {
  return loadState() !== null;
}
