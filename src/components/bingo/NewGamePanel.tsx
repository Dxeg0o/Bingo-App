"use client";

import { Plus, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { confirmAction } from "@/components/ui/confirm";
import { Input, Label } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { DEMO_ROUNDS, createRound } from "@/lib/defaults";
import { useGameStore } from "@/lib/store";
import type { BingoRound } from "@/lib/types";
import { RoundEditor } from "./RoundEditor";

/**
 * Arranca un juego nuevo: la tómbola vuelve a cero y se reescriben las rondas
 * (cuántas, con qué premio y cómo se gana cada una). Parte de las rondas del
 * juego anterior, así repetir la misma estructura es un solo clic.
 */
export function NewGamePanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const game = useGameStore((s) => s.game);
  const applySetup = useGameStore((s) => s.applySetup);

  const [eventName, setEventName] = useState(game.eventName);
  const [rounds, setRounds] = useState<BingoRound[]>(game.rounds);

  // Al abrirlo se recarga con el juego actual: nada de arrastrar ediciones
  // a medio hacer de la vez anterior.
  useEffect(() => {
    if (!open) return;
    setEventName(game.eventName);
    setRounds(game.rounds.map((round) => ({ ...round, id: createRound().id })));
    // Solo al abrir: no queremos pisar lo que el usuario está escribiendo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const start = async () => {
    const limpias = rounds.map((round) => ({
      ...round,
      name: round.name.trim() || "Ronda",
      prize: round.prize.trim() || "Premio",
    }));
    const ok = await confirmAction({
      title: "Comenzar el juego nuevo",
      message: `${limpias.length} ${
        limpias.length === 1 ? "ronda" : "rondas"
      }, empezando por «${limpias[0]?.name}» (${limpias[0]?.prize}). Se borran los ${
        game.drawnNumbers.length
      } números del juego anterior y la tómbola parte de cero.`,
      confirmLabel: "Comenzar juego",
    });
    if (!ok) return;
    applySetup({
      eventName: eventName.trim() || "Bingo Dieciochero",
      rounds: limpias,
      settings: game.settings,
    });
    toast.success(`¡Juego nuevo listo! Primer premio: ${limpias[0]?.prize}`);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuevo juego"
      description="Define cuántas rondas se juegan, qué premio lleva cada una y cómo se gana. La tómbola parte de cero y sigue corriendo durante todo el juego."
      size="xl"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => setRounds(DEMO_ROUNDS.map((r) => ({ ...r, id: createRound().id })))}
          >
            <RotateCcw className="h-4 w-4" /> Usar rondas de ejemplo
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setRounds((current) => [
                ...current,
                createRound({
                  name: `Ronda ${current.length + 1}`,
                  prize: "Premio",
                }),
              ])
            }
          >
            <Plus className="h-4 w-4" /> Agregar ronda
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={start}>
            <Sparkles className="h-4 w-4" /> Comenzar juego
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="max-w-md">
          <Label htmlFor="nuevo-evento">Nombre del bingo</Label>
          <Input
            id="nuevo-evento"
            data-autofocus
            value={eventName}
            onChange={(event) => setEventName(event.target.value)}
            maxLength={50}
          />
        </div>

        <p className="rounded-xl border border-azul/15 bg-crema/40 px-3 py-2.5 text-xs font-semibold text-noche/70">
          {rounds.length} {rounds.length === 1 ? "ronda" : "rondas"} · se juegan en orden
          y la tómbola no se reinicia entre ellas. La configuración (sonidos, tiempos,
          centro libre) se mantiene como la tienes.
        </p>

        <div className="flex max-h-[55vh] flex-col gap-3 overflow-y-auto pr-1">
          {rounds.map((round, index) => (
            <RoundEditor
              key={round.id}
              round={round}
              index={index}
              total={rounds.length}
              customPatterns={game.customPatterns}
              freeCenter={game.settings.freeCenter}
              onChange={(updated) =>
                setRounds((current) =>
                  current.map((r) => (r.id === updated.id ? updated : r)),
                )
              }
              onRemove={
                rounds.length > 1
                  ? () => setRounds((current) => current.filter((r) => r.id !== round.id))
                  : undefined
              }
              onMove={(direction) =>
                setRounds((current) => {
                  const target = index + direction;
                  if (target < 0 || target >= current.length) return current;
                  const copy = [...current];
                  [copy[index], copy[target]] = [copy[target], copy[index]];
                  return copy;
                })
              }
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}
