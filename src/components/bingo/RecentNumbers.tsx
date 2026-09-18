import { getRecentNumbers } from "@/lib/bingo";
import type { BingoNumber } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BingoBall } from "./BingoBall";

export function RecentNumbers({
  drawnNumbers,
  count = 6,
  theme = "light",
  size = "md",
  className,
}: {
  drawnNumbers: BingoNumber[];
  count?: number;
  theme?: "light" | "dark";
  size?: "sm" | "md" | "lg";
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
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {recent.map((number, index) => (
        <li key={number.sequence}>
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
