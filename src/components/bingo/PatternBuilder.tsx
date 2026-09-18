"use client";

import { Eraser, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LETTERS } from "@/lib/bingo";
import { GRID, countCells, emptyCells } from "@/lib/patterns";
import { useGameStore } from "@/lib/store";
import type { PatternCells } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

export function PatternBuilder({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const customPatterns = useGameStore((s) => s.game.customPatterns);
  const freeCenter = useGameStore((s) => s.game.settings.freeCenter);
  const addCustomPattern = useGameStore((s) => s.addCustomPattern);
  const removeCustomPattern = useGameStore((s) => s.removeCustomPattern);
  const setCurrentPattern = useGameStore((s) => s.setCurrentPattern);

  const [name, setName] = useState("");
  const [cells, setCells] = useState<PatternCells>(() => emptyCells());

  const toggle = (row: number, col: number) => {
    setCells((current) =>
      current.map((r, ri) => r.map((value, ci) => (ri === row && ci === col ? !value : value))),
    );
  };

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Ponle un nombre al patrón");
      return;
    }
    if (countCells(cells) === 0) {
      toast.error("Marca al menos una casilla");
      return;
    }
    const pattern = addCustomPattern(trimmed, cells);
    toast.success(`Patrón «${pattern.name}» guardado`);
    setName("");
    setCells(emptyCells());
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Patrones personalizados"
      description="Marca las casillas que deben completarse. Se guardan para futuras rondas."
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={save}>
            <Save className="h-4 w-4" /> Guardar patrón
          </Button>
        </>
      }
    >
      <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
        <div>
          <div className="mb-1 flex gap-1">
            {LETTERS.map((letter) => (
              <span
                key={letter}
                className="flex h-6 w-14 items-center justify-center font-display text-lg font-black text-azul"
              >
                {letter}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {Array.from({ length: GRID }, (_, row) => (
              <div key={row} className="flex gap-1">
                {Array.from({ length: GRID }, (_, col) => {
                  const active = cells[row][col];
                  const isFree = freeCenter && row === 2 && col === 2;
                  return (
                    <button
                      key={col}
                      type="button"
                      aria-pressed={active}
                      aria-label={`Fila ${row + 1}, columna ${LETTERS[col]}`}
                      onClick={() => toggle(row, col)}
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-lg border-2 text-lg font-bold transition-colors",
                        active
                          ? "border-rojo bg-rojo text-papel"
                          : "border-azul/25 bg-crema/50 text-noche/40 hover:border-azul/60",
                      )}
                    >
                      {isFree ? "★" : active ? "●" : ""}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-noche/60">
              {countCells(cells)} casillas marcadas
            </span>
            <Button variant="ghost" size="sm" onClick={() => setCells(emptyCells())}>
              <Eraser className="h-4 w-4" /> Limpiar
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="pattern-name">Nombre del patrón</Label>
            <Input
              id="pattern-name"
              data-autofocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="La Copa"
              maxLength={40}
            />
          </div>

          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-azul/70">
              Guardados ({customPatterns.length})
            </h3>
            {customPatterns.length === 0 ? (
              <p className="text-sm italic text-noche/50">
                Todavía no has creado patrones personalizados.
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {customPatterns.map((pattern) => (
                  <li
                    key={pattern.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-azul/15 bg-crema/40 px-3 py-1.5"
                  >
                    <span className="truncate text-sm font-semibold text-noche">
                      {pattern.name}
                    </span>
                    <span className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCurrentPattern(pattern.id);
                          toast.success(`Modalidad actual: ${pattern.name}`);
                        }}
                      >
                        Usar ahora
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Eliminar ${pattern.name}`}
                        onClick={() => removeCustomPattern(pattern.id)}
                      >
                        <Trash2 className="h-4 w-4 text-rojo" />
                      </Button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
