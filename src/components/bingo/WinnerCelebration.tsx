"use client";

import { useEffect, useMemo, useState } from "react";
import type { WinnerState } from "@/lib/types";
import { CopihueVector, PanueloCueca, RamadaFrame, VolantinChileno } from "./FiestasPatriasDecor";

const CONFETTI_COLORS = ["#C62828", "#FFFDF8", "#2B5C9C", "#D9A441", "#41644A"];

function Confetti({ pieces = 36 }: { pieces?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2.5,
        duration: 3 + Math.random() * 2.5,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 8 + Math.random() * 10,
        round: Math.random() > 0.6,
      })),
    [pieces],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
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

export function WinnerCelebration({ winner }: { winner: WinnerState }) {
  const [celebrating, setCelebrating] = useState(true);
  useEffect(() => { const id = window.setTimeout(() => setCelebrating(false), 3800); return () => window.clearTimeout(id); }, []);
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] text-center">
      <RamadaFrame lively={celebrating} />
      {celebrating && <><PanueloCueca className="absolute inset-x-0 top-[20%] h-64 w-full" /><Confetti /><VolantinChileno className="absolute right-[10%] top-[22%] z-10 h-28 w-20" /></>}
      <CopihueVector className="absolute right-[5%] top-[12%] z-10 h-28 w-20 opacity-80" />
      <div className="relative z-10 flex animate-[zoom-entrada_0.45s_cubic-bezier(0.2,0.9,0.3,1)] flex-col items-center gap-3 px-6">
        <p className="text-[clamp(.9rem,2vh,1.4rem)] font-bold uppercase tracking-[.3em] text-crema/80">
          ¡Tenemos ganador!
        </p>
        <h1 className="font-display text-[clamp(5rem,26vh,20rem)] font-black uppercase leading-[0.85] text-dorado drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
          ¡Bingo!
        </h1>
        {winner.winnerName && (
          <p className="font-display text-[clamp(1.6rem,5vh,3.5rem)] font-bold text-papel">
            {winner.winnerName}
          </p>
        )}
        <div className="mt-2 rounded-2xl border-2 border-crema/35 bg-noche/45 px-8 py-4 backdrop-blur-sm">
          <p className="text-[clamp(0.9rem,2vh,1.4rem)] font-semibold uppercase tracking-[0.2em] text-crema/70">
            Premio
          </p>
          <p className="font-display text-[clamp(1.8rem,6vh,4rem)] font-black text-papel">
            {winner.prize}
          </p>
          <p className="text-[clamp(0.8rem,1.8vh,1.2rem)] font-semibold uppercase tracking-[0.18em] text-crema/60">
            {winner.roundName} · {winner.patternName}
          </p>
        </div>
      </div>
    </div>
  );
}
