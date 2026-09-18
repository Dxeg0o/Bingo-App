"use client";

import {
  ExternalLink,
  Flag,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  ShieldCheck,
  SkipForward,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
import { isReviewActive } from "@/lib/hooks";
import { getPattern } from "@/lib/patterns";
import { useGameStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { confirmAction } from "@/components/ui/confirm";

export function OperatorControls({
  onOpenValidator,
}: {
  onOpenValidator: () => void;
}) {
  const game = useGameStore((s) => s.game);
  const startReview = useGameStore((s) => s.startReview);
  const endReview = useGameStore((s) => s.endReview);
  const togglePause = useGameStore((s) => s.togglePause);
  const advanceRound = useGameStore((s) => s.advanceRound);
  const startGame = useGameStore((s) => s.startGame);
  const startCountdown = useGameStore((s) => s.startCountdown);
  const backToPregame = useGameStore((s) => s.backToPregame);
  const clearNumbers = useGameStore((s) => s.clearNumbers);

  const reviewing = isReviewActive(game, Date.now());
  const paused = game.status === "paused";
  const isLastRound = game.currentRoundIndex >= game.rounds.length - 1;
  const nextRound = game.rounds[game.currentRoundIndex + 1];

  const handleAdvance = async () => {
    if (!nextRound) {
      toast.error("Esta es la última ronda del bingo");
      return;
    }
    const pattern = getPattern(nextRound.patternId, game.customPatterns);
    const ok = await confirmAction({
      title: "Siguiente premio",
      message: `Pasar a «${nextRound.name}» · ${pattern.name} · Premio: ${nextRound.prize}.${
        nextRound.resetNumbersOnStart
          ? " Esta ronda reinicia los números sorteados: se borrarán los números actuales."
          : " Los números sorteados se mantienen."
      }`,
      confirmLabel: "Avanzar",
      tone: nextRound.resetNumbersOnStart ? "danger" : "normal",
    });
    if (!ok) return;
    advanceRound();
    toast.success(`Ronda actualizada: ${nextRound.name}`);
  };

  const openDisplay = () => {
    window.open("/display", "bingo-display", "noopener");
  };

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
      <Button
        size="lg"
        variant={reviewing ? "dorado" : "outline"}
        onClick={() => (reviewing ? endReview() : startReview())}
        title="Atajo: R"
      >
        <Repeat className="h-5 w-5" />
        {reviewing ? "Salir del repaso" : "Repasar números"}
      </Button>

      <Button
        size="lg"
        variant={paused ? "dorado" : "outline"}
        onClick={togglePause}
        title="Atajo: P"
      >
        {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
        {paused ? "Reanudar" : "Pausar"}
      </Button>

      <Button size="lg" variant="outline" onClick={onOpenValidator}>
        <ShieldCheck className="h-5 w-5" /> Verificar bingo
      </Button>

      <Button size="lg" variant="rojo" onClick={handleAdvance} disabled={isLastRound}>
        <SkipForward className="h-5 w-5" /> Siguiente premio
      </Button>

      {game.status === "pregame" || game.status === "setup" ? (
        <>
          <Button size="lg" onClick={startGame}>
            <Flag className="h-5 w-5" /> Iniciar partida
          </Button>
          <Button
            size="lg"
            variant="outline"
            disabled={!game.settings.countdownSeconds}
            onClick={() => {
              const seconds = game.settings.countdownSeconds;
              if (!seconds) return;
              startCountdown(seconds);
              toast.success("Cuenta regresiva iniciada en el proyector");
            }}
          >
            <Timer className="h-5 w-5" /> Cuenta regresiva
          </Button>
        </>
      ) : (
        <>
          <Button size="lg" variant="outline" onClick={openDisplay}>
            <ExternalLink className="h-5 w-5" /> Abrir proyector
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={async () => {
              const ok = await confirmAction({
                title: "Volver a la pantalla previa",
                message:
                  "El proyector mostrará la pantalla de bienvenida. Los números sorteados se mantienen.",
                confirmLabel: "Mostrar bienvenida",
              });
              if (ok) backToPregame();
            }}
          >
            <Flag className="h-5 w-5" /> Pantalla previa
          </Button>
        </>
      )}

      {(game.status === "pregame" || game.status === "setup") && (
        <Button size="lg" variant="outline" onClick={openDisplay}>
          <ExternalLink className="h-5 w-5" /> Abrir proyector
        </Button>
      )}

      <Button
        size="lg"
        variant="danger"
        onClick={async () => {
          const ok = await confirmAction({
            title: "Reiniciar números",
            message:
              "Se borrarán todos los números sorteados de esta partida. Las rondas y la configuración se mantienen.",
            confirmLabel: "Reiniciar números",
            tone: "danger",
          });
          if (ok) {
            clearNumbers();
            toast.success("Números reiniciados");
          }
        }}
      >
        <RotateCcw className="h-5 w-5" /> Reiniciar números
      </Button>
    </div>
  );
}
