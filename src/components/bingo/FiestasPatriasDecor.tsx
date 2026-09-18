"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { BingoPattern, GameStatus } from "@/lib/types";
import { PatternPreview } from "./PatternPreview";

export function RamadaFrame({ className, lively = false }: { className?: string; lively?: boolean }) {
  return <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 top-0 h-36 overflow-hidden", className)}><svg viewBox="0 0 1600 210" preserveAspectRatio="none" className="h-full w-full"><path d="M0 0H1600V49C1325 74 1090 20 800 54S268 28 0 61Z" fill="#203f36"/><path d="M0 12C205 58 300 6 493 43S816 8 1011 41S1372 4 1600 42" fill="none" stroke="#41644a" strokeWidth="32"/><path d="M0 16C220 54 345 10 510 44S830 9 1037 43S1384 5 1600 35" fill="none" stroke="#6f8e64" strokeWidth="8" opacity=".72"/><path d="M-20 68C290 36 525 94 801 61S1327 40 1620 72" fill="none" stroke="#f5e8ce" strokeWidth="2" opacity=".55"/>{Array.from({length:25},(_,i)=><path key={i} d={`M${i*68-12} ${64+(i%3)*5}h44l-22 39Z`} fill={["#c62828","#fffdf8","#173f73"][i%3]}/>)}<g transform="translate(38 20)"><rect width="48" height="29" fill="#fffdf8"/><rect width="16" height="15" fill="#173f73"/><path d="M8 4l1.5 4.2H14L10.4 11l1.5 4.2L8 12.7 4.1 15.2 5.6 11 2 8.2h4.5Z" fill="#fffdf8"/><rect y="15" width="48" height="14" fill="#c62828"/></g>{[230,510,1090,1400].map(x=><circle key={x} cx={x} cy="72" r="3.5" fill="#f5e8ce" opacity={lively?".95":".55"}/>)}</svg></div>;
}

export function VolantinChileno({ className, flight = false }: { className?: string; flight?: boolean }) {
  return <svg aria-hidden viewBox="0 0 190 268" className={cn("pointer-events-none", flight && "animate-volantin", className)}><g className="animate-volantin-flotante"><path d="M95 9 166 86 95 165 24 86Z" fill="#fffdf8" stroke="#d9a441" strokeWidth="4"/><path d="M95 9 166 86H95Z" fill="#173f73"/><path d="M95 165 24 86H95Z" fill="#c62828"/><path d="M95 9v156M24 86h142" stroke="#d9a441" strokeWidth="3"/><path d="M95 165c-6 25 14 29 2 48s10 26-2 47" fill="none" stroke="#f5e8ce" strokeWidth="3"/><path d="m83 191 25 7-17 12Zm0 39 25 7-17 12Z" fill="#c62828"/></g></svg>;
}

export function TrompoChileno({ className, spinning = false }: { className?: string; spinning?: boolean }) {
  return <svg aria-hidden viewBox="0 0 105 145" className={cn("pointer-events-none", spinning && "animate-trompo", className)}><path d="M45 8c7-6 13-6 20 0l-5 21H50Z" fill="#e8d6b0" stroke="#6d3e22" strokeWidth="3"/><path d="M23 45Q52 23 82 45l8 40q-16 33-38 39Q30 118 15 85Z" fill="#a96836" stroke="#6d3e22" strokeWidth="3"/><path d="M19 63q33 19 67 0M17 78q35 19 72 0" fill="none" stroke="#c62828" strokeWidth="8"/><path d="M52 124l-5 15h10Z" fill="#aeb5b9" stroke="#f5e8ce" strokeWidth="1"/><path d="M45 29c-13 7-20 15-23 25" fill="none" stroke="#f5e8ce" strokeWidth="3" strokeDasharray="4 3"/></svg>;
}

export function EmboqueChileno({ className, active = false }: { className?: string; active?: boolean }) {
  return <svg aria-hidden viewBox="0 0 130 160" className={cn("pointer-events-none", active && "animate-emboque", className)}><path d="M35 25q30-21 60 0l-9 60q-21 19-42 0Z" fill="#ba7437" stroke="#633d24" strokeWidth="4"/><ellipse cx="65" cy="27" rx="22" ry="8" fill="#0a1c2e" stroke="#f5e8ce" strokeWidth="2"/><path d="M65 88c17 16 22 27 17 48" fill="none" stroke="#e8d6b0" strokeWidth="2.5"/><path d="M78 129v23" stroke="#6d3e22" strokeWidth="7" strokeLinecap="round"/><path d="m78 121-7 13h14Z" fill="#d9a441" stroke="#633d24" strokeWidth="2"/></svg>;
}

/** Cajón de greda, lienza y tejo: rayuela chilena, no luche. */
export function RayuelaChilena({ className }: { className?: string }) {
  return <svg aria-hidden viewBox="0 0 300 150" className={cn("pointer-events-none", className)}><path d="M27 119 73 31h173l30 88Z" fill="#794c2a" stroke="#e8d6b0" strokeWidth="4"/><path d="M42 110 80 43h154l24 67Z" fill="#9b6b43" opacity=".88"/><path d="M63 77h181" stroke="#f5e8ce" strokeWidth="4"/><path d="M65 75h179" stroke="#d9a441" strokeWidth="1.5"/><ellipse cx="143" cy="88" rx="18" ry="8" fill="#aeb5b9" stroke="#f5e8ce" strokeWidth="2"/></svg>;
}

