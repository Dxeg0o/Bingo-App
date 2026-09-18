"use client";

import {
  ExternalLink,
  Flag,
  FlagOff,
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
  const startRound = useGameStore((s) => s.startRound);
  const finishGame = useGameStore((s) => s.finishGame);
  const startGame = useGameStore((s) => s.startGame);
  const startCountdown = useGameStore((s) => s.startCountdown);
  const cancelCountdown = useGameStore((s) => s.cancelCountdown);
  const backToPregame = useGameStore((s) => s.backToPregame);
  const clearNumbers = useGameStore((s) => s.clearNumbers);

  const reviewing = isReviewActive(game, Date.now());
  const paused = game.status === "paused";
  const nextRound = game.rounds[game.currentRoundIndex + 1];
  const waiting = Boolean(game.intermission);
  const currentRound = game.rounds[game.currentRoundIndex];

  const handleAdvance = async () => {
    if (!nextRound) {
      const ok = await confirmAction({
        title: "Terminar el bingo",
        message:
          "Esta es la última ronda. El proyector mostrará la pantalla de cierre con todos los premios.",
        confirmLabel: "Terminar bingo",
      });
      if (!ok) return;
      finishGame();
      toast.success("Bingo terminado");
      return;
    }
    const pattern = getPattern(nextRound.patternId, game.customPatterns);
    const ok = await confirmAction({
      title: "Siguiente premio",
      message: `Pasar a «${nextRound.name}» · ${pattern.name} · Premio: ${nextRound.prize}. La tómbola sigue igual: se mantienen los ${game.drawnNumbers.length} números ya sorteados. El proyector quedará en espera hasta que inicies la ronda.`,
      confirmLabel: "Avanzar",
    });
    if (!ok) return;
    advanceRound();
    toast.success(`En espera: ${nextRound.name}`);
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

      {waiting ? (
        <Button
          size="lg"
          variant="dorado"
          className="col-span-2 lg:col-span-1"
          onClick={() => {
            startRound();
            toast.success(`${currentRound?.name ?? "Ronda"} en juego`);
          }}
        >
          <Flag className="h-5 w-5" /> Comenzar {currentRound?.name ?? "ronda"}
        </Button>
      ) : (
        <Button size="lg" variant="rojo" onClick={handleAdvance}>
          {nextRound ? (
            <>
              <SkipForward className="h-5 w-5" /> Siguiente premio
            </>
          ) : (
            <>
              <FlagOff className="h-5 w-5" /> Terminar bingo
            </>
          )}
        </Button>
      )}

      {game.status === "pregame" || game.status === "setup" ? (
        <>
          <Button size="lg" onClick={startGame}>
            <Flag className="h-5 w-5" /> Iniciar partida
          </Button>
          <Button
            size="lg"
            variant={game.countdown ? "dorado" : "outline"}
            disabled={!game.settings.countdownSeconds}
            onClick={() => {
              if (game.countdown) {
                cancelCountdown();
                toast.success("Cuenta regresiva cancelada");
                return;
              }
              const seconds = game.settings.countdownSeconds;
              if (!seconds) return;
              startCountdown(seconds);
              toast.success("Cuenta regresiva iniciada en el proyector");
            }}
          >
            <Timer className="h-5 w-5" />
            {game.countdown ? "Cancelar cuenta" : "Cuenta regresiva"}
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
