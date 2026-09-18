import { LETTERS, LETTER_RANGES } from "./bingo";
import { GRID } from "./patterns";
import type { CardGrid } from "./types";

/**
 * El cartón que cada persona lleva en su celular. Vive solo en ese navegador:
 * la app no sabe qué cartones hay en la sala, es un extra para jugar sin papel.
 */
export type PlayerCard = {
  id: string;
  grid: CardGrid;
  /** Casilla del centro regalada (la clásica). */
  freeCenter: boolean;
  createdAt: number;
};

/** Marcas manuales: claves "fila-columna" de las casillas pintadas. */
export type CardMarks = string[];

export const CARD_STORAGE_KEY = "bingo-dieciochero:carton:v1";

export function markKey(row: number, col: number): string {
  return `${row}-${col}`;
}

export function isFreeCenter(card: PlayerCard, row: number, col: number): boolean {
  return card.freeCenter && row === 2 && col === 2;
}

/** `count` números distintos del rango de una columna, en orden aleatorio. */
function pickColumn(letter: (typeof LETTERS)[number], count: number): number[] {
  const { min, max } = LETTER_RANGES[letter];
  const pool = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

/** Cartón válido de 75 bolas: 5 números por columna, sin repetidos. */
export function randomCard(freeCenter = true): PlayerCard {
  const columns = LETTERS.map((letter) => pickColumn(letter, GRID));
  const grid: CardGrid = Array.from({ length: GRID }, (_, row) =>
    Array.from({ length: GRID }, (_, col) =>
      freeCenter && row === 2 && col === 2 ? null : columns[col][row],
    ),
  );
  return {
    id: Math.random().toString(36).slice(2, 8).toUpperCase(),
    grid,
    freeCenter,
    createdAt: Date.now(),
  };
}

type StoredCard = { card: PlayerCard; marks: CardMarks };

function looksLikeCard(value: unknown): value is PlayerCard {
  const card = value as PlayerCard | null;
  return (
    !!card &&
    Array.isArray(card.grid) &&
    card.grid.length === GRID &&
    card.grid.every((row) => Array.isArray(row) && row.length === GRID)
  );
}

export function loadCard(): StoredCard | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CARD_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCard;
    if (!parsed || !looksLikeCard(parsed.card)) return null;
    return { card: parsed.card, marks: Array.isArray(parsed.marks) ? parsed.marks : [] };
  } catch {
    return null;
  }
}

export function saveCard(card: PlayerCard, marks: CardMarks): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      CARD_STORAGE_KEY,
      JSON.stringify({ card, marks } satisfies StoredCard),
    );
  } catch {
    // Modo privado o sin espacio: el cartón sigue en pantalla hasta recargar.
  }
}

/**
 * Dirección desde la que el público abre su cartón. Se guarda aparte del juego
 * porque depende de la red donde esté corriendo la app, no de la partida: la
 * escribe el operador en el panel del QR y el proyector la reutiliza.
 */
export const CARD_BASE_URL_KEY = "bingo-dieciochero:carton-base-url:v1";

export function loadCardBaseUrl(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(CARD_BASE_URL_KEY) || window.location.origin;
  } catch {
    return window.location.origin;
  }
}

export function saveCardBaseUrl(value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CARD_BASE_URL_KEY, value);
  } catch {
    /* noop */
  }
}

/** URL final del cartón; el centro libre viaja en la URL porque el celular no ve la configuración. */
export function buildCardUrl(base: string, freeCenter: boolean): string {
  const clean = base.trim().replace(/\/+$/, "");
  if (!clean) return "";
  return `${clean}/carton${freeCenter ? "" : "?libre=0"}`;
}
