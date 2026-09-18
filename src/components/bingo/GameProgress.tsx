import { TOTAL_NUMBERS } from "@/lib/bingo";
import { cn } from "@/lib/utils";

export function GameProgress({
  count,
  theme = "light",
  className,
}: {
  count: number;
  theme?: "light" | "dark";
  className?: string;
}) {
  const percent = Math.round((count / TOTAL_NUMBERS) * 100);
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span
          className={cn(
            "num text-sm font-bold",
            theme === "dark" ? "text-crema" : "text-azul",
          )}
        >
          {count} / {TOTAL_NUMBERS}
        </span>
        <span
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.12em]",
            theme === "dark" ? "text-crema/60" : "text-noche/55",
          )}
        >
          números sorteados
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={TOTAL_NUMBERS}
        aria-label="Progreso del sorteo"
        className={cn(
          "h-2.5 w-full overflow-hidden rounded-full",
          theme === "dark" ? "bg-white/12" : "bg-azul/12",
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            theme === "dark" ? "bg-dorado" : "bg-rojo",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
