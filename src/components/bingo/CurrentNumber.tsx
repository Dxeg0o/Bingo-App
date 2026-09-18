import type { BingoLetter } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CurrentNumber({
  value,
  letter,
  phrase,
  variant = "display",
  className,
}: {
  value: number;
  letter: BingoLetter;
  phrase?: string;
  variant?: "display" | "panel" | "control";
  className?: string;
}) {

  return (
    <div
      key={`${letter}${value}`}
      className={cn(
        "flex animate-[zoom-entrada_0.34s_cubic-bezier(0.2,0.8,0.3,1)] flex-col items-center justify-center",
        className,
      )}
    >
      <span
        className={cn(
          "font-display font-black uppercase",
          variant === "display"
            ? "text-[clamp(4rem,12vh,10rem)] text-dorado"
            : variant === "panel"
              ? "text-[clamp(2.2rem,7vh,5rem)] text-dorado"
              : "text-4xl text-rojo",
          "leading-none",
        )}
      >
        {letter}
      </span>
      <span
        className={cn(
          "num font-black tracking-tight",
          variant === "display"
            ? "text-[clamp(10rem,46vh,34rem)] text-papel drop-shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
            : variant === "panel"
              ? "text-[clamp(6rem,30vh,20rem)] text-papel drop-shadow-[0_6px_20px_rgba(0,0,0,0.4)]"
              : "text-7xl text-azul",
          "leading-[0.85]",
        )}
      >
        {value}
      </span>
      {phrase && variant === "display" && (
        <span className="mt-2 animate-[subir_0.4s_ease-out_0.25s_backwards] font-display text-[clamp(1.2rem,3.2vh,2.4rem)] italic text-crema/85">
          {phrase}
        </span>
      )}
      <span className="sr-only">{`Número ${letter}${value}`}</span>
    </div>
  );
}
