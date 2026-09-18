"use client";

import { Star } from "lucide-react";
import { LETTERS } from "@/lib/bingo";
import { isFreeCenter, markKey, type PlayerCard } from "@/lib/card";
import { cn } from "@/lib/utils";

/**
 * El cartón tal como se ve en el celular: cabecera B-I-N-G-O y 25 casillas
 * grandes que se marcan con el dedo. Las marcas son manuales a propósito —
 * el celular no sabe qué números salieron, los pone quien juega.
 */
export function PlayerCardGrid({
  card,
  marks,
  onToggle,
}: {
  card: PlayerCard;
  marks: Set<string>;
  onToggle: (row: number, col: number) => void;
}) {
  return (
    <div className="w-full rounded-3xl border-4 border-dorado bg-papel p-2 shadow-2xl shadow-black/40 sm:p-3">
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {LETTERS.map((letter) => (
          <div
            key={letter}
            className="flex aspect-[5/3] items-center justify-center rounded-xl bg-rojo font-display text-[clamp(1.5rem,9vw,2.75rem)] font-black leading-none text-papel"
          >
            {letter}
          </div>
        ))}

        {card.grid.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            const free = isFreeCenter(card, rowIndex, colIndex);
            const marked = free || marks.has(markKey(rowIndex, colIndex));
            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                type="button"
                disabled={free}
                aria-pressed={free ? undefined : marked}
                aria-label={
                  free
                    ? "Casilla libre"
                    : `${LETTERS[colIndex]} ${value} ${marked ? "marcado" : "sin marcar"}`
                }
                onClick={() => onToggle(rowIndex, colIndex)}
                className={cn(
                  "num relative flex aspect-square items-center justify-center rounded-xl border-2 font-display text-[clamp(1.25rem,7.5vw,2.25rem)] font-black leading-none transition-transform duration-100 active:scale-95",
                  free
                    ? "border-dorado bg-dorado/25 text-azul"
                    : marked
                      ? "border-rojo-oscuro bg-rojo text-papel shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.22)]"
                      : "border-azul/20 bg-crema/50 text-noche",
                )}
              >
                {free ? <Star className="h-[38%] w-[38%] fill-dorado text-azul" /> : value}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
