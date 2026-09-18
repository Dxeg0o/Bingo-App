"use client";

import { formatTime } from "@/lib/bingo";
import type { BingoNumber } from "@/lib/types";

export function HistoryPanel({ drawnNumbers }: { drawnNumbers: BingoNumber[] }) {
  if (drawnNumbers.length === 0) {
    return (
      <p className="py-6 text-center text-sm italic text-noche/50">
        El historial aparecerá aquí cuando salga el primer número.
      </p>
    );
  }

  const reversed = [...drawnNumbers].reverse();

  return (
    <ol className="flex flex-col gap-1" aria-label="Historial completo de números">
      {reversed.map((number) => (
        <li
          key={`${number.sequence}-${number.value}`}
          className="flex items-center gap-3 rounded-lg border border-azul/12 bg-crema/40 px-3 py-1.5"
        >
          <span className="num w-8 shrink-0 text-right text-xs font-bold text-noche/45">
            #{number.sequence}
          </span>
          <span className="num flex h-9 w-14 items-center justify-center rounded-lg bg-azul text-base font-black text-papel">
            {number.letter}
            {number.value}
          </span>
          <span className="num ml-auto text-xs font-semibold text-noche/50">
            {formatTime(number.drawnAt)}
          </span>
        </li>
      ))}
    </ol>
  );
}
