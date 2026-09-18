"use client";

import { Maximize2, Minimize2, Pause } from "lucide-react";
import { useEffect, useRef } from "react";
import { getLastNumber } from "@/lib/bingo";
import {
  getDisplayState,
  getNextTransition,
  useFullscreen,
  useNow,
} from "@/lib/hooks";
import { getPattern } from "@/lib/patterns";
import { playSound } from "@/lib/sounds";
import type { BingoGameState } from "@/lib/types";
import { formatCountdown } from "@/lib/utils";
import { RamadaHeader } from "@/components/layout/RamadaHeader";
import { BingoBoard } from "./BingoBoard";
import { CurrentNumber } from "./CurrentNumber";
import { GameProgress } from "./GameProgress";
import { PatternPreview } from "./PatternPreview";
import { RecentNumbers } from "./RecentNumbers";
import { ReviewMode } from "./ReviewMode";
import { WinnerCelebration } from "./WinnerCelebration";
import { Copihue, Emboque, MomentEffects, RamadaBackdrop, RayuelaMark, Trompo } from "./FiestasPatriasDecor";

export function ProjectionScreen({ game }: { game: BingoGameState }) {
  // `Date.now()` se recalcula en cada render y `useNow` agenda el render
  // exacto en que cambia el estado (fin de revelado, inicio/fin de repaso).
  const now = Date.now();
  useNow(getNextTransition(game, now), game.countdown ? 250 : null);
  const displayState = getDisplayState(game, now);
  const { isFullscreen, toggle } = useFullscreen();

  const round = game.rounds[game.currentRoundIndex];
  const pattern = getPattern(round?.patternId ?? "one-line", game.customPatterns);
  const last = getLastNumber(game.drawnNumbers);

  useSounds(game, displayState);

  const countdownLeft = game.countdown ? game.countdown.endsAt - now : 0;

  return (
    <div className="textura-noche flex h-dvh w-full flex-col overflow-hidden text-crema">
      <RamadaHeader className="z-20 shrink-0" />

      {displayState !== "WINNER" && (
        <header className="flex shrink-0 items-center justify-between gap-6 px-6 pb-2 pt-3">
          <div className="min-w-0">
            <h1 className="truncate font-display text-[clamp(1.1rem,2.6vh,2rem)] font-black uppercase tracking-wide text-crema">
              {game.eventName}
            </h1>
            <p className="text-[clamp(0.65rem,1.5vh,1rem)] font-semibold uppercase tracking-[0.25em] text-crema/55">
              {round?.name ?? "Ronda"} · {game.currentRoundIndex + 1} de{" "}
              {game.rounds.length}
            </p>
          </div>

          <div className="flex items-center gap-5 text-right">
            <div className="min-w-0">
              <p className="text-[clamp(0.6rem,1.3vh,0.9rem)] font-bold uppercase tracking-[0.25em] text-dorado">
                Jugamos
              </p>
              <p className="truncate font-display text-[clamp(1.1rem,3vh,2.4rem)] font-black uppercase leading-tight text-crema">
                {pattern.name}
              </p>
              <p className="truncate text-[clamp(0.7rem,1.7vh,1.2rem)] font-semibold text-crema/75">
                Premio: <span className="text-papel">{round?.prize}</span>
              </p>
            </div>
            <PatternPreview
              pattern={pattern}
              freeCenter={game.settings.freeCenter}
              theme="dark"
              size="md"
              showLetters={false}
            />
          </div>
        </header>
      )}

      <main className="relative min-h-0 flex-1 px-6 pb-4">
        <MomentEffects status={game.status} roundIndex={game.currentRoundIndex} />
          {displayState === "PRE_GAME" && (
            <Screen key="pre">
              <RamadaBackdrop className="rounded-[2rem]" />
              <Copihue className="absolute left-[5%] top-[8%] z-10 w-24 -rotate-12 opacity-90 lg:w-36" />
              <Trompo className="absolute bottom-[6%] right-[6%] z-10 w-16 opacity-60 lg:w-24" />
              <Emboque className="absolute bottom-[5%] left-[7%] z-10 w-12 rotate-[-10deg] opacity-50 lg:w-16" />
              <RayuelaMark className="absolute bottom-[8%] left-[15%] z-10 hidden w-28 opacity-45 lg:block" />
              <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 text-center">
                <p className="font-fonda text-[clamp(1.8rem,5vh,3.4rem)] leading-none text-crema">
                  ¡Se juega!
                </p>
                <h2 className="font-display text-[clamp(3rem,13vh,9rem)] font-black uppercase leading-[0.9] text-dorado">
                  {game.eventName}
                </h2>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-8">
                  <div>
                    <p className="text-[clamp(0.7rem,1.6vh,1.1rem)] font-bold uppercase tracking-[0.25em] text-crema/60">
                      Premio de esta ronda
                    </p>
                    <p className="font-display text-[clamp(1.6rem,5vh,3.4rem)] font-black text-papel">
                      {round?.prize}
                    </p>
                  </div>
                  <div className="h-16 w-px bg-crema/25" />
                  <div>
                    <p className="text-[clamp(0.7rem,1.6vh,1.1rem)] font-bold uppercase tracking-[0.25em] text-crema/60">
                      Vamos por
                    </p>
                    <p className="font-display text-[clamp(1.6rem,5vh,3.4rem)] font-black uppercase text-papel">
                      {pattern.name}
                    </p>
                  </div>
                  <PatternPreview
                    pattern={pattern}
                    freeCenter={game.settings.freeCenter}
                    theme="dark"
                    size="lg"
                  />
                </div>

                {game.countdown && countdownLeft > 0 ? (
                  <p className="num mt-4 text-[clamp(3rem,14vh,9rem)] font-black leading-none text-crema">
                    {formatCountdown(countdownLeft)}
                  </p>
                ) : (
                  <p className="mt-6 font-display text-[clamp(1.2rem,4vh,2.6rem)] italic text-crema/75">
                    Preparen sus cartones…
                  </p>
                )}
              </div>
            </Screen>
          )}

          {displayState === "NUMBER_REVEAL" && game.reveal && (
            <Screen key={`reveal-${game.reveal.sequence}-${game.reveal.value}`}>
              <div className="flex h-full flex-col items-center justify-center">
                <CurrentNumber
                  value={game.reveal.value}
                  letter={game.reveal.letter}
                  phrase={game.reveal.phrase}
                />
                <div className="mt-2 w-full max-w-4xl">
                  <RecentNumbers
                    drawnNumbers={game.drawnNumbers.slice(0, -1)}
                    count={6}
                    theme="dark"
                    size="md"
                    className="justify-center"
                  />
                </div>
              </div>
            </Screen>
          )}

          {displayState === "PLAYING" && (
            <Screen key="playing">
              <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] gap-6">
                <div className="flex min-h-0 flex-col justify-between gap-4">
                  <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-crema/20 bg-white/5 p-4">
                    {last ? (
                      <>
                        <p className="text-[clamp(0.7rem,1.6vh,1.1rem)] font-bold uppercase tracking-[0.3em] text-crema/55">
                          Último número
                        </p>
                        <CurrentNumber
                          value={last.value}
                          letter={last.letter}
                          variant="panel"
                        />
                      </>
                    ) : (
                      <p className="text-center font-display text-[clamp(1.2rem,3.5vh,2.4rem)] italic text-crema/60">
                        Esperando el primer número…
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 rounded-3xl border-2 border-crema/20 bg-white/5 p-4">
                    <p className="mb-2 text-[clamp(0.65rem,1.5vh,1rem)] font-bold uppercase tracking-[0.3em] text-crema/55">
                      Últimos números
                    </p>
                    <RecentNumbers
                      drawnNumbers={game.drawnNumbers}
                      count={7}
                      theme="dark"
                      size="lg"
                    />
                    <GameProgress
                      count={game.drawnNumbers.length}
                      theme="dark"
                      className="mt-4"
                    />
                  </div>
                </div>

                <BingoBoard
                  drawnNumbers={game.drawnNumbers}
                  theme="dark"
                  className="h-full"
                />
              </div>
            </Screen>
          )}

          {displayState === "REVIEW" && game.review && (
            <Screen key="review">
              <ReviewMode drawnNumbers={game.drawnNumbers} order={game.review.order} />
            </Screen>
          )}

          {displayState === "PAUSED" && (
            <Screen key="paused">
              <RamadaBackdrop className="rounded-[2rem]" />
              <Trompo className="absolute bottom-[8%] right-[8%] z-10 w-16 opacity-55 lg:w-24" />
              <div className="relative z-10 h-full">
                <div className="pointer-events-none absolute inset-0 opacity-15">
                  <BingoBoard
                    drawnNumbers={game.drawnNumbers}
                    theme="dark"
                    className="h-full"
                  />
                </div>
                <div className="relative flex h-full flex-col items-center justify-center gap-4 text-center">
                  <Pause className="h-[8vh] w-[8vh] text-dorado" aria-hidden />
                  <h2 className="font-display text-[clamp(3rem,14vh,10rem)] font-black uppercase leading-none text-crema">
                    Bingo en pausa
                  </h2>
                  <p className="font-display text-[clamp(1rem,3vh,2rem)] italic text-crema/70">
                    Volvemos en un momento
                  </p>
                </div>
              </div>
            </Screen>
          )}

          {displayState === "WINNER" && game.winner && (
            <Screen key="winner">
              <WinnerCelebration winner={game.winner} />
            </Screen>
          )}
      </main>

      <button
        type="button"
        onClick={toggle}
        aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        className="fixed bottom-3 right-3 z-20 rounded-xl border border-crema/25 bg-noche/70 p-2 text-crema/60 opacity-25 transition-opacity hover:opacity-100 focus-visible:opacity-100"
      >
        {isFullscreen ? (
          <Minimize2 className="h-5 w-5" />
        ) : (
          <Maximize2 className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <section className="absolute inset-0 min-h-0 animate-[aparecer_0.28s_ease-out] px-6 pb-2">
      {children}
    </section>
  );
}

/** Efectos de sonido: solo suenan en la pantalla de proyección. */
function useSounds(game: BingoGameState, displayState: string) {
  const { soundsEnabled, volume } = game.settings;
  const lastSeq = useRef<number | null>(null);
  const lastReview = useRef<number | null>(null);
  const lastWinner = useRef<number | null>(null);
  const lastRound = useRef<number | null>(null);

  useEffect(() => {
    const seq = game.reveal?.sequence ?? null;
    if (seq !== null && seq !== lastSeq.current && soundsEnabled) {
      playSound("number", volume);
    }
    lastSeq.current = seq;
  }, [game.reveal?.sequence, game.reveal?.value, soundsEnabled, volume]);

  useEffect(() => {
    if (displayState !== "REVIEW") return;
    const started = game.review?.startedAt ?? null;
    if (started !== null && started !== lastReview.current) {
      if (soundsEnabled) playSound("review", volume);
      lastReview.current = started;
    }
  }, [displayState, game.review?.startedAt, soundsEnabled, volume]);

  useEffect(() => {
    const started = game.winner?.startedAt ?? null;
    if (started !== null && started !== lastWinner.current) {
      if (soundsEnabled) playSound("winner", volume);
    }
    lastWinner.current = started;
  }, [game.winner?.startedAt, soundsEnabled, volume]);

  useEffect(() => {
    const index = game.currentRoundIndex;
    if (lastRound.current !== null && index !== lastRound.current && soundsEnabled) {
      playSound("round", volume);
    }
    lastRound.current = index;
  }, [game.currentRoundIndex, soundsEnabled, volume]);
}
