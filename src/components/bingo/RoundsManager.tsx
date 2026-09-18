"use client";

import { Plus } from "lucide-react";
import { useGameStore } from "@/lib/store";
import { confirmAction } from "@/components/ui/confirm";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { RoundEditor } from "./RoundEditor";

export function RoundsManager({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const game = useGameStore((s) => s.game);
  const upsertRound = useGameStore((s) => s.upsertRound);
  const removeRound = useGameStore((s) => s.removeRound);
  const moveRound = useGameStore((s) => s.moveRound);
  const addRound = useGameStore((s) => s.addRound);
  const setEventName = useGameStore((s) => s.setEventName);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Rondas y premios"
      description="Define el orden, la modalidad y el premio de cada ronda."
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={addRound}>
            <Plus className="h-4 w-4" /> Agregar ronda
          </Button>
          <Button onClick={onClose}>Listo</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="max-w-md">
          <Label htmlFor="event-name">Nombre del bingo</Label>
          <Input
            id="event-name"
            value={game.eventName}
            onChange={(event) => setEventName(event.target.value)}
            maxLength={50}
          />
        </div>

        <div className="flex max-h-[55vh] flex-col gap-3 overflow-y-auto pr-1">
          {game.rounds.map((round, index) => (
            <RoundEditor
              key={round.id}
              round={round}
              index={index}
              total={game.rounds.length}
              customPatterns={game.customPatterns}
              freeCenter={game.settings.freeCenter}
              isCurrent={index === game.currentRoundIndex}
              onChange={upsertRound}
              onMove={(direction) => moveRound(round.id, direction)}
              onRemove={async () => {
                const ok = await confirmAction({
                  title: "Eliminar ronda",
                  message: `¿Eliminar «${round.name}»? Esta acción no se puede deshacer.`,
                  confirmLabel: "Eliminar",
                  tone: "danger",
                });
                if (ok) removeRound(round.id);
              }}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}
