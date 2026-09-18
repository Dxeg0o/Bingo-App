import { LETTER_RANGES, columnNumbers } from "@/lib/bingo";
import type { BingoLetter } from "@/lib/types";
import { cn } from "@/lib/utils";

const LETTER_COLORS: Record<BingoLetter, string> = {
  B: "bg-rojo",
  I: "bg-azul",
  N: "bg-verde",
  G: "bg-dorado",
  O: "bg-azul-claro",
};

export function BingoColumn({
  letter,
  drawn,
  lastValue,
  theme,
  compact,
}: {
  letter: BingoLetter;
  drawn: Set<number>;
  lastValue: number | null;
  theme: "light" | "dark";
  compact?: boolean;
}) {
  const numbers = columnNumbers(letter);
  const { min, max } = LETTER_RANGES[letter];

  return (
    <div className="flex min-w-0 flex-col gap-[0.35rem]">
      <div
        className={cn(
          "flex items-center justify-center rounded-lg font-display font-bold text-papel",
          LETTER_COLORS[letter],
          letter === "G" && "text-noche",
          compact ? "h-8 text-xl" : "h-[8%] min-h-10 text-[clamp(1.4rem,2.4vh,2.4rem)]",
        )}
        aria-label={`Columna ${letter}, números ${min} a ${max}`}
      >
        {letter}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-[0.35rem]">
        {numbers.map((value) => {
          const isDrawn = drawn.has(value);
          const isLast = value === lastValue;
          return (
            <div
              key={value}
              data-drawn={isDrawn ? "true" : "false"}
              className={cn(
                "num relative flex flex-1 items-center justify-center rounded-lg border-2 font-bold tabular-nums transition-all duration-300",
                compact
                  ? "min-h-8 text-base"
                  : "min-h-[1.6rem] text-[clamp(0.95rem,2.1vh,2rem)]",
                theme === "dark"
                  ? isDrawn
                    ? "border-crema bg-crema text-noche"
                    : "border-crema/15 bg-white/5 text-crema/45"
                  : isDrawn
                    ? "border-azul bg-azul text-papel"
                    : "border-azul/15 bg-crema/35 text-noche/45",
                isLast &&
                  "border-dorado bg-dorado text-noche ring-4 ring-dorado/45 scale-[1.06] z-10",
              )}
            >
              {value}
              {isDrawn && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute right-0.5 top-0.5 text-[0.55em] leading-none opacity-70",
                    isLast && "opacity-90",
                  )}
                >
                  ✓
                </span>
              )}
              <span className="sr-only">
                {letter}
                {value} {isDrawn ? "sorteado" : "sin salir"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
