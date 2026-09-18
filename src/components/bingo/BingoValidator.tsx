"use client";

import { CheckCircle2, Eraser, PartyPopper, XCircle } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { LETTERS, LETTER_RANGES } from "@/lib/bingo";
import { GRID, getPattern } from "@/lib/patterns";
import { useGameStore } from "@/lib/store";
import type { CardGrid, ValidationResult } from "@/lib/types";
import { emptyCard, isFreeCell, validateCard } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { PatternPreview } from "./PatternPreview";
import { cn } from "@/lib/utils";

export function BingoValidator({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const game = useGameStore((s) => s.game);
  const declareWinner = useGameStore((s) => s.declareWinner);

  const [card, setCard] = useState<CardGrid>(() => emptyCard());
  const [winnerName, setWinnerName] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const round = game.rounds[game.currentRoundIndex];
  const pattern = useMemo(
    () => getPattern(round?.patternId ?? "one-line", game.customPatterns),
    [round?.patternId, game.customPatterns],
  );
  const drawnValues = useMemo(
    () => game.drawnNumbers.map((n) => n.value),
    [game.drawnNumbers],
  );
  const freeCenter = game.settings.freeCenter;

  const missingSet = new Set(
    (result?.missing ?? []).map((m) => `${m.row}-${m.col}`),
  );

  const setCell = (row: number, col: number, raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    setCard((current) =>
      current.map((r, ri) =>
        r.map((value, ci) =>
          ri === row && ci === col ? (digits === "" ? null : Number(digits)) : value,
        ),
      ),
    );
    setResult(null);
    if (digits.length === 2) {
      const next = row * GRID + col + 1;
      inputs.current[next]?.focus();
      inputs.current[next]?.select();
    }
  };

  const validate = () => {
    setResult(validateCard(card, pattern, drawnValues, freeCenter));
  };

  const confirmWinner = () => {
    declareWinner(winnerName);
    toast.success("¡Ganador confirmado! La celebración está en el proyector.");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Verificar bingo"
      description={`Modalidad actual: ${pattern.name}. Ingresa el cartón del participante para comprobarlo.`}
      size="lg"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              setCard(emptyCard());
              setResult(null);
              setWinnerName("");
            }}
          >
            <Eraser className="h-4 w-4" /> Limpiar cartón
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={validate}>Verificar</Button>
          <Button
            variant="rojo"
            onClick={confirmWinner}
            title="Muestra la celebración en el proyector"
          >
            <PartyPopper className="h-4 w-4" /> Confirmar ganador
          </Button>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-[auto_1fr]">
        <div>
          <div className="mb-1 flex gap-1">
            {LETTERS.map((letter) => (
              <span
                key={letter}
                className="flex h-7 w-14 items-center justify-center rounded-md bg-azul font-display text-lg font-black text-papel"
              >
                {letter}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {Array.from({ length: GRID }, (_, row) => (
              <div key={row} className="flex gap-1">
                {Array.from({ length: GRID }, (_, col) => {
                  const free = isFreeCell(row, col, freeCenter);
                  const value = card[row][col];
                  const drawn = value !== null && drawnValues.includes(value);
                  const isMissing = missingSet.has(`${row}-${col}`);
                  const { min, max } = LETTER_RANGES[LETTERS[col]];
                  if (free) {
                    return (
                      <div
                        key={col}
                        className="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-dorado bg-dorado/25 text-xl font-black text-noche"
                        aria-label="Centro libre"
                      >
                        ★
                      </div>
                    );
                  }
                  return (
                    <input
                      key={col}
                      ref={(el) => {
                        inputs.current[row * GRID + col] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      aria-label={`Casilla fila ${row + 1}, columna ${LETTERS[col]} (${min}-${max})`}
                      value={value ?? ""}
                      onChange={(event) => setCell(row, col, event.target.value)}
                      onFocus={(event) => event.target.select()}
                      className={cn(
                        "num h-14 w-14 rounded-lg border-2 text-center text-lg font-bold transition-colors focus:outline-none",
                        isMissing
                          ? "border-rojo bg-rojo/15 text-rojo"
                          : drawn
                            ? "border-verde bg-verde/15 text-verde"
                            : "border-azul/25 bg-papel text-noche",
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-noche/55">
            Verde: número que ya salió. Rojo: falta para completar el patrón.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4 rounded-xl border border-azul/15 bg-crema/40 p-3">
            <PatternPreview pattern={pattern} freeCenter={freeCenter} size="md" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-azul/70">
                Modalidad a verificar
              </p>
              <p className="font-display text-xl font-bold text-azul">{pattern.name}</p>
              {pattern.description && (
                <p className="text-xs text-noche/60">{pattern.description}</p>
              )}
              <p className="mt-1 text-xs text-noche/60">
                Centro libre: {freeCenter ? "activado" : "desactivado"}
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="winner-name">Nombre del ganador (opcional)</Label>
            <Input
              id="winner-name"
              value={winnerName}
              onChange={(event) => setWinnerName(event.target.value)}
              placeholder="Mesa 4 · Javiera"
              maxLength={40}
            />
          </div>

          {result && (
            <div
              role="status"
              className={cn(
                "rounded-xl border-2 p-4",
                result.valid
                  ? "border-verde bg-verde/12"
                  : "border-rojo bg-rojo/10",
              )}
            >
              <p
                className={cn(
                  "flex items-center gap-2 font-display text-2xl font-black",
                  result.valid ? "text-verde" : "text-rojo",
                )}
              >
                {result.valid ? (
                  <CheckCircle2 className="h-7 w-7" />
                ) : (
                  <XCircle className="h-7 w-7" />
                )}
                {result.valid ? "BINGO VÁLIDO" : "BINGO NO VÁLIDO"}
              </p>
              <p className="mt-1 text-sm font-semibold text-noche/80">{result.message}</p>
              {result.progress && (
                <p className="mt-1 text-xs font-semibold text-noche/60">
                  Progreso: {result.progress.current} de {result.progress.target}
                </p>
              )}
              {result.cardIssues.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-xs text-noche/65">
                  {result.cardIssues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              )}
              {result.valid && (
                <p className="mt-2 text-sm font-bold text-verde">
                  Ganador confirmado: presiona «Confirmar ganador» para celebrarlo en el
                  proyector.
                </p>
              )}
            </div>
          )}

          <p className="text-xs text-noche/50">
            Verificar nunca modifica los números sorteados.
          </p>
        </div>
      </div>
    </Modal>
  );
}
