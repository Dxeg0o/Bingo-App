import { Check, Trophy } from "lucide-react";
import { getPattern } from "@/lib/patterns";
import type { BingoGameState } from "@/lib/types";
import { formatCountdown } from "@/lib/utils";
import { PatternPreview } from "./PatternPreview";

/**
 * Pantalla de espera entre rondas. El premio y la modalidad ya cambiaron: aquí
 * el público los ve antes de que el operador dé el vamos.
 */
export function RoundIntermission({
  game,
  countdownLeft,
}: {
  game: BingoGameState;
  countdownLeft: number;
}) {
  const intermission = game.intermission;
  const index = intermission?.nextRoundIndex ?? game.currentRoundIndex;
  const round = game.rounds[index];
  const pattern = getPattern(round?.patternId ?? "one-line", game.customPatterns);

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-[2.5vmin] overflow-hidden text-center">
      {intermission?.finishedRoundName && (
        <p className="flex items-center gap-3 rounded-full border-2 border-dorado/50 bg-dorado/15 px-[2.5vmin] py-[0.8vmin] text-[clamp(0.8rem,2vmin,1.4rem)] font-bold uppercase tracking-[0.2em] text-dorado">
          <Check className="h-[2.4vmin] w-[2.4vmin]" aria-hidden />
          {intermission.finishedRoundName} terminada
        </p>
      )}

      <div>
        <p className="font-display text-[clamp(1rem,3vmin,2rem)] font-bold uppercase tracking-[0.4em] text-crema/60">
          Próxima ronda
        </p>
        <h2 className="font-display text-[clamp(2.5rem,11vmin,8rem)] font-black uppercase leading-[0.9] text-dorado">
          {round?.name ?? "Ronda"}
        </h2>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-[4vmin]">
        <div>
          <p className="text-[clamp(0.7rem,1.6vmin,1.1rem)] font-bold uppercase tracking-[0.25em] text-crema/60">
            Ahora jugamos
          </p>
          <p className="font-display text-[clamp(1.6rem,5.5vmin,3.6rem)] font-black uppercase text-papel">
            {pattern.name}
          </p>
        </div>
        <PatternPreview
          pattern={pattern}
          freeCenter={game.settings.freeCenter}
          theme="dark"
          size="lg"
        />
        <div>
          <p className="text-[clamp(0.7rem,1.6vmin,1.1rem)] font-bold uppercase tracking-[0.25em] text-crema/60">
            Premio
          </p>
          <p className="flex items-center gap-3 font-display text-[clamp(1.6rem,5.5vmin,3.6rem)] font-black text-papel">
            <Trophy className="h-[4vmin] w-[4vmin] shrink-0 text-dorado" aria-hidden />
            {round?.prize}
          </p>
        </div>
      </div>

      {round?.description && (
        <p className="max-w-[70%] font-display text-[clamp(1rem,2.6vmin,1.8rem)] italic text-crema/70">
          {round.description}
        </p>
      )}

      <RoundsTrail game={game} activeIndex={index} />

      {game.countdown && countdownLeft > 0 ? (
        <p className="num text-[clamp(2.5rem,11vmin,7rem)] font-black leading-none text-crema">
          {formatCountdown(countdownLeft)}
        </p>
      ) : (
        <p className="animate-[latido_2.4s_ease-in-out_infinite] font-display text-[clamp(1.2rem,3.6vmin,2.4rem)] italic text-crema/80">
          Seguimos con los mismos {game.drawnNumbers.length} números… ¡no borren sus
          cartones!
        </p>
      )}
    </div>
  );
}

/** Pantalla final: se jugaron todas las rondas. */
export function GameOver({ game }: { game: BingoGameState }) {
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-[3vmin] overflow-hidden text-center">
      <p className="font-display text-[clamp(1rem,3vmin,2rem)] font-bold uppercase tracking-[0.4em] text-crema/60">
        {game.eventName}
      </p>
      <h2 className="font-display text-[clamp(3rem,14vmin,10rem)] font-black uppercase leading-[0.9] text-dorado">
        ¡Se acabó el bingo!
      </h2>
      <p className="font-display text-[clamp(1.2rem,3.6vmin,2.4rem)] italic text-crema/80">
        Gracias por jugar. Estos fueron los premios de la noche:
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-[1.5vmin]">
        {game.rounds.map((round) => (
          <li
            key={round.id}
            className="rounded-2xl border-2 border-crema/25 bg-white/5 px-[2.5vmin] py-[1.2vmin]"
          >
            <p className="text-[clamp(0.6rem,1.4vmin,1rem)] font-bold uppercase tracking-[0.2em] text-crema/55">
              {round.name}
            </p>
            <p className="font-display text-[clamp(1rem,2.8vmin,1.9rem)] font-black text-papel">
              {round.prize}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Recorrido de rondas: qué se jugó, qué viene y qué falta. */
function RoundsTrail({
  game,
  activeIndex,
}: {
  game: BingoGameState;
  activeIndex: number;
}) {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-[1.2vmin]">
      {game.rounds.map((round, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <li
            key={round.id}
            className={[
              "flex items-center gap-2 rounded-full border-2 px-[1.8vmin] py-[0.5vmin] text-[clamp(0.6rem,1.5vmin,1.05rem)] font-bold uppercase tracking-[0.12em]",
              active
                ? "border-dorado bg-dorado text-noche"
                : done
                  ? "border-crema/25 bg-white/5 text-crema/45 line-through"
                  : "border-crema/20 text-crema/60",
            ].join(" ")}
          >
            {done && <Check className="h-[1.6vmin] w-[1.6vmin]" aria-hidden />}
            {round.name}
          </li>
        );
      })}
    </ol>
  );
}
