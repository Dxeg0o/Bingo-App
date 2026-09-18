"use client";

import { useCallback, useEffect, useState } from "react";
import { useGameStore } from "./store";
import type { BingoGameState, DisplayState } from "./types";

/** Carga el estado guardado y engancha la sincronización entre pestañas. */
export function useInitGame() {
  const init = useGameStore((s) => s.init);
  const hydrated = useGameStore((s) => s.hydrated);
  useEffect(() => {
    init();
  }, [init]);
  return hydrated;
}

/**
 * Reloj que vuelve a renderizar en el instante exacto en que cambia el estado
 * de la pantalla (fin de revelado, inicio/fin de repaso) en vez de hacer polling.
 */
export function useNow(nextAt: number | null, tickMs: number | null = null): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!tickMs) return;
    const id = window.setInterval(() => setNow(Date.now()), tickMs);
    return () => window.clearInterval(id);
  }, [tickMs]);

  useEffect(() => {
    if (nextAt === null) return;
    const delay = nextAt - Date.now();
    if (delay <= 0) {
      setNow(Date.now());
      return;
    }
    const id = window.setTimeout(() => setNow(Date.now()), delay + 40);
    return () => window.clearTimeout(id);
  }, [nextAt]);

  return now;
}

export function isRevealActive(game: BingoGameState, now: number): boolean {
  if (!game.reveal) return false;
  return game.reveal.endsAt === null || now < game.reveal.endsAt;
}

export function isReviewActive(game: BingoGameState, now: number): boolean {
  if (!game.review) return false;
  if (now < game.review.startedAt) return false;
  return game.review.endsAt === null || now < game.review.endsAt;
}

export function getDisplayState(game: BingoGameState, now: number): DisplayState {
  if (game.winner) return "WINNER";
  if (isReviewActive(game, now)) return "REVIEW";
  if (game.status === "paused") return "PAUSED";
  if (game.status === "setup" || game.status === "pregame") return "PRE_GAME";
  if (isRevealActive(game, now)) return "NUMBER_REVEAL";
  return "PLAYING";
}

/** Próximo instante en que la pantalla debe cambiar sola. */
export function getNextTransition(game: BingoGameState, now: number): number | null {
  const candidates = [
    game.reveal?.endsAt ?? null,
    game.review?.startedAt ?? null,
    game.review?.endsAt ?? null,
  ].filter((t): t is number => typeof t === "number" && t > now);
  return candidates.length > 0 ? Math.min(...candidates) : null;
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      /* el navegador puede bloquearlo sin gesto del usuario */
    }
  }, []);

  return { isFullscreen, toggle };
}

export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
