import { cn } from "@/lib/utils";

const COLORS = [
  "var(--color-rojo)",
  "var(--color-papel)",
  "var(--color-azul-claro)",
  "var(--color-dorado)",
  "var(--color-crema)",
];

/** Guirnalda de banderines: decoración discreta, animación muy suave. */
export function Banderines({
  count = 24,
  className,
  animated = true,
}: {
  count?: number;
  className?: string;
  animated?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none relative h-6 w-full overflow-hidden", className)}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-current opacity-30" />
      <div className="flex w-full justify-between px-2">
        {Array.from({ length: count }, (_, i) => (
          <span
            key={i}
            className={cn("block h-5 w-3", animated && "animate-[ondear_5s_ease-in-out_infinite]")}
            style={{
              background: COLORS[i % COLORS.length],
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              animationDelay: `${(i % 6) * 0.22}s`,
              transformOrigin: "top center",
              opacity: 0.9,
            }}
          />
        ))}
      </div>
    </div>
  );
}
