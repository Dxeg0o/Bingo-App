"use client";

import { Check, CornerDownLeft, Delete, Pencil, Undo2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { formatBingoNumber, getLastNumber } from "@/lib/bingo";
import { useGameStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function focusNumberInput() {
  if (typeof document === "undefined") return;
  const el = document.querySelector<HTMLInputElement>("[data-bingo-input]");
  el?.focus();
  el?.select();
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "borrar", "0", "enter"];

export function NumberInput() {
  const game = useGameStore((s) => s.game);
  const addNumber = useGameStore((s) => s.addNumber);
  const replaceLast = useGameStore((s) => s.replaceLast);
  const undoLast = useGameStore((s) => s.undoLast);

  const [value, setValue] = useState("");
  const [mode, setMode] = useState<"add" | "correct">("add");
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const last = getLastNumber(game.drawnNumbers);
  const paused = game.status === "paused";

  const fail = useCallback((message: string) => {
    setShake(true);
    window.setTimeout(() => setShake(false), 400);
    toast.error(message);
  }, []);

  const submit = useCallback(() => {
    const parsed = Number.parseInt(value.trim(), 10);
    if (!value.trim() || Number.isNaN(parsed)) {
      fail("Ingresa un número entre 1 y 75");
      return;
    }

    if (mode === "correct") {
      const result = replaceLast(parsed);
      if (result.ok) {
        toast.success(`Corregido: ahora es ${formatBingoNumber(result.number.value)}`);
        setMode("add");
        setValue("");
      } else {
        fail(result.message);
      }
    } else {
      const result = addNumber(parsed);
      if (result.ok) {
        toast.success(`${formatBingoNumber(result.number.value)} agregado`, {
          duration: 1600,
        });
        setValue("");
      } else {
        fail(result.message);
      }
    }
    inputRef.current?.focus();
  }, [value, mode, addNumber, replaceLast, fail]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  const startCorrection = useCallback(() => {
    if (!last) {
      toast.error("Todavía no hay números para corregir");
      return;
    }
    setMode("correct");
    setValue("");
    inputRef.current?.focus();
  }, [last]);

  const handleUndo = useCallback(() => {
    const removed = undoLast();
    if (removed === null) {
      toast.error("No hay números para deshacer");
      return;
    }
    toast.success(`Último número eliminado (${formatBingoNumber(removed)})`);
    setMode("add");
    inputRef.current?.focus();
  }, [undoLast]);

  // Botones expuestos globalmente para los atajos de teclado.
  useEffect(() => {
    const onUndoEvent = () => handleUndo();
    const onCorrectEvent = () => startCorrection();
    window.addEventListener("bingo:undo", onUndoEvent);
    window.addEventListener("bingo:correct", onCorrectEvent);
    return () => {
      window.removeEventListener("bingo:undo", onUndoEvent);
      window.removeEventListener("bingo:correct", onCorrectEvent);
    };
  }, [handleUndo, startCorrection]);

  const pressKey = (key: string) => {
    if (key === "enter") {
      submit();
      return;
    }
    if (key === "borrar") {
      setValue((v) => v.slice(0, -1));
      inputRef.current?.focus();
      return;
    }
    setValue((v) => (v.length >= 2 ? key : v + key));
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-3">
      {mode === "correct" && last && (
        <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-dorado bg-dorado/15 px-3 py-2">
          <p className="text-sm font-semibold text-noche">
            Corrigiendo el último número:{" "}
            <strong className="num">{formatBingoNumber(last.value)}</strong>. Escribe el
            número correcto y presiona Enter.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setMode("add");
              setValue("");
              inputRef.current?.focus();
            }}
          >
            <X className="h-4 w-4" /> Cancelar
          </Button>
        </div>
      )}

      {paused && (
        <p className="rounded-xl border-2 border-rojo/40 bg-rojo/10 px-3 py-2 text-sm font-semibold text-rojo">
          El bingo está en pausa: no se aceptan números hasta reanudar (tecla P).
        </p>
      )}

      <div className="flex gap-3">
        <div className={cn("relative flex-1", shake && "animate-[shake_0.35s_ease-in-out]")}>
          <input
            ref={inputRef}
            data-bingo-input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            enterKeyHint="done"
            aria-label={
              mode === "correct"
                ? "Número correcto del último sorteo"
                : "Ingresar número sorteado"
            }
            placeholder="42"
            value={value}
            onChange={(event) => {
              const digits = event.target.value.replace(/\D/g, "").slice(0, 2);
              setValue(digits);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submit();
              } else if (event.key === "Escape") {
                event.preventDefault();
                if (mode === "correct") setMode("add");
                setValue("");
              }
            }}
            className={cn(
              "num h-28 w-full rounded-2xl border-4 bg-papel text-center text-7xl font-black tracking-tight text-azul transition-colors placeholder:text-azul/20 focus:outline-none",
              mode === "correct"
                ? "border-dorado focus:border-dorado"
                : "border-azul/25 focus:border-azul",
            )}
          />
          <span className="pointer-events-none absolute bottom-2 right-3 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-noche/40">
            Enter <CornerDownLeft className="h-3.5 w-3.5" />
          </span>
        </div>

        <div className="grid h-28 w-40 shrink-0 grid-cols-3 grid-rows-4 gap-1.5">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => pressKey(key)}
              aria-label={
                key === "borrar" ? "Borrar" : key === "enter" ? "Confirmar" : key
              }
              className={cn(
                "num flex items-center justify-center rounded-lg border-2 text-lg font-bold transition-colors",
                key === "enter"
                  ? "border-verde bg-verde text-papel hover:brightness-110"
                  : key === "borrar"
                    ? "border-rojo/30 bg-papel text-rojo hover:bg-rojo/10"
                    : "border-azul/20 bg-papel text-azul hover:bg-crema",
              )}
            >
              {key === "borrar" ? (
                <Delete className="h-4 w-4" />
              ) : key === "enter" ? (
                <Check className="h-5 w-5" />
              ) : (
                key
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="lg" className="flex-1" onClick={submit}>
          <Check className="h-5 w-5" />
          {mode === "correct" ? "Guardar corrección" : "Agregar número"}
        </Button>
        <Button size="lg" variant="outline" onClick={handleUndo} title="Ctrl/Cmd + Z">
          <Undo2 className="h-5 w-5" /> Deshacer
        </Button>
        <Button size="lg" variant="outline" onClick={startCorrection}>
          <Pencil className="h-5 w-5" /> Corregir
        </Button>
      </div>
    </div>
  );
}
