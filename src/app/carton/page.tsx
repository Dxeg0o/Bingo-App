"use client";

import { Eraser, Shuffle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PlayerCardGrid } from "@/components/bingo/PlayerCardGrid";
import { Banderines } from "@/components/layout/Banderines";
import { Button } from "@/components/ui/button";
import { ConfirmHost, confirmAction } from "@/components/ui/confirm";
import {
  loadCard,
  markKey,
  randomCard,
  saveCard,
  type PlayerCard,
} from "@/lib/card";

/**
 * Cartón del público. Se entra escaneando el QR que muestra el operador y todo
 * queda en este celular: el cartón sorteado y las casillas marcadas a mano.
 * No hay conexión con la partida, es un extra para jugar sin cartón de papel.
 */
export default function CartonPage() {
  const [card, setCard] = useState<PlayerCard | null>(null);
  const [marks, setMarks] = useState<Set<string>>(new Set());

  // Primero el cartón guardado; si es la primera vez, uno nuevo. El centro
  // libre llega por la URL (?libre=0) porque el celular no ve la configuración.
  useEffect(() => {
    const saved = loadCard();
    if (saved) {
      setCard(saved.card);
      setMarks(new Set(saved.marks));
      return;
    }
    const freeCenter =
      new URLSearchParams(window.location.search).get("libre") !== "0";
    setCard(randomCard(freeCenter));
  }, []);

  useEffect(() => {
    if (card) saveCard(card, [...marks]);
  }, [card, marks]);

  const toggle = useCallback((row: number, col: number) => {
    setMarks((current) => {
      const next = new Set(current);
      const key = markKey(row, col);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const nuevoCarton = useCallback(async () => {
    const ok = await confirmAction({
      title: "¿Cambiar de cartón?",
      message:
        "Se sortea un cartón nuevo y se pierden las marcas del actual. No se puede recuperar.",
      confirmLabel: "Sortear otro",
      tone: "danger",
    });
    if (!ok) return;
    setCard((current) => randomCard(current?.freeCenter ?? true));
    setMarks(new Set());
  }, []);

  const borrarMarcas = useCallback(async () => {
    const ok = await confirmAction({
      title: "¿Borrar las marcas?",
      message: "El cartón se mantiene, solo se limpian las casillas marcadas.",
      confirmLabel: "Borrar marcas",
      tone: "danger",
    });
    if (ok) setMarks(new Set());
  }, []);

  return (
    <main className="textura-noche flex min-h-dvh flex-col text-crema">
      <Banderines className="text-crema" count={18} />

      <div className="mx-auto flex w-full max-w-[32rem] flex-1 flex-col gap-4 px-3 pb-6 pt-4">
        <header className="text-center">
          <p className="font-display text-[0.7rem] font-bold uppercase tracking-[0.4em] text-dorado">
            Bingo Dieciochero
          </p>
          <h1 className="font-display text-3xl font-black uppercase leading-none text-crema">
            Tu cartón
          </h1>
          <p className="mt-1 text-sm text-crema/65">
            Marca con el dedo los números que vayan cantando.
          </p>
        </header>

        {card ? (
          <>
            <PlayerCardGrid card={card} marks={marks} onToggle={toggle} />

            <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.14em] text-crema/55">
              <span>
                Cartón <span className="num font-bold text-dorado">#{card.id}</span>
              </span>
              <span className="num">
                {marks.size + (card.freeCenter ? 1 : 0)} / 25 marcados
              </span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="dorado" size="lg" onClick={nuevoCarton}>
                <Shuffle className="h-5 w-5" /> Otro cartón
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={borrarMarcas}
                disabled={marks.size === 0}
              >
                <Eraser className="h-5 w-5" /> Borrar marcas
              </Button>
            </div>

            <p className="text-center text-xs leading-relaxed text-crema/45">
              Este cartón queda guardado en tu celular: puedes cerrar la página y
              volver sin perder las marcas. Si ganas, muéstraselo a quien canta el
              bingo para que lo revise.
            </p>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-crema/50">
            Sorteando tu cartón…
          </div>
        )}
      </div>

      <ConfirmHost />
    </main>
  );
}
