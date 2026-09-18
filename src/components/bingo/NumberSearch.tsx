"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { findDrawnNumber, formatBingoNumber, formatTime, isValidBingoNumber } from "@/lib/bingo";
import { useGameStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

type Result =
  | { kind: "found"; label: string; sequence: number; time: string }
  | { kind: "missing"; label: string }
  | { kind: "invalid" };

export function NumberSearch() {
  const drawnNumbers = useGameStore((s) => s.game.drawnNumbers);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const search = (raw: string) => {
    const parsed = Number.parseInt(raw.trim(), 10);
    if (!isValidBingoNumber(parsed)) {
      setResult({ kind: "invalid" });
      return;
    }
    const found = findDrawnNumber(drawnNumbers, parsed);
    setResult(
      found
        ? {
            kind: "found",
            label: formatBingoNumber(parsed),
            sequence: found.sequence,
            time: formatTime(found.drawnAt),
          }
        : { kind: "missing", label: formatBingoNumber(parsed) },
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          search(query);
        }}
      >
        <Input
          type="text"
          inputMode="numeric"
          value={query}
          aria-label="¿Salió este número?"
          placeholder="¿Salió este número?"
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "").slice(0, 2);
            setQuery(digits);
            if (digits.length === 0) setResult(null);
            else search(digits);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setQuery("");
              setResult(null);
            }
          }}
          className="num text-lg font-bold"
        />
        <Button variant="outline" size="icon" type="submit" aria-label="Buscar número">
          <Search className="h-5 w-5" />
        </Button>
      </form>

      {result && (
        <div
          role="status"
          className={
            result.kind === "found"
              ? "rounded-xl border-2 border-verde bg-verde/12 px-3 py-2"
              : result.kind === "missing"
                ? "rounded-xl border-2 border-rojo/50 bg-rojo/10 px-3 py-2"
                : "rounded-xl border-2 border-azul/25 bg-crema/60 px-3 py-2"
          }
        >
          {result.kind === "found" && (
            <p className="text-sm font-bold text-verde">
              ✅ <span className="num">{result.label}</span> salió · número #
              {result.sequence} · {result.time}
            </p>
          )}
          {result.kind === "missing" && (
            <p className="text-sm font-bold text-rojo">
              ❌ <span className="num">{result.label}</span> todavía no ha salido
            </p>
          )}
          {result.kind === "invalid" && (
            <p className="text-sm font-semibold text-noche/70">
              Ingresa un número entre 1 y 75.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
