"use client";

import { PartyPopper, Play, Settings2, Sparkles, Tv } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Banderines } from "@/components/layout/Banderines";
import { Button } from "@/components/ui/button";
import { useInitGame } from "@/lib/hooks";
import { getPattern } from "@/lib/patterns";
import { useGameStore } from "@/lib/store";
import { hasSavedGame } from "@/lib/storage";

export default function HomePage() {
  const hydrated = useInitGame();
  const game = useGameStore((s) => s.game);
  const loadDemo = useGameStore((s) => s.loadDemo);
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (hydrated) setSaved(hasSavedGame());
  }, [hydrated]);

  const round = game.rounds[game.currentRoundIndex];
  const pattern = getPattern(round?.patternId ?? "one-line", game.customPatterns);

  return (
    <main className="textura-noche flex min-h-dvh flex-col text-crema">
      <Banderines className="text-crema" count={30} />

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-8 px-6 py-10 text-center">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-[0.45em] text-dorado">
            Fiestas Patrias
          </p>
          <h1 className="font-display text-[clamp(3rem,10vw,7rem)] font-black uppercase leading-[0.9] text-crema">
            Bingo
            <br />
            <span className="text-dorado">Dieciochero</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-crema/70 sm:text-lg">
            Administra y proyecta un bingo presencial de 75 números: una pantalla para
            el operador y otra para el público.
          </p>
        </div>

        <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-dorado/40 bg-azul/30 shadow-2xl shadow-black/30">
          <Image
            src="/images/fiestas-patrias-bingo.png"
            alt="Pareja celebrando las Fiestas Patrias chilenas en una fonda"
            width={1122}
            height={1402}
            priority
            className="h-52 w-full object-cover object-[center_42%] sm:h-64"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-noche-profundo/70 via-transparent to-transparent" />
          <p className="absolute inset-x-0 bottom-0 px-5 py-4 font-display text-lg font-bold text-crema sm:text-xl">
            Que empiece la fiesta: ¡a cantar bingo!
          </p>
        </div>

        <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
          {saved && (
            <Button
              size="xl"
              variant="dorado"
              className="sm:col-span-2"
              onClick={() => router.push("/control")}
            >
              <Play className="h-6 w-6" /> Continuar partida
              {game.drawnNumbers.length > 0 && (
                <span className="num text-base font-semibold opacity-80">
                  ({game.drawnNumbers.length} números · {pattern.name})
                </span>
              )}
            </Button>
          )}

          <Button size="xl" onClick={() => router.push("/setup")}>
            <Settings2 className="h-6 w-6" /> Nueva partida
          </Button>

          <Button
            size="xl"
            variant="rojo"
            onClick={() => {
              loadDemo();
              router.push("/control");
            }}
          >
            <Sparkles className="h-6 w-6" /> Usar demo
          </Button>

          <Button
            size="xl"
            variant="outline"
            className="sm:col-span-2"
            onClick={() => window.open("/display", "bingo-display", "noopener")}
          >
            <Tv className="h-6 w-6" /> Abrir proyector
          </Button>
        </div>

        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-crema/55">
          <li className="flex items-center gap-1.5">
            <PartyPopper className="h-4 w-4 text-dorado" /> Rondas, premios y patrones
          </li>
          <li>Repasos automáticos</li>
          <li>Verificación de cartones</li>
          <li>Todo se guarda en este navegador</li>
        </ul>
      </div>

      <footer className="pb-6 text-center text-xs text-crema/40">
        Hecho para fondas, juntas y celebraciones dieciocheras.
      </footer>
    </main>
  );
}
