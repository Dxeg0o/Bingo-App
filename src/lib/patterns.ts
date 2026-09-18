import type { BingoPattern, PatternCells } from "./types";

export const GRID = 5;

export function emptyCells(): PatternCells {
  return Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => false));
}

export function buildCells(
  predicate: (row: number, col: number) => boolean,
): PatternCells {
  return Array.from({ length: GRID }, (_, row) =>
    Array.from({ length: GRID }, (_, col) => predicate(row, col)),
  );
}

export function cloneCells(cells: PatternCells): PatternCells {
  return cells.map((row) => [...row]);
}

export function countCells(cells: PatternCells): number {
  return cells.reduce((acc, row) => acc + row.filter(Boolean).length, 0);
}

const ROW_NAMES = ["Primera", "Segunda", "Tercera", "Cuarta", "Quinta"];

export const BUILT_IN_PATTERNS: BingoPattern[] = [
  {
    id: "first-3",
    name: "Primeros 3 números",
    type: "first-n",
    targetCount: 3,
    description: "Los primeros 3 números marcados en el cartón.",
  },
  {
    id: "first-5",
    name: "Primeros 5 números",
    type: "first-n",
    targetCount: 5,
    description: "Los primeros 5 números marcados en el cartón.",
  },
  {
    id: "one-line",
    name: "Una línea",
    type: "any-line",
    targetCount: 1,
    description: "Cualquier fila, columna o diagonal completa.",
  },
  {
    id: "two-lines",
    name: "Dos líneas",
    type: "any-line",
    targetCount: 2,
    description: "Dos líneas completas (filas, columnas o diagonales).",
  },
  ...ROW_NAMES.map((name, index) => ({
    id: `row-${index + 1}`,
    name: `${name} fila`,
    type: "row" as const,
    cells: buildCells((row) => row === index),
  })),
  {
    id: "column-first",
    name: "Primera columna (B)",
    type: "column",
    cells: buildCells((_row, col) => col === 0),
  },
  {
    id: "column-last",
    name: "Última columna (O)",
    type: "column",
    cells: buildCells((_row, col) => col === GRID - 1),
  },
  {
    id: "diagonal-lr",
    name: "Diagonal izquierda → derecha",
    type: "diagonal",
    cells: buildCells((row, col) => row === col),
  },
  {
    id: "diagonal-rl",
    name: "Diagonal derecha → izquierda",
    type: "diagonal",
    cells: buildCells((row, col) => row + col === GRID - 1),
  },
  {
    id: "x",
    name: "X",
    type: "x",
    cells: buildCells((row, col) => row === col || row + col === GRID - 1),
  },
  {
    id: "corners",
    name: "Cuatro esquinas",
    type: "corners",
    cells: buildCells(
      (row, col) => (row === 0 || row === GRID - 1) && (col === 0 || col === GRID - 1),
    ),
  },
  {
    id: "center",
    name: "Centro",
    type: "center",
    cells: buildCells((row, col) => row >= 1 && row <= 3 && col >= 1 && col <= 3),
    description: "El cuadrado central de 3x3.",
  },
  {
    id: "frame",
    name: "Marco",
    type: "frame",
    cells: buildCells(
      (row, col) => row === 0 || row === GRID - 1 || col === 0 || col === GRID - 1,
    ),
  },
  {
    id: "full-card",
    name: "Cartón lleno",
    type: "full-card",
    cells: buildCells(() => true),
  },
];

export function getAllPatterns(custom: BingoPattern[]): BingoPattern[] {
  return [...BUILT_IN_PATTERNS, ...custom];
}

export function getPattern(
  patternId: string,
  custom: BingoPattern[] = [],
): BingoPattern {
  return (
    getAllPatterns(custom).find((p) => p.id === patternId) ?? BUILT_IN_PATTERNS[2]
  );
}

/** Líneas posibles del cartón: 5 filas, 5 columnas y 2 diagonales. */
export function allLines(): { row: number; col: number }[][] {
  const lines: { row: number; col: number }[][] = [];
  for (let row = 0; row < GRID; row++) {
    lines.push(Array.from({ length: GRID }, (_, col) => ({ row, col })));
  }
  for (let col = 0; col < GRID; col++) {
    lines.push(Array.from({ length: GRID }, (_, row) => ({ row, col })));
  }
  lines.push(Array.from({ length: GRID }, (_, i) => ({ row: i, col: i })));
  lines.push(Array.from({ length: GRID }, (_, i) => ({ row: i, col: GRID - 1 - i })));
  return lines;
}

export function createCustomPattern(name: string, cells: PatternCells): BingoPattern {
  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    type: "custom",
    cells: cloneCells(cells),
  };
}

/** Vista previa esquemática para patrones sin celdas fijas. */
export function previewCells(pattern: BingoPattern): PatternCells | null {
  if (pattern.cells) return pattern.cells;
  if (pattern.type === "any-line") {
    return buildCells((row) => row === 2);
  }
  return null;
}
