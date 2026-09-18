import { LETTERS, LETTER_RANGES, formatBingoNumber } from "./bingo";
import { GRID, allLines } from "./patterns";
import type { BingoPattern, CardGrid, ValidationResult } from "./types";

export function emptyCard(): CardGrid {
  return Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => null));
}

export function isFreeCell(row: number, col: number, freeCenter: boolean): boolean {
  return freeCenter && row === 2 && col === 2;
}

/** Problemas de formato del cartón ingresado (no bloquean, pero se avisan). */
export function checkCardIssues(card: CardGrid, freeCenter: boolean): string[] {
  const issues: string[] = [];
  const seen = new Map<number, number>();
  let empties = 0;

  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (isFreeCell(row, col, freeCenter)) continue;
      const value = card[row][col];
      if (value === null) {
        empties++;
        continue;
      }
      const letter = LETTERS[col];
      const { min, max } = LETTER_RANGES[letter];
      if (value < min || value > max) {
        issues.push(`El ${value} no pertenece a la columna ${letter} (${min}–${max}).`);
      }
      seen.set(value, (seen.get(value) ?? 0) + 1);
    }
  }

  for (const [value, count] of seen) {
    if (count > 1) issues.push(`El número ${value} está repetido en el cartón.`);
  }
  if (empties > 0) {
    issues.push(
      empties === 1
        ? "Falta 1 casilla por completar en el cartón."
        : `Faltan ${empties} casillas por completar en el cartón.`,
    );
  }
  return issues;
}

type Cell = { row: number; col: number };

function missingFrom(card: CardGrid, cells: Cell[]) {
  return cells.map(({ row, col }) => {
    const value = card[row][col] ?? 0;
    return {
      row,
      col,
      value,
      letter: LETTERS[col],
    };
  });
}

function describeMissing(
  missing: { value: number }[],
  fallback: string,
): string {
  const named = missing.filter((m) => m.value > 0);
  if (named.length === 0) return fallback;
  if (named.length <= 3) {
    return `Falta ${named.map((m) => formatBingoNumber(m.value)).join(", ")}`;
  }
  return `Faltan ${named.length} números, entre ellos ${named
    .slice(0, 3)
    .map((m) => formatBingoNumber(m.value))
    .join(", ")}`;
}

export function validateCard(
  card: CardGrid,
  pattern: BingoPattern,
  drawnValues: number[],
  freeCenter: boolean,
): ValidationResult {
  const drawn = new Set(drawnValues);
  const cardIssues = checkCardIssues(card, freeCenter);

  const isMarked = (row: number, col: number): boolean => {
    if (isFreeCell(row, col, freeCenter)) return true;
    const value = card[row][col];
    return value !== null && drawn.has(value);
  };

  if (pattern.type === "first-n") {
    const target = pattern.targetCount ?? 3;
    let current = 0;
    for (let row = 0; row < GRID; row++) {
      for (let col = 0; col < GRID; col++) {
        if (isFreeCell(row, col, freeCenter)) continue;
        if (isMarked(row, col)) current++;
      }
    }
    const valid = current >= target;
    return {
      valid,
      message: valid
        ? `Tiene ${current} números marcados (se necesitan ${target}).`
        : `Solo tiene ${current} de los ${target} números necesarios.`,
      missing: [],
      cardIssues,
      progress: { current, target },
    };
  }

  if (pattern.type === "any-line") {
    const target = pattern.targetCount ?? 1;
    const lines = allLines();
    const complete = lines.filter((line) =>
      line.every(({ row, col }) => isMarked(row, col)),
    );
    const valid = complete.length >= target;
    if (valid) {
      return {
        valid: true,
        message:
          complete.length === 1
            ? "Tiene 1 línea completa."
            : `Tiene ${complete.length} líneas completas.`,
        missing: [],
        cardIssues,
        progress: { current: complete.length, target },
      };
    }
    // La línea más cercana a completarse
    const ranked = lines
      .map((line) => ({
        line,
        pending: line.filter(({ row, col }) => !isMarked(row, col)),
      }))
      .filter((l) => l.pending.length > 0)
      .sort((a, b) => a.pending.length - b.pending.length);
    const closest = ranked[0];
    const missing = closest ? missingFrom(card, closest.pending) : [];
    return {
      valid: false,
      message: `${complete.length} de ${target} líneas completas. ${describeMissing(
        missing,
        "La línea más cercana aún no está completa.",
      )} para completar la línea más cercana.`,
      missing,
      cardIssues,
      progress: { current: complete.length, target },
    };
  }

  const cells = pattern.cells;
  if (!cells) {
    return {
      valid: false,
      message: "Este patrón no tiene casillas definidas.",
      missing: [],
      cardIssues,
    };
  }

  const required: Cell[] = [];
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (cells[row][col]) required.push({ row, col });
    }
  }
  const pending = required.filter(({ row, col }) => !isMarked(row, col));
  const missing = missingFrom(card, pending);
  const valid = pending.length === 0;

  return {
    valid,
    message: valid
      ? `El patrón «${pattern.name}» está completo.`
      : `${describeMissing(missing, `El patrón «${pattern.name}» todavía no está completo.`)}.`,
    missing,
    cardIssues,
    progress: { current: required.length - pending.length, target: required.length },
  };
}
