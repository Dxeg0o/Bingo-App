"use client";

import { ArrowDown, ArrowUp, Play, Trash2 } from "lucide-react";
import { getAllPatterns, getPattern } from "@/lib/patterns";
import type { BingoPattern, BingoRound } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { PatternPreview } from "./PatternPreview";

export function RoundEditor({
  round,
  index,
  total,
  customPatterns,
  freeCenter,
  onChange,
  onRemove,
  onMove,
  onPlay,
  isCurrent,
}: {
  round: BingoRound;
  index: number;
  total: number;
  customPatterns: BingoPattern[];
  freeCenter: boolean;
  onChange: (round: BingoRound) => void;
  onRemove?: () => void;
  onMove?: (direction: -1 | 1) => void;
  /** Saltar directamente a esta ronda (solo en el panel del operador). */
  onPlay?: () => void;
  isCurrent?: boolean;
}) {
  const patterns = getAllPatterns(customPatterns);
  const pattern = getPattern(round.patternId, customPatterns);

  return (
    <div
      className={`rounded-2xl border-2 p-3 ${
        isCurrent ? "border-rojo bg-rojo/5" : "border-azul/15 bg-crema/30"
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-azul/70">
          Ronda {index + 1} de {total}
          {isCurrent && <span className="ml-2 text-rojo">· en juego</span>}
        </span>
        <span className="flex items-center gap-1">
          {onPlay && !isCurrent && (
            <Button variant="outline" size="sm" onClick={onPlay}>
              <Play className="h-4 w-4" /> Jugar esta ronda
            </Button>
          )}
          {onMove && (
            <>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Subir ronda"
                disabled={index === 0}
                onClick={() => onMove(-1)}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Bajar ronda"
                disabled={index === total - 1}
                onClick={() => onMove(1)}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              aria-label="Eliminar ronda"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4 text-rojo" />
            </Button>
          )}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor={`name-${round.id}`}>Nombre</Label>
            <Input
              id={`name-${round.id}`}
              value={round.name}
              onChange={(event) => onChange({ ...round, name: event.target.value })}
              maxLength={40}
            />
          </div>
          <div>
            <Label htmlFor={`prize-${round.id}`}>Premio</Label>
            <Input
              id={`prize-${round.id}`}
              value={round.prize}
              onChange={(event) => onChange({ ...round, prize: event.target.value })}
              maxLength={60}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor={`pattern-${round.id}`}>Modalidad</Label>
            <Select
              id={`pattern-${round.id}`}
              value={round.patternId}
              onChange={(event) => onChange({ ...round, patternId: event.target.value })}
            >
              {patterns.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor={`desc-${round.id}`}>Descripción (opcional)</Label>
            <Input
              id={`desc-${round.id}`}
              value={round.description ?? ""}
              onChange={(event) =>
                onChange({ ...round, description: event.target.value })
              }
              maxLength={80}
            />
          </div>
        </div>
        <div className="flex items-start justify-center pt-5">
          <PatternPreview pattern={pattern} freeCenter={freeCenter} size="md" />
        </div>
      </div>
    </div>
  );
}
