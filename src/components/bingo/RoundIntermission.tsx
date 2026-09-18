import { Check, PartyPopper, Trophy } from "lucide-react";
import { getPattern } from "@/lib/patterns";
import type { BingoGameState } from "@/lib/types";
import { formatCountdown } from "@/lib/utils";
import { PatternPreview } from "./PatternPreview";

/**
 * Pantalla de espera entre rondas. El premio y la modalidad ya cambiaron: aquí
 * el público los ve antes de que el operador dé el vamos. La escala y el ritmo
 * vertical vienen de las clases `.escena*` (globals.css), iguales para todas
 * las pantallas a pantalla completa.
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
    <div className="escena">
      {intermission?.finishedRoundName && (
        <p className="escena-pastilla border-dorado/50 bg-dorado/15 text-dorado">
          <Check className="h-[2vh] w-[2vh] shrink-0" aria-hidden />
          {intermission.finishedRoundName} terminada
        </p>
      )}

      <div>
        <p className="escena-rotulo">Próxima ronda</p>
        <h2 className="escena-titulo mt-1 text-dorado">{round?.name ?? "Ronda"}</h2>
      </div>

      <div className="escena-fila">
        <div className="escena-panel">
          <p className="escena-rotulo">Ahora jugamos</p>
          <div className="flex items-center justify-center gap-[clamp(1rem,2.5vw,2.5rem)]">
            <p className="escena-dato min-w-0 uppercase">{pattern.name}</p>
            <div className="shrink-0">
              <PatternPreview
                pattern={pattern}
                freeCenter={game.settings.freeCenter}
                theme="dark"
                size="lg"
                showLetters={false}
              />
            </div>
          </div>
        </div>

        <div className="escena-panel">
          <p className="escena-rotulo">Premio</p>
          <p className="escena-dato flex items-center justify-center gap-[clamp(0.6rem,1.6vw,1.4rem)]">
            <Trophy className="h-[5vh] w-[5vh] shrink-0 text-dorado" aria-hidden />
            <span className="min-w-0">{round?.prize}</span>
          </p>
        </div>
      </div>

      {round?.description && (
        <p className="escena-nota max-w-[min(70ch,85%)]">{round.description}</p>
      )}

      <RoundsTrail game={game} activeIndex={index} />

      {game.countdown && countdownLeft > 0 ? (
        <p className="num text-[clamp(2.2rem,10vh,6.5rem)] font-black leading-none text-crema">
          {formatCountdown(countdownLeft)}
        </p>
      ) : (
        <p className="escena-nota animate-[latido_2.4s_ease-in-out_infinite]">
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
    <div className="escena">
      <p className="escena-rotulo">{game.eventName}</p>

      <h2 className="escena-titulo flex flex-wrap items-center justify-center gap-[clamp(0.75rem,2vw,2rem)] text-dorado">
        <PartyPopper className="h-[9vh] w-[9vh] shrink-0 text-rojo-claro" aria-hidden />
        ¡Se acabó el bingo!
      </h2>

      <p className="escena-nota">Estos fueron los premios de la noche</p>

      <ul className="escena-fila max-w-[1500px] grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))]">
        {game.rounds.map((round) => (
          <li key={round.id} className="escena-panel items-center">
            <p className="escena-rotulo">{round.name}</p>
            <p className="escena-dato text-[clamp(1rem,3vh,2.1rem)]">{round.prize}</p>
          </li>
        ))}
      </ul>

      <p className="escena-titulo text-[clamp(1.1rem,3.4vh,2.4rem)] tracking-[0.2em] text-crema">
        ¡Gracias por jugar!
      </p>
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
    <ol className="flex max-w-full flex-wrap items-center justify-center gap-[clamp(0.4rem,1.2vh,1rem)]">
      {game.rounds.map((round, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <li
            key={round.id}
            className={[
              "escena-pastilla shrink-0",
              active
                ? "border-dorado bg-dorado text-noche"
                : done
                  ? "bg-white/5 text-crema/45 line-through"
                  : "text-crema/60",
            ].join(" ")}
          >
            {done && <Check className="h-[1.5vh] w-[1.5vh] shrink-0" aria-hidden />}
            {round.name}
          </li>
        );
      })}
    </ol>
  );
}
