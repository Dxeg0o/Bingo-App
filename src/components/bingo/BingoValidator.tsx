"use client";

import {
  CheckCircle2,
  Eraser,
  PartyPopper,
  ScanLine,
  SkipForward,
  Tv,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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

/** Duración del barrido de comprobación en el panel (no toca el proyector). */
const BARRIDO_MS = 620;

/** Cuánto aguanta en pantalla el veredicto negativo antes de volver al juego. */
const NO_VALIDO_MS = 9000;

export function BingoValidator({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const game = useGameStore((s) => s.game);
  const declareWinner = useGameStore((s) => s.declareWinner);
  const startVerification = useGameStore((s) => s.startVerification);
  const rejectCard = useGameStore((s) => s.rejectCard);
  const endVerification = useGameStore((s) => s.endVerification);

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

  /**
   * Abrir el verificador ya pone el suspenso en el proyector: el público ve
   * «Revisando cartón» todo el rato que el operador tarde en tipear.
   */
  useEffect(() => {
    if (open) startVerification();
  }, [open, startVerification]);

  /**
   * Comprobación privada del operador: marca el cartón y da el veredicto en el
   * panel. El proyector no se entera — sigue en suspenso hasta que el operador
   * decida qué mostrar.
   */
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

  const reset = ({ keepScreen = false }: { keepScreen?: boolean } = {}) => {
    if (timer.current) window.clearTimeout(timer.current);
    setCard(emptyCard());
    setResult(null);
    setChecking(false);
    setWinnerName("");
    if (!keepScreen && useGameStore.getState().game.verification) endVerification();
  };

  /** Cerrar el modal saca la revisión del proyector: nunca queda colgada. */
  const close = () => {
    reset();
    onClose();
  };

  const confirmWinner = async () => {
    if (!result?.valid) {
      const ok = await confirmAction({
        title: "Confirmar sin cartón válido",
        message: result
          ? `La comprobación dio «${result.message}». ¿Confirmar el ganador igualmente?`
          : "Todavía no has comprobado el cartón. ¿Confirmar el ganador igualmente?",
        confirmLabel: "Confirmar ganador",
        tone: "danger",
      });
      if (!ok) return;
    }
    if (timer.current) window.clearTimeout(timer.current);
    declareWinner(winnerName);
    toast.success(
      autoAdvance && nextRound
        ? `¡Ganador confirmado! Al cerrar la celebración pasamos a ${nextRound.name} · ${nextRound.prize}.`
        : "¡Ganador confirmado! La celebración está en el proyector.",
    );
    // `declareWinner` ya se llevó la revisión del proyector: no la toquemos.
    reset({ keepScreen: true });
    onClose();
  };

  /** Muestra en el proyector, de a poco, que el cartón no era bingo. */
  const confirmReject = async () => {
    if (result?.valid) {
      const ok = await confirmAction({
        title: "Mostrar cartón no válido",
        message:
          "La comprobación dio BINGO VÁLIDO. ¿Igual quieres anunciar que el cartón no era bingo?",
        confirmLabel: "Mostrar no válido",
        tone: "danger",
      });
      if (!ok) return;
    }
    if (timer.current) window.clearTimeout(timer.current);
    rejectCard({
      cardLabel: winnerName,
      missingCount: result?.missing.length ?? 0,
      holdMs: NO_VALIDO_MS,
    });
    toast("Anunciado en el proyector: el cartón no era bingo.");
    reset({ keepScreen: true });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Verificar bingo"
      description={`El proyector ya está en «Revisando cartón». Modalidad: ${pattern.name}. Ingresa el cartón y después anuncia el resultado.`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={() => reset()}>
            <Eraser className="h-4 w-4" /> Limpiar cartón
          </Button>
          <Button variant="outline" onClick={close}>
            Cerrar
          </Button>
          <Button variant="outline" onClick={validate} disabled={checking}>
            {checking ? "Comprobando…" : "Comprobar cartón"}
          </Button>
          <Button
            variant="outline"
            onClick={confirmReject}
            title="Anuncia en el proyector que el cartón no era bingo"
            className="border-rojo text-rojo"
          >
            <XCircle className="h-4 w-4" /> Cartón no válido
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
                className="sin-movimiento-ocultar pointer-events-none absolute inset-x-0 top-0 z-10 h-14 animate-[barrido_1.1s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-dorado/45 to-transparent"
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

          <div className="flex items-start gap-3 rounded-xl border-2 border-dorado/50 bg-dorado/10 p-4">
            <ScanLine className="mt-1 h-6 w-6 shrink-0 animate-pulse text-dorado" />
            <div>
              <p className="font-display text-xl font-bold text-azul">
                Suspenso en el proyector
              </p>
              <p className="text-xs font-semibold text-noche/65">
                El público ve «Revisando cartón» mientras tipeas. El resultado solo sale
                en pantalla cuando aprietas «Confirmar ganador» o «Cartón no válido».
              </p>
            </div>
          </div>

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
              <p className="mt-2 flex items-center gap-2 text-sm font-bold text-noche/70">
                <Tv className="h-4 w-4 shrink-0" aria-hidden />
                {result.valid
                  ? "Anúncialo con «Confirmar ganador»: la celebración entra de a poco."
                  : `Anúncialo con «Cartón no válido»: entra de a poco y vuelve al juego en ${Math.round(NO_VALIDO_MS / 1000)} segundos.`}
              </p>
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
