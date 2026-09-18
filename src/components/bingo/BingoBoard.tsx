import { LETTERS } from "@/lib/bingo";
import type { BingoNumber } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BingoColumn } from "./BingoColumn";

export function BingoBoard({
  drawnNumbers,
  theme = "light",
  compact = false,
  className,
}: {
  drawnNumbers: BingoNumber[];
  theme?: "light" | "dark";
  compact?: boolean;
  className?: string;
}) {
  const drawn = new Set(drawnNumbers.map((n) => n.value));
  const lastValue =
    drawnNumbers.length > 0 ? drawnNumbers[drawnNumbers.length - 1].value : null;

  return (
    <div
      className={cn("grid min-h-0 grid-cols-5 gap-2", className)}
      role="table"
      aria-label="Tablero de bingo"
    >
      {LETTERS.map((letter) => (
        <BingoColumn
          key={letter}
          letter={letter}
          drawn={drawn}
          lastValue={lastValue}
          theme={theme}
          compact={compact}
        />
      ))}
    </div>
  );
}
