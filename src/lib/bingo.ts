import type { BingoLetter, BingoNumber } from "./types";

export const LETTERS: BingoLetter[] = ["B", "I", "N", "G", "O"];

export const LETTER_RANGES: Record<BingoLetter, { min: number; max: number }> = {
  B: { min: 1, max: 15 },
  I: { min: 16, max: 30 },
  N: { min: 31, max: 45 },
  G: { min: 46, max: 60 },
  O: { min: 61, max: 75 },
};

export const TOTAL_NUMBERS = 75;

export function isValidBingoNumber(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= TOTAL_NUMBERS;
}

export function getBingoLetter(value: number): BingoLetter {
  if (!isValidBingoNumber(value)) {
    throw new Error(`Número de bingo inválido: ${value}`);
  }
  return LETTERS[Math.floor((value - 1) / 15)];
}

/** "N42" */
export function formatBingoNumber(value: number): string {
  return `${getBingoLetter(value)}${value}`;
}

export function columnNumbers(letter: BingoLetter): number[] {
  const { min, max } = LETTER_RANGES[letter];
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}

export function hasNumberBeenDrawn(drawn: BingoNumber[], value: number): boolean {
  return drawn.some((n) => n.value === value);
}

export function findDrawnNumber(
  drawn: BingoNumber[],
  value: number,
): BingoNumber | undefined {
  return drawn.find((n) => n.value === value);
}

export function createBingoNumber(value: number, sequence: number): BingoNumber {
  return {
    value,
    letter: getBingoLetter(value),
    drawnAt: new Date().toISOString(),
    sequence,
  };
}

export function getRecentNumbers(drawn: BingoNumber[], count = 6): BingoNumber[] {
  return drawn.slice(Math.max(0, drawn.length - count)).reverse();
}

export function getSortedDrawnNumbers(drawn: BingoNumber[]): BingoNumber[] {
  return [...drawn].sort((a, b) => a.value - b.value);
}

export function getLastNumber(drawn: BingoNumber[]): BingoNumber | null {
  return drawn.length > 0 ? drawn[drawn.length - 1] : null;
}

/** Reindexa la secuencia tras deshacer o corregir. */
export function resequence(drawn: BingoNumber[]): BingoNumber[] {
  return drawn.map((n, i) => ({ ...n, sequence: i + 1 }));
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Columna (0-4) en la que vive un número dentro del tablero. */
export function letterIndex(letter: BingoLetter): number {
  return LETTERS.indexOf(letter);
}
