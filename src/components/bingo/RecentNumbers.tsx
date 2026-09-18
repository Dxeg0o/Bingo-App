import { getRecentNumbers } from "@/lib/bingo";
import type { BingoNumber } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BingoBall } from "./BingoBall";

/**
 * Tira de las últimas bolitas, de la más nueva a la más vieja. La lista se
 * remonta con cada sorteo (`key` = secuencia más reciente) para que la bolita
 * nueva entre saltando y las anteriores corran un lugar.
 */
export function RecentNumbers({
  drawnNumbers,
  count = 6,
  theme = "light",
  size = "md",
  animated = true,
  className,
}: {
  drawnNumbers: BingoNumber[];
  count?: number;
  theme?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}) {
  const recent = getRecentNumbers(drawnNumbers, count);

  if (recent.length === 0) {
    return (
      <p
        className={cn(
          "text-sm italic",
          theme === "dark" ? "text-crema/50" : "text-noche/45",
          className,
        )}
      >
        Todavía no ha salido ningún número.
      </p>
    );
  }

  return (
    <ul
      key={animated ? recent[0].sequence : "estatico"}
      className={cn(
        "flex min-w-0 flex-nowrap items-center gap-2 overflow-hidden",
        className,
      )}
    >
      {recent.map((number, index) => (
        <li
          key={number.sequence}
          className={cn(
            "shrink-0",
            animated &&
              (index === 0
                ? "animate-[bolita-nueva_0.42s_cubic-bezier(0.2,0.9,0.3,1)]"
                : "animate-[bolita-corre_0.3s_ease-out_backwards]"),
          )}
          style={
            animated && index > 0
              ? { animationDelay: `${Math.min(index * 0.03, 0.18)}s` }
              : undefined
          }
        >
          <BingoBall
            value={number.value}
            letter={number.letter}
            size={index === 0 ? size : size === "lg" ? "md" : "sm"}
            highlighted={index === 0}
            theme={theme}
          />
        </li>
      ))}
    </ul>
  );
}
