"use client";

import {
  Grid3x3,
  History,
  Keyboard,
  ListOrdered,
  PartyPopper,
  Play,
  QrCode,
  ScanLine,
  Settings,
  Sparkles,
  Tv,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { BingoBoard } from "@/components/bingo/BingoBoard";
import { BingoValidator } from "@/components/bingo/BingoValidator";
import { CardQRPanel } from "@/components/bingo/CardQRPanel";
import { GameProgress } from "@/components/bingo/GameProgress";
import { HistoryPanel } from "@/components/bingo/HistoryPanel";
import { NewGamePanel } from "@/components/bingo/NewGamePanel";
import { NumberInput } from "@/components/bingo/NumberInput";
import { NumberSearch } from "@/components/bingo/NumberSearch";
import { OperatorControls } from "@/components/bingo/OperatorControls";
import { PatternBuilder } from "@/components/bingo/PatternBuilder";
import { RecentNumbers } from "@/components/bingo/RecentNumbers";
import { RoundIndicator } from "@/components/bingo/RoundIndicator";
import { RoundsManager } from "@/components/bingo/RoundsManager";
import { SettingsPanel } from "@/components/bingo/SettingsPanel";
import { ShortcutsPanel } from "@/components/bingo/ShortcutsPanel";
import { Banderines } from "@/components/layout/Banderines";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ConfirmHost } from "@/components/ui/confirm";
import { Select } from "@/components/ui/field";
import { Modal, anyModalOpen } from "@/components/ui/modal";
import { focusNumberInput } from "@/components/bingo/NumberInput";
import { isReviewActive, useInitGame, useNow } from "@/lib/hooks";
import { getAllPatterns, getPattern } from "@/lib/patterns";
import { useGameStore } from "@/lib/store";

