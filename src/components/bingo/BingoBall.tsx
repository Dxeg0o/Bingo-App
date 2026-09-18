import { cn } from "@/lib/utils";
import type { BingoLetter } from "@/lib/types";

const SIZES = {
  sm: "h-12 w-12 text-lg",
  md: "h-16 w-16 text-2xl",
  lg: "h-20 w-20 text-3xl",
} as const;

const LETTER_SIZES = {
  sm: "text-[9px]",
  md: "text-[11px]",
  lg: "text-xs",
} as const;

export function BingoBall({
  value,
  letter,
  size = "md",
  highlighted = false,
  theme = "light",
  className,
}: {
  value: number;
  letter: BingoLetter;
  size?: keyof typeof SIZES;
  highlighted?: boolean;
  theme?: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "num flex shrink-0 flex-col items-center justify-center rounded-full border-2 font-bold",
        SIZES[size],
        "leading-none",
        theme === "dark"
          ? highlighted
            ? "border-dorado bg-dorado text-noche"
            : "border-crema/30 bg-noche/50 text-crema"
          : highlighted
            ? "border-rojo bg-rojo text-papel"
            : "border-azul/25 bg-papel text-azul",
        className,
      )}
      aria-label={`${letter}${value}`}
    >
      <span
        className={cn(
          "font-bold uppercase tracking-[0.18em] opacity-80",
          LETTER_SIZES[size],
          "leading-none",
        )}
        aria-hidden
      >
        {letter}
      </span>
      <span aria-hidden>{value}</span>
    </div>
  );
}
