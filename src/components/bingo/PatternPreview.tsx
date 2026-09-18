import { LETTERS } from "@/lib/bingo";
import { GRID, previewCells } from "@/lib/patterns";
import type { BingoPattern } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PatternPreview({
  pattern,
  freeCenter = true,
  theme = "light",
  size = "md",
  showLetters = true,
}: {
  pattern: BingoPattern;
  freeCenter?: boolean;
  theme?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  showLetters?: boolean;
}) {
  const cells = previewCells(pattern);
  const cellSize = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-9 w-9" }[size];
  const textSize = { sm: "text-[8px]", md: "text-[10px]", lg: "text-sm" }[size];

  if (!cells) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border-2 border-dashed px-3 py-2 text-center font-bold",
          theme === "dark"
            ? "border-crema/30 text-crema"
            : "border-azul/30 text-azul",
          size === "lg" ? "text-xl" : "text-sm",
        )}
      >
        {pattern.targetCount ?? "?"} números
      </div>
    );
  }

  const isLineFamily = pattern.type === "any-line";

  return (
    <div className="inline-flex flex-col gap-1">
      {showLetters && (
        <div className="flex gap-0.5">
          {LETTERS.map((letter) => (
            <span
              key={letter}
              className={cn(
                "flex items-center justify-center font-bold uppercase tracking-wider",
                cellSize,
                textSize,
                theme === "dark" ? "text-crema/70" : "text-azul/60",
              )}
            >
              {letter}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-0.5" aria-hidden>
        {Array.from({ length: GRID }, (_, row) => (
          <div key={row} className="flex gap-0.5">
            {Array.from({ length: GRID }, (_, col) => {
              const active = cells[row][col];
              const isFree = freeCenter && row === 2 && col === 2;
              return (
                <span
                  key={col}
                  className={cn(
                    "flex items-center justify-center rounded-[3px] border",
                    cellSize,
                    textSize,
                    active
                      ? theme === "dark"
                        ? "border-dorado bg-dorado text-noche"
                        : "border-rojo bg-rojo text-papel"
                      : theme === "dark"
                        ? "border-crema/20 bg-white/5"
                        : "border-azul/20 bg-crema/50",
                    isFree && "font-bold",
                  )}
                >
                  {isFree ? "★" : ""}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <span
        className={cn(
          "text-center text-[10px] font-semibold uppercase tracking-wide",
          theme === "dark" ? "text-crema/60" : "text-noche/55",
        )}
      >
        {isLineFamily
          ? `Cualquier ${pattern.targetCount === 2 ? "2 líneas" : "línea"}`
          : pattern.name}
      </span>
    </div>
  );
}
