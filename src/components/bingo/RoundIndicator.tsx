import type { BingoPattern, BingoRound } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PatternPreview } from "./PatternPreview";

export function RoundIndicator({
  round,
  pattern,
  index,
  total,
  freeCenter,
  theme = "light",
  size = "md",
  className,
}: {
  round: BingoRound | undefined;
  pattern: BingoPattern;
  index: number;
  total: number;
  freeCenter: boolean;
  theme?: "light" | "dark";
  size?: "md" | "lg";
  className?: string;
}) {
  const dark = theme === "dark";
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "font-semibold uppercase tracking-[0.18em]",
            dark ? "text-crema/65" : "text-noche/55",
            size === "lg" ? "text-base" : "text-[11px]",
          )}
        >
          {round?.name ?? "Ronda"} · {index + 1} de {total}
        </p>
        <p
          className={cn(
            "font-display font-bold",
            dark ? "text-crema" : "text-azul",
            size === "lg" ? "text-[clamp(1.8rem,3.4vw,3.2rem)]" : "text-xl",
            "leading-tight",
          )}
        >
          <span className={cn(dark ? "text-dorado" : "text-rojo")}>Jugamos: </span>
          {pattern.name.toUpperCase()}
        </p>
        <p
          className={cn(
            "font-semibold",
            dark ? "text-crema/85" : "text-noche/75",
            size === "lg" ? "text-[clamp(1rem,1.7vw,1.6rem)]" : "text-sm",
          )}
        >
          Premio: <span className={dark ? "text-papel" : "text-noche"}>{round?.prize}</span>
        </p>
        {round?.description && size === "lg" && (
          <p className={cn("text-sm italic", dark ? "text-crema/60" : "text-noche/55")}>
            {round.description}
          </p>
        )}
      </div>
      <PatternPreview
        pattern={pattern}
        freeCenter={freeCenter}
        theme={theme}
        size={size === "lg" ? "lg" : "md"}
      />
    </div>
  );
}
