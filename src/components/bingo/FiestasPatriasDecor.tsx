"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { GameStatus } from "@/lib/types";

export function RamadaBackdrop({ variant = "ramada", className }: { variant?: "ramada" | "celebration"; className?: string }) {
  const src = variant === "celebration" ? "/images/celebracion-ramada.png" : "/images/ramada-nocturna.png";
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <Image src={src} alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,28,46,.72),rgba(10,28,46,.14)_35%,rgba(10,28,46,.14)_65%,rgba(10,28,46,.72)),linear-gradient(180deg,rgba(10,28,46,.16),rgba(10,28,46,.62))]" />
    </div>
  );
}

export function Copihue({ className }: { className?: string }) {
  return (
    <Image
      aria-hidden
      src="/images/copihue.png"
      alt=""
      width={1184}
      height={1328}
      className={cn("pointer-events-none select-none", className)}
    />
  );
}

export function Trompo({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 120" className={cn("pointer-events-none animate-trompo", className)}>
      <path d="M50 3 L62 27 L50 41 L38 27 Z" fill="#f5e8ce" stroke="#d9a441" strokeWidth="3" />
      <path d="M27 39 Q50 25 73 39 L82 72 Q50 101 18 72 Z" fill="#c62828" stroke="#f5e8ce" strokeWidth="3" />
      <path d="M23 55 Q50 70 77 55" fill="none" stroke="#173f73" strokeWidth="12" />
      <path d="M50 98 L44 116 H56 Z" fill="#d9a441" />
    </svg>
  );
}

export function Emboque({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 110 130" className={cn("pointer-events-none", className)}>
      <path d="M20 27 Q55 5 90 27 L78 83 Q55 101 32 83 Z" fill="#b7743a" stroke="#f5e8ce" strokeWidth="3" />
      <ellipse cx="55" cy="30" rx="25" ry="9" fill="#0a1c2e" opacity=".8" />
      <path d="M55 94 V126" stroke="#d9a441" strokeWidth="5" strokeLinecap="round" />
      <circle cx="55" cy="88" r="8" fill="#c62828" stroke="#f5e8ce" strokeWidth="2" />
    </svg>
  );
}

export function RayuelaMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 180 80" className={cn("pointer-events-none", className)}>
      <path d="M8 60 L49 20 L90 60 L131 20 L172 60" fill="none" stroke="#f5e8ce" strokeWidth="4" strokeDasharray="5 8" opacity=".65" />
      <circle cx="49" cy="20" r="8" fill="#d9a441" opacity=".9" />
      <circle cx="131" cy="20" r="8" fill="#c62828" opacity=".9" />
    </svg>
  );
}

export function VolantinChileno({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 190 250" className={cn("pointer-events-none animate-volantin", className)}>
      <path d="M95 5 L166 84 L95 164 L24 84 Z" fill="#fffdf8" stroke="#d9a441" strokeWidth="4" />
      <path d="M95 5 L166 84 H95 Z" fill="#173f73" />
      <path d="M95 164 L24 84 H95 Z" fill="#c62828" />
      <path d="M95 5 V164 M24 84 H166" stroke="#d9a441" strokeWidth="3" opacity=".85" />
      <path d="M95 164 C78 186 114 194 96 215 S110 236 95 248" fill="none" stroke="#f5e8ce" strokeWidth="3" />
      <path d="M82 184 l26 7 -18 13 Z M82 218 l26 7 -18 13 Z" fill="#c62828" />
    </svg>
  );
}

export function PanueloCueca({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 900 360" preserveAspectRatio="none" className={cn("pointer-events-none animate-panuelo", className)}>
      <path d="M-20 230 C120 95 235 360 390 188 S635 20 920 132 L920 290 C695 185 582 295 420 287 S148 180 -20 345 Z" fill="#fffdf8" opacity=".93" />
      <path d="M-20 249 C123 114 239 378 396 204 S635 37 920 149" fill="none" stroke="#d9a441" strokeWidth="6" opacity=".78" />
    </svg>
  );
}

export function ZapateoMarks() {
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 animate-zapateo opacity-0">
      <i className="absolute left-3 top-32 h-3 w-20 -rotate-12 rounded-full bg-rojo" />
      <i className="absolute right-2 top-20 h-3 w-16 rotate-35 rounded-full bg-dorado" />
      <i className="absolute bottom-12 right-16 h-3 w-14 -rotate-45 rounded-full bg-crema" />
    </div>
  );
}

export function MomentEffects({ status, roundIndex }: { status: GameStatus; roundIndex: number }) {
  const [startToken, setStartToken] = useState(0);
  const [roundToken, setRoundToken] = useState(0);
  const previous = useRef({ status, roundIndex });
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (status === "playing" && previous.current.status !== "playing") setStartToken((value) => value + 1);
    if (roundIndex !== previous.current.roundIndex) setRoundToken((value) => value + 1);
    previous.current = { status, roundIndex };
  }, [status, roundIndex]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {startToken > 0 && <VolantinChileno key={`start-${startToken}`} className="absolute -left-32 top-[18%] h-44 w-36" />}
      {roundToken > 0 && (
        <>
          <PanueloCueca key={`panuelo-${roundToken}`} className="absolute inset-x-0 top-[22%] h-64 w-full" />
          <VolantinChileno key={`round-${roundToken}`} className="absolute -left-32 top-[30%] h-44 w-36" />
        </>
      )}
    </div>
  );
}
