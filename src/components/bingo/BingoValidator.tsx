"use client";

import { CheckCircle2, Eraser, PartyPopper, SkipForward, XCircle } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { LETTERS, LETTER_RANGES } from "@/lib/bingo";
import { GRID, getPattern } from "@/lib/patterns";
import { useGameStore } from "@/lib/store";
import type { CardGrid, ValidationResult } from "@/lib/types";
import { emptyCard, isFreeCell, validateCard } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { confirmAction } from "@/components/ui/confirm";
import { Input, Label } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { PatternPreview } from "./PatternPreview";
import { cn } from "@/lib/utils";

/** Duración del barrido de comprobación antes de mostrar el veredicto. */
const BARRIDO_MS = 620;

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
  /** Cambia en cada comprobación para reiniciar las animaciones del cartón. */
  const [runId, setRunId] = useState(0);
  const [checking, setChecking] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const timer = useRef<number | null>(null);

  const round = game.rounds[game.currentRoundIndex];
  const pattern = useMemo(
    () => getPattern(round?.patternId ?? "one-line", game.customPatterns),
    [round?.patternId, game.customPatterns],
  );
  const nextRound = game.rounds[game.currentRoundIndex + 1];
  const nextPattern = nextRound
    ? getPattern(nextRound.patternId, game.customPatterns)
    : null;
  const drawnValues = useMemo(
    () => game.drawnNumbers.map((n) => n.value),
    [game.drawnNumbers],
  );
  const freeCenter = game.settings.freeCenter;
  const autoAdvance = game.settings.autoAdvanceOnWin;

  const missingSet = new Set((result?.missing ?? []).map((m) => `${m.row}-${m.col}`));

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

  /** Comprueba el cartón con un barrido animado y luego muestra el veredicto. */
  const validate = () => {
    const outcome = validateCard(card, pattern, drawnValues, freeCenter);
    if (timer.current) window.clearTimeout(timer.current);
    setResult(null);
    setChecking(true);
    setRunId((n) => n + 1);
    timer.current = window.setTimeout(() => {
      setChecking(false);
      setResult(outcome);
    }, BARRIDO_MS);
  };

  const reset = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setCard(emptyCard());
    setResult(null);
    setChecking(false);
    setWinnerName("");
  };

  const confirmWinner = async () => {
    if (!result?.valid) {
      const ok = await confirmAction({
        title: "Confirmar sin cartón válido",
        message: result
          ? `La comprobación dio «${result.message}». ¿Confirmar el ganador igualmente?`
          : "Todavía no has verificado el cartón. ¿Confirmar el ganador igualmente?",
        confirmLabel: "Confirmar ganador",
        tone: "danger",
      });
      if (!ok) return;
    }
    declareWinner(winnerName);
    toast.success(
      autoAdvance && nextRound
        ? `¡Ganador confirmado! Al cerrar la celebración pasamos a ${nextRound.name} · ${nextRound.prize}.`
        : "¡Ganador confirmado! La celebración está en el proyector.",
    );
    reset();
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
          <Button variant="ghost" onClick={reset}>
            <Eraser className="h-4 w-4" /> Limpiar cartón
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={validate} disabled={checking}>
            {checking ? "Comprobando…" : "Verificar"}
          </Button>
          <Button
            variant="rojo"
            onClick={confirmWinner}
            title={
              autoAdvance && nextRound
                ? `Celebra y pasa a ${nextRound.name}`
                : "Muestra la celebración en el proyector"
            }
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
          <div key={runId} className="relative flex flex-col gap-1 overflow-hidden rounded-lg">
            {checking && (
              <span
                aria-hidden
                className="sin-movimiento-ocultar pointer-events-none absolute inset-x-0 top-0 z-10 h-14 animate-[barrido_0.62s_ease-in] bg-gradient-to-b from-transparent via-dorado/45 to-transparent"
              />
            )}
            {Array.from({ length: GRID }, (_, row) => (
              <div key={row} className="flex gap-1">
                {Array.from({ length: GRID }, (_, col) => {
                  const free = isFreeCell(row, col, freeCenter);
                  const value = card[row][col];
                  const drawn = value !== null && drawnValues.includes(value);
                  const isMissing = missingSet.has(`${row}-${col}`);
                  const { min, max } = LETTER_RANGES[LETTERS[col]];
                  const delay = `${(row * GRID + col) * 0.022}s`;
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
                      style={{ animationDelay: delay }}
                      className={cn(
                        "num h-14 w-14 rounded-lg border-2 text-center text-lg font-bold transition-colors focus:outline-none",
                        isMissing
                          ? "animate-[faltar-celda_0.35s_ease-in-out] border-rojo bg-rojo/15 text-rojo"
                          : drawn
                            ? "animate-[marcar-celda_0.34s_ease-out_backwards] border-verde bg-verde/15 text-verde"
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

          {checking && (
            <p className="rounded-xl border-2 border-dorado/50 bg-dorado/10 p-4 font-display text-xl font-bold text-azul">
              Comprobando el cartón…
            </p>
          )}

          {result && !checking && (
            <div
              role="status"
              className={cn(
                "animate-[zoom-entrada_0.3s_ease-out] rounded-xl border-2 p-4",
                result.valid ? "border-verde bg-verde/12" : "border-rojo bg-rojo/10",
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
                  Presiona «Confirmar ganador» para celebrarlo en el proyector.
                </p>
              )}
            </div>
          )}

          {autoAdvance && (
            <p className="flex items-start gap-2 rounded-xl border border-azul/15 bg-crema/40 px-3 py-2.5 text-xs font-semibold text-noche/70">
              <SkipForward className="mt-0.5 h-4 w-4 shrink-0 text-rojo" aria-hidden />
              {nextRound && nextPattern ? (
                <span>
                  Al confirmar, el bingo pasa solo al siguiente premio:{" "}
                  <strong className="text-noche">{nextRound.name}</strong> ·{" "}
                  {nextPattern.name} · {nextRound.prize}. El proyector queda en espera
                  hasta que des el vamos.
                </span>
              ) : (
                <span>
                  Era el último premio: al confirmar, el proyector mostrará el cierre del
                  bingo.
                </span>
              )}
            </p>
          )}

          <p className="text-xs text-noche/50">
            Verificar nunca modifica los números sorteados.
          </p>
        </div>
      </div>
    </Modal>
  );
}
