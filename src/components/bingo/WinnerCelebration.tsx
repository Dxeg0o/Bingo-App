"use client";

import { useMemo } from "react";
import { REVELADO, retardo } from "@/lib/reveal";
import type { BingoRound, WinnerState } from "@/lib/types";

const CONFETTI_COLORS = ["#C62828", "#FFFDF8", "#2B5C9C", "#D9A441", "#41644A"];

function Confetti({ pieces = 36 }: { pieces?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        // El confeti arranca junto con el golpe del «¡BINGO!», no antes.
        delay: REVELADO.golpe + Math.random() * 2.5,
        duration: 3 + Math.random() * 2.5,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 8 + Math.random() * 10,
        round: Math.random() > 0.6,
      })),
    [pieces],
  );

  return (
    <div
      aria-hidden
      className="sin-movimiento-ocultar pointer-events-none absolute inset-0 overflow-hidden"
    >
      {items.map((item) => (
        <span
          key={item.id}
          className="absolute top-0 block animate-[caer_linear_infinite]"
          style={{
            left: `${item.left}%`,
            width: item.size,
            height: item.size * (item.round ? 1 : 0.5),
            background: item.color,
            borderRadius: item.round ? "50%" : 2,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Celebración del ganador. Entra por partes: primero la tensión («el veredicto
 * es…»), después el golpe del ¡BINGO! con el confeti y los aplausos, y recién
 * al final el premio y lo que viene.
 */
export function WinnerCelebration({
  winner,
  nextRound,
  nextPatternName,
}: {
  winner: WinnerState;
  /** Ronda que viene al cerrar la celebración; ausente = era la última. */
  nextRound?: BingoRound;
  nextPatternName?: string;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
      <Confetti />

      <div className="escena relative z-10">
        <p
          className="escena-rotulo revelar"
          style={{ animationDelay: retardo(REVELADO.rotulo) }}
        >
          El veredicto es…
        </p>

        <div className="relative flex items-center justify-center">
          <span
            aria-hidden
            className="sin-movimiento-ocultar absolute h-[26vh] w-[26vh] rounded-full bg-dorado/35 animate-[halo_1.2s_ease-out_both]"
            style={{ animationDelay: retardo(REVELADO.golpe) }}
          />
          <h1
            className="escena-titulo relative animate-[veredicto-golpe_0.8s_cubic-bezier(0.2,0.9,0.3,1)_backwards] text-[clamp(4rem,24vh,18rem)] text-dorado drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
            style={{ animationDelay: retardo(REVELADO.golpe) }}
          >
            ¡Bingo!
          </h1>
        </div>

        <p
          className="escena-rotulo revelar text-crema/80"
          style={{ animationDelay: retardo(REVELADO.detalle) }}
        >
          ¡Tenemos ganador!
        </p>

        {winner.winnerName && (
          <p
            className="escena-dato revelar"
            style={{ animationDelay: retardo(REVELADO.detalle) }}
          >
            {winner.winnerName}
          </p>
        )}

        <div
          className="escena-panel revelar border-crema/35 bg-noche/45 backdrop-blur-sm"
          style={{ animationDelay: retardo(REVELADO.cierre) }}
        >
          <p className="escena-rotulo">Premio</p>
          <p className="escena-dato text-[clamp(1.6rem,6vh,4rem)]">{winner.prize}</p>
          <p className="escena-rotulo">
            {winner.roundName} · {winner.patternName}
          </p>
        </div>

        <p
          className="escena-rotulo revelar"
          style={{ animationDelay: retardo(REVELADO.cierre + 0.4) }}
        >
          {nextRound ? (
            <>
              A continuación · {nextRound.name} ·{" "}
              <span className="text-dorado">{nextPatternName}</span> · {nextRound.prize}
            </>
          ) : (
            "Era el último premio de la noche"
          )}
        </p>
      </div>
    </div>
  );
}
