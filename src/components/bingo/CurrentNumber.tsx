import type { BingoLetter } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Brillo de esfera: la bolita se lee como volumen, no como un círculo plano. */
const ESFERA =
  "radial-gradient(circle at 32% 26%, #fffdf8 0%, #f7ecd6 38%, #ecdcb8 72%, #d9c496 100%)";

const SIZES = {
  display: {
    ball: "w-[min(56vh,52vw)] border-[0.55vh]",
    letter: "text-[min(7vh,6.5vw)] px-[2.2vh] py-[0.2vh]",
    value: "text-[min(30vh,28vw)]",
  },
  panel: {
    ball: "w-[min(30vh,22vw)] border-[0.35vh]",
    letter: "text-[min(3.4vh,2.6vw)] px-[1.3vh] py-[0.1vh]",
    value: "text-[min(16vh,12vw)]",
  },
  control: {
    ball: "w-28 border-2",
    letter: "text-xs px-2",
    value: "text-5xl",
  },
} as const;

/**
 * La bolita que sale de la tómbola. En `display` entra cayendo con un rebote
 * corto; en `panel` se queda quieta como referencia del último número.
 */
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
  const size = SIZES[variant];
  const isDisplay = variant === "display";

  return (
    <div
      key={`${letter}${value}`}
      className={cn("relative flex flex-col items-center justify-center", className)}
    >
      {isDisplay && (
        <span
          aria-hidden
          className="sin-movimiento-ocultar pointer-events-none absolute aspect-square w-[min(56vh,52vw)] rounded-full bg-dorado/30 blur-[3vh] animate-[destello_0.85s_ease-out_forwards]"
        />
      )}

      <div
        className={cn(
          "relative flex aspect-square shrink-0 flex-col items-center justify-center rounded-full border-dorado",
          "shadow-[0_1.5vh_4vh_rgba(0,0,0,0.45)]",
          size.ball,
          isDisplay
            ? "animate-[bolita-cae_0.72s_cubic-bezier(0.2,0.9,0.25,1)]"
            : "animate-[zoom-entrada_0.3s_ease-out]",
        )}
        style={{ background: ESFERA }}
      >
        <span
          className={cn(
            "font-display font-black uppercase leading-none tracking-[0.12em] text-crema",
            "rounded-full bg-noche",
            size.letter,
          )}
          aria-hidden
        >
          {letter}
        </span>
        <span
          className={cn(
            "num font-black leading-[0.82] tracking-tight text-noche",
            size.value,
          )}
          aria-hidden
        >
          {value}
        </span>
      </div>

      {phrase && isDisplay && (
        <span className="mt-[2vh] animate-[subir_0.4s_ease-out_0.45s_backwards] text-center font-display text-[clamp(1.2rem,3.2vh,2.4rem)] italic text-crema/85">
          {phrase}
        </span>
      )}
      <span className="sr-only">{`Número ${letter}${value}`}</span>
    </div>
  );
}