export default function ControlPage() {
  const hydrated = useInitGame();
  const game = useGameStore((s) => s.game);
  const startReview = useGameStore((s) => s.startReview);
  const endReview = useGameStore((s) => s.endReview);
  const togglePause = useGameStore((s) => s.togglePause);
  const setCurrentPattern = useGameStore((s) => s.setCurrentPattern);
  const endCelebration = useGameStore((s) => s.endCelebration);
  const startRound = useGameStore((s) => s.startRound);
  const dismissReveal = useGameStore((s) => s.dismissReveal);
  const endVerification = useGameStore((s) => s.endVerification);

  const [openModal, setOpenModal] = useState<
    | null
    | "validator"
    | "rounds"
    | "settings"
    | "patterns"
    | "shortcuts"
    | "history"
    | "new-game"
    | "qr"
  >(null);

  const round = game.rounds[game.currentRoundIndex];
  const pattern = getPattern(round?.patternId ?? "one-line", game.customPatterns);
  useNow(game.review?.endsAt ?? null);
  const reviewing = isReviewActive(game, Date.now());
  /** Revelado sin tiempo: hay que cerrarlo a mano para volver al tablero. */
  const manualReveal = game.reveal !== null && game.reveal.endsAt === null;

  // El panel es el que manda: cuando vence la celebración la cierra y, si
  // corresponde, deja cargado el premio siguiente.
  const celebrationEndsAt = game.winner?.endsAt ?? null;
  useEffect(() => {
    if (celebrationEndsAt === null) return;
    const id = window.setTimeout(
      () => {
        if (useGameStore.getState().game.winner) endCelebration();
      },
      Math.max(0, celebrationEndsAt - Date.now()) + 50,
    );
    return () => window.clearTimeout(id);
  }, [celebrationEndsAt, endCelebration]);

  // El veredicto negativo se retira solo: el panel es el que lleva el reloj,
  // igual que con la celebración.
  const verificationEndsAt = game.verification?.endsAt ?? null;
  useEffect(() => {
    if (verificationEndsAt === null) return;
    const id = window.setTimeout(
      () => {
        if (useGameStore.getState().game.verification) endVerification();
      },
      Math.max(0, verificationEndsAt - Date.now()) + 50,
    );
    return () => window.clearTimeout(id);
  }, [verificationEndsAt, endVerification]);

  const toggleReview = useCallback(() => {
    if (isReviewActive(useGameStore.getState().game, Date.now())) endReview();
    else startReview();
  }, [startReview, endReview]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (anyModalOpen()) return;
      const target = event.target as HTMLElement | null;
      const isBingoInput = target?.dataset?.bingoInput !== undefined;
      const editable =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable === true;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        window.dispatchEvent(new Event("bingo:undo"));
        return;
      }
      if (editable && !isBingoInput) return;

      switch (event.key.toLowerCase()) {
        case "r":
          event.preventDefault();
          toggleReview();
          break;
        case "p":
          event.preventDefault();
          togglePause();
          break;
        case "c":
          event.preventDefault();
          window.dispatchEvent(new Event("bingo:correct"));
          break;
        case " ":
          if (!useGameStore.getState().game.reveal) break;
          event.preventDefault();
          dismissReveal();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleReview, togglePause, dismissReveal]);

  useEffect(() => {
    if (hydrated) focusNumberInput();
  }, [hydrated]);

  if (!hydrated) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-crema">
        <p className="font-display text-xl text-azul">Cargando partida…</p>
      </main>
    );
  }

  return (
    <div className="textura-papel min-h-dvh bg-crema pb-8">
      <Banderines className="text-azul" />

      <header className="mx-auto flex max-w-[1700px] flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-rojo">
            Panel del operador
          </p>
          <h1 className="truncate font-display text-3xl font-black text-azul">
            {game.eventName}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
              game.intermission
                ? "bg-dorado text-noche"
                : game.status === "paused"
                  ? "bg-rojo text-papel"
                  : game.status === "playing"
                    ? "bg-verde text-papel"
                    : "bg-azul/15 text-azul"
            }`}
          >
            {game.intermission
              ? game.intermission.nextRoundIndex === null
                ? "Bingo terminado"
                : "Esperando ronda"
              : game.status === "paused"
                ? "En pausa"
                : game.status === "playing"
                  ? "En juego"
                  : "Pantalla previa"}
          </span>
          <Button variant="outline" size="sm" onClick={() => setOpenModal("rounds")}>
            <ListOrdered className="h-4 w-4" /> Rondas
          </Button>
          <Button variant="outline" size="sm" onClick={() => setOpenModal("patterns")}>
            <Grid3x3 className="h-4 w-4" /> Patrones
          </Button>
          <Button variant="outline" size="sm" onClick={() => setOpenModal("settings")}>
            <Settings className="h-4 w-4" /> Configuración
          </Button>
          <Button variant="outline" size="sm" onClick={() => setOpenModal("shortcuts")}>
            <Keyboard className="h-4 w-4" /> Atajos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("/display", "bingo-display", "noopener")}
          >
            <Tv className="h-4 w-4" /> Proyector
          </Button>
          <Button variant="outline" size="sm" onClick={() => setOpenModal("qr")}>
            <QrCode className="h-4 w-4" /> Cartones QR
          </Button>
          <Button variant="rojo" size="sm" onClick={() => setOpenModal("new-game")}>
            <Sparkles className="h-4 w-4" /> Nuevo juego
          </Button>
          <Link
            href="/"
            className="rounded-lg px-2 py-1 text-sm font-semibold text-azul/70 underline-offset-4 hover:underline"
          >
            Inicio
          </Link>
        </div>
      </header>

      {game.verification && (
        <div
          className={`mx-auto mb-3 flex max-w-[1700px] flex-wrap items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 ${
            game.verification.status === "invalid"
              ? "border-rojo bg-rojo/12"
              : "border-dorado bg-dorado/20"
          }`}
        >
          <p className="flex items-center gap-2 font-display text-xl font-black text-noche">
            <ScanLine className="h-6 w-6 text-azul" />
            {game.verification.status === "checking"
              ? "Suspenso en pantalla: revisando cartón…"
              : "En pantalla: cartón no válido. Vuelve solo al juego."}
            {game.verification.cardLabel ? ` · ${game.verification.cardLabel}` : ""}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              endVerification();
              focusNumberInput();
            }}
          >
            Quitar del proyector
          </Button>
        </div>
      )}

      {game.winner && (
        <div className="mx-auto mb-3 flex max-w-[1700px] flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-dorado bg-dorado/20 px-4 py-3">
          <p className="flex items-center gap-2 font-display text-xl font-black text-noche">
            <PartyPopper className="h-6 w-6 text-rojo" />
            ¡Celebración en pantalla! Premio: {game.winner.prize}
            {game.winner.winnerName ? ` · ${game.winner.winnerName}` : ""}
          </p>
          <Button
            variant="rojo"
            onClick={() => {
              endCelebration();
              focusNumberInput();
            }}
          >
            {game.settings.autoAdvanceOnWin
              ? "Finalizar y pasar al siguiente premio"
              : "Finalizar celebración"}
          </Button>
        </div>
      )}

      {game.intermission && game.intermission.nextRoundIndex !== null && (
        <div className="mx-auto mb-3 flex max-w-[1700px] flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-dorado bg-dorado/20 px-4 py-3">
          <p className="min-w-0 font-display text-xl font-black text-noche">
            En espera · Próxima ronda: {round?.name} · {pattern.name} · Premio:{" "}
            {round?.prize}
          </p>
          <Button
            variant="dorado"
            onClick={() => {
              startRound();
              focusNumberInput();
              toast.success(`${round?.name ?? "Ronda"} en juego`);
            }}
          >
            <Play className="h-5 w-5" /> Comenzar ronda
          </Button>
        </div>
      )}

      {game.intermission && game.intermission.nextRoundIndex === null && (
        <div className="mx-auto mb-3 flex max-w-[1700px] flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-azul/30 bg-azul/10 px-4 py-3">
          <p className="min-w-0 font-display text-xl font-black text-azul">
            Se jugaron las {game.rounds.length} rondas. El proyector muestra la pantalla
            de cierre.
          </p>
          <span className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setOpenModal("rounds")}>
              <ListOrdered className="h-4 w-4" /> Agregar más rondas
            </Button>
            <Button onClick={() => setOpenModal("new-game")}>
              <Sparkles className="h-4 w-4" /> Preparar nuevo juego
            </Button>
          </span>
        </div>
      )}

      <main className="mx-auto grid max-w-[1700px] gap-4 px-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="Número sorteado" icon={<Sparkles className="h-4 w-4" />} />
            <CardBody>
              <NumberInput />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Acciones del bingo" />
            <CardBody>
              <OperatorControls onOpenValidator={() => setOpenModal("validator")} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Tablero"
              action={
                <span className="num text-xs font-bold text-noche/55">
                  {game.drawnNumbers.length} / 75
                </span>
              }
            />
            <CardBody>
              <BingoBoard drawnNumbers={game.drawnNumbers} compact />
            </CardBody>
          </Card>
        </div>

        <aside className="flex flex-col gap-4">
          <Card>
            <CardHeader title="Ronda en juego" />
            <CardBody className="flex flex-col gap-3">
              <RoundIndicator
                round={round}
                pattern={pattern}
                index={game.currentRoundIndex}
                total={game.rounds.length}
                freeCenter={game.settings.freeCenter}
              />

              <div>
                <label
                  htmlFor="modalidad"
                  className="mb-1 block text-xs font-bold uppercase tracking-[0.1em] text-azul/70"
                >
                  Cambiar modalidad de esta ronda
                </label>
                <Select
                  id="modalidad"
                  value={round?.patternId ?? "one-line"}
                  onChange={(event) => {
                    setCurrentPattern(event.target.value);
                    toast.success("Modalidad actualizada");
                  }}
                >
                  {getAllPatterns(game.customPatterns).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Últimos números" />
            <CardBody className="flex flex-col gap-3">
              <RecentNumbers drawnNumbers={game.drawnNumbers} count={7} size="md" />
              <GameProgress count={game.drawnNumbers.length} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="¿Salió este número?" />
            <CardBody>
              <NumberSearch />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Historial"
              icon={<History className="h-4 w-4" />}
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenModal("history")}
                >
                  Ver todo
                </Button>
              }
            />
            <CardBody className="max-h-[320px] overflow-y-auto">
              <HistoryPanel drawnNumbers={game.drawnNumbers.slice(-12)} />
            </CardBody>
          </Card>
        </aside>
      </main>

      {manualReveal && !reviewing && (
        <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full border-2 border-dorado bg-noche px-5 py-2.5 text-papel shadow-xl">
          <span className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.15em]">
            Número en pantalla
            <Button
              variant="dorado"
              size="sm"
              onClick={() => {
                dismissReveal();
                focusNumberInput();
              }}
              title="Atajo: barra espaciadora"
            >
              Cerrar número
            </Button>
          </span>
        </div>
      )}

      {reviewing && (
        <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full border-2 border-dorado bg-noche px-5 py-2.5 text-papel shadow-xl">
          <span className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.15em]">
            Repaso en pantalla
            <Button variant="dorado" size="sm" onClick={endReview}>
              Salir del repaso
            </Button>
          </span>
        </div>
      )}

      <BingoValidator
        open={openModal === "validator"}
        onClose={() => {
          setOpenModal(null);
          focusNumberInput();
        }}
      />
      <NewGamePanel open={openModal === "new-game"} onClose={() => setOpenModal(null)} />
      <RoundsManager open={openModal === "rounds"} onClose={() => setOpenModal(null)} />
      <SettingsPanel open={openModal === "settings"} onClose={() => setOpenModal(null)} />
      <PatternBuilder open={openModal === "patterns"} onClose={() => setOpenModal(null)} />
      <ShortcutsPanel open={openModal === "shortcuts"} onClose={() => setOpenModal(null)} />
      <CardQRPanel open={openModal === "qr"} onClose={() => setOpenModal(null)} />
      <HistoryModal open={openModal === "history"} onClose={() => setOpenModal(null)} />
      <ConfirmHost />
    </div>
  );
}

function HistoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const drawnNumbers = useGameStore((s) => s.game.drawnNumbers);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Historial completo"
      description={`${drawnNumbers.length} números sorteados, del más reciente al primero.`}
      size="md"
    >
      <div className="max-h-[60vh] overflow-y-auto">
        <HistoryPanel drawnNumbers={drawnNumbers} />
      </div>
    </Modal>
  );
}
