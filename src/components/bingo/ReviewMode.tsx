import { getSortedDrawnNumbers } from "@/lib/bingo";
import type { BingoNumber, ReviewOrder } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ReviewMode({
  drawnNumbers,
  order,
  className,
}: {
  drawnNumbers: BingoNumber[];
  order: ReviewOrder;
  className?: string;
}) {
  const numbers =
    order === "numeric" ? getSortedDrawnNumbers(drawnNumbers) : drawnNumbers;

  return (
    <div className={cn("flex h-full flex-col items-center justify-center gap-4", className)}>
      <div className="text-center">
        <h2 className="font-display text-[clamp(2.8rem,8vh,5.5rem)] font-black uppercase leading-none text-dorado">
          Repasemos los que han salido
        </h2>
        <p className="text-[clamp(0.9rem,2.2vh,1.6rem)] font-semibold uppercase tracking-[0.2em] text-crema/70">
          {order === "numeric" ? "Orden numérico" : "Orden de sorteo"} ·{" "}
          {numbers.length} números
        </p>
      </div>

      <div className="flex w-full max-w-[95%] flex-wrap items-center justify-center gap-2 px-4">
        {numbers.map((number, index) => (
          <div
            key={`${number.value}-${number.sequence}`}
            style={{ animationDelay: `${Math.min(index * 0.018, 1.2)}s` }}
            className="num flex aspect-square w-[clamp(2.8rem,4.6vw,5rem)] animate-[zoom-entrada_0.26s_ease-out_backwards] items-center justify-center rounded-xl border-2 border-crema/40 bg-crema text-noche"
          >
            <span className="flex flex-col items-center leading-none">
              <span className="text-[0.55em] font-bold uppercase tracking-widest opacity-70">
                {number.letter}
              </span>
              <span className="text-[clamp(1rem,2.8vh,2.1rem)] font-black">
                {number.value}
              </span>
            </span>
          </div>
        ))}
        {numbers.length === 0 && (
          <p className="w-full text-center text-2xl italic text-crema/60">
            Todavía no hay números para repasar.
          </p>
        )}
      </div>
    </div>
  );
}