export function CopihueVector({ className }: { className?: string }) {
  return <svg aria-hidden viewBox="0 0 100 150" className={cn("pointer-events-none", className)}><path d="M55 2c-2 42 17 51 3 86" fill="none" stroke="#41644a" strokeWidth="7"/><path d="M53 30c-27-6-31 10-20 22 14-2 20-10 20-22Zm2 28c25-5 30 9 20 22-14-2-19-10-20-22Z" fill="#41644a"/><path d="M43 81q12-12 27 0v24q-13 41-27 0Z" fill="#c62828" stroke="#f5e8ce" strokeWidth="2"/><path d="M50 88v31m8-31v31" stroke="#f5e8ce" strokeWidth="2" opacity=".8"/></svg>;
}

export function PanueloCueca({ className }: { className?: string }) {
  return <svg aria-hidden viewBox="0 0 900 360" preserveAspectRatio="none" className={cn("pointer-events-none animate-panuelo", className)}><path d="M-20 230C120 95 235 360 390 188S635 20 920 132v158C695 185 582 295 420 287S148 180-20 345Z" fill="#fffdf8" opacity=".94"/><path d="M-20 249C123 114 239 378 396 204S635 37 920 149" fill="none" stroke="#d9a441" strokeWidth="5" opacity=".7"/></svg>;
}

export function PatrioticAccents() { return <div aria-hidden className="pointer-events-none absolute inset-0 animate-accentos opacity-0 before:absolute before:left-[18%] before:top-[35%] before:h-2 before:w-20 before:-rotate-25 before:rounded-full before:bg-rojo after:absolute after:right-[18%] after:top-[52%] after:h-2 after:w-16 after:rotate-35 after:rounded-full after:bg-azul"/>; }

export function StableDetail({ roundIndex }: { roundIndex: number }) {
  const detail = roundIndex % 4;
  if (detail === 0) return <VolantinChileno className="absolute right-8 top-8 h-16 w-12 opacity-45"/>;
  if (detail === 1) return <TrompoChileno className="absolute bottom-7 left-7 h-16 w-12 opacity-35"/>;
  if (detail === 2) return <EmboqueChileno className="absolute bottom-5 right-8 h-16 w-12 opacity-35"/>;
  return <CopihueVector className="absolute bottom-6 right-8 h-16 w-12 opacity-45"/>;
}

export function RoundTransition({ pattern, prize, roundIndex, freeCenter }: { pattern: BingoPattern; prize: string; roundIndex: number; freeCenter: boolean }) {
  const companion = roundIndex % 4;
  return <div aria-hidden className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center bg-noche-profundo/75 text-center animate-[aparecer_.25s_ease-out]"><PanueloCueca className="absolute inset-x-0 top-[18%] h-64 w-full"/>{companion===0&&<VolantinChileno flight className="absolute -left-32 top-[19%] h-48 w-36"/>}{companion===1&&<TrompoChileno spinning className="absolute bottom-[9%] right-[11%] h-28 w-20 opacity-80"/>}{companion===2&&<EmboqueChileno active className="absolute bottom-[10%] left-[10%] h-28 w-20 opacity-80"/>}{companion===3&&<RayuelaChilena className="absolute bottom-[8%] right-[8%] w-52 opacity-60"/>}<div className="relative z-10 flex flex-col items-center gap-3"><p className="text-[clamp(.8rem,1.8vh,1.2rem)] font-bold uppercase tracking-[.35em] text-crema/70">Ahora jugamos</p><h2 className="font-display text-[clamp(3rem,10vh,7rem)] font-black uppercase leading-none text-dorado">{pattern.name}</h2><PatternPreview pattern={pattern} freeCenter={freeCenter} theme="dark" size="lg"/><p className="text-[clamp(.8rem,1.8vh,1.2rem)] font-bold uppercase tracking-[.24em] text-crema/65">Premio</p><p className="font-display text-[clamp(1.6rem,4vh,3rem)] font-black text-papel">{prize}</p></div></div>;
}

export function MomentEffects({ status, roundIndex, pattern, prize, freeCenter }: { status: GameStatus; roundIndex: number; pattern: BingoPattern; prize: string; freeCenter: boolean }) {
  const [startToken, setStartToken] = useState(0); const [transition, setTransition] = useState<number | null>(null); const previous = useRef({status,roundIndex}); const mounted = useRef(false);
  useEffect(()=>{ if(!mounted.current){mounted.current=true;return;} if(status==="playing"&&previous.current.status!=="playing") setStartToken(v=>v+1); if(roundIndex!==previous.current.roundIndex){setTransition(roundIndex);const id=window.setTimeout(()=>setTransition(null),2800);previous.current={status,roundIndex};return()=>window.clearTimeout(id);} previous.current={status,roundIndex}; },[status,roundIndex]);
  return <>{startToken>0&&<PanueloCueca key={startToken} className="pointer-events-none fixed inset-x-0 top-[20%] z-30 h-64 w-full"/>}{transition!==null&&<RoundTransition pattern={pattern} prize={prize} roundIndex={transition} freeCenter={freeCenter}/>}</>;
}
