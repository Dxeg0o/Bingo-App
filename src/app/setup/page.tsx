"use client";

import { ArrowLeft, ArrowRight, Check, Plus, Sparkles, Tv } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RoundEditor } from "@/components/bingo/RoundEditor";
import { Banderines } from "@/components/layout/Banderines";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ConfirmHost } from "@/components/ui/confirm";
import { Input, Label, Toggle } from "@/components/ui/field";
import { OptionRow } from "@/components/ui/option-row";
import { DEFAULT_SETTINGS, DEMO_ROUNDS, createRound } from "@/lib/defaults";
import { useInitGame } from "@/lib/hooks";
import { useGameStore } from "@/lib/store";
import type { BingoRound, GameSettings, RevealDuration } from "@/lib/types";

const STEPS = ["Nombre", "Rondas", "Configuración", "Listo"];

export default function SetupPage() {
  const hydrated = useInitGame();
  const game = useGameStore((s) => s.game);
  const applySetup = useGameStore((s) => s.applySetup);
  const loadDemo = useGameStore((s) => s.loadDemo);
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [eventName, setEventName] = useState("Bingo Dieciochero 2026");
  const [rounds, setRounds] = useState<BingoRound[]>(() =>
    DEMO_ROUNDS.map((r) => ({ ...r, id: `${r.id}-${Math.random().toString(36).slice(2, 6)}` })),
  );
  const [settings, setSettings] = useState<GameSettings>({ ...DEFAULT_SETTINGS });

  useEffect(() => {
    if (hydrated && game.setupCompleted) {
      setEventName(game.eventName);
      setRounds(game.rounds.map((r) => ({ ...r })));
      setSettings({ ...game.settings });
    }
    // Solo al hidratar: no queremos pisar lo que el usuario está editando.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const finish = () => {
    applySetup({ eventName: eventName.trim() || "Bingo Dieciochero", rounds, settings });
    setStep(3);
  };

  return (
    <div className="textura-papel min-h-dvh bg-crema pb-10">
      <Banderines className="text-azul" />

      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        <header className="mb-5 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-rojo">
            Configuración inicial
          </p>
          <h1 className="font-display text-4xl font-black text-azul">
            Preparemos el bingo
          </h1>
        </header>

        <ol className="mb-6 flex items-center justify-center gap-2">
          {STEPS.map((label, index) => (
            <li key={label} className="flex items-center gap-2">
              <span
                className={`flex h-8 items-center gap-2 rounded-full px-3 text-xs font-bold uppercase tracking-[0.1em] ${
                  index === step
                    ? "bg-azul text-papel"
                    : index < step
                      ? "bg-verde/20 text-verde"
                      : "bg-azul/10 text-azul/50"
                }`}
              >
                {index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}
                {label}
              </span>
              {index < STEPS.length - 1 && (
                <span className="h-px w-4 bg-azul/20" aria-hidden />
              )}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <Card>
            <CardHeader title="Paso 1 · Nombre del bingo" />
            <CardBody className="flex flex-col gap-4">
              <div>
                <Label htmlFor="nombre">¿Cómo se llama el evento?</Label>
                <Input
                  id="nombre"
                  autoFocus
                  value={eventName}
                  maxLength={50}
                  onChange={(event) => setEventName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") setStep(1);
                  }}
                  className="h-14 text-2xl font-bold"
                />
                <p className="mt-1 text-xs text-noche/55">
                  Aparecerá en grande en la pantalla del proyector.
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardHeader
              title="Paso 2 · Rondas y premios"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRounds(DEMO_ROUNDS.map((r) => ({ ...r })))}
                >
                  Usar rondas de ejemplo
                </Button>
              }
            />
            <CardBody className="flex flex-col gap-3">
              {rounds.map((round, index) => (
                <RoundEditor
                  key={round.id}
                  round={round}
                  index={index}
                  total={rounds.length}
                  customPatterns={game.customPatterns}
                  freeCenter={settings.freeCenter}
                  onChange={(updated) =>
                    setRounds((current) =>
                      current.map((r) => (r.id === updated.id ? updated : r)),
                    )
                  }
                  onRemove={
                    rounds.length > 1
                      ? () =>
                          setRounds((current) => current.filter((r) => r.id !== round.id))
                      : undefined
                  }
                  onMove={(direction) =>
                    setRounds((current) => {
                      const target = index + direction;
                      if (target < 0 || target >= current.length) return current;
                      const copy = [...current];
                      [copy[index], copy[target]] = [copy[target], copy[index]];
                      return copy;
                    })
                  }
                />
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  setRounds((current) => [
                    ...current,
                    createRound({
                      name: `Ronda ${current.length + 1}`,
                      prize: "Premio",
                    }),
                  ])
                }
              >
                <Plus className="h-4 w-4" /> Agregar ronda
              </Button>
            </CardBody>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader title="Paso 3 · Configuración" />
            <CardBody className="flex flex-col gap-5">
              <OptionRow<RevealDuration>
                label="Duración del número en pantalla"
                value={settings.revealDuration}
                onChange={(value) => setSettings((s) => ({ ...s, revealDuration: value }))}
                options={[
                  { label: "3 segundos", value: 3 },
                  { label: "5 segundos", value: 5 },
                  { label: "8 segundos", value: 8 },
                  { label: "Manual", value: "manual" },
                ]}
              />
              <OptionRow<number | null>
                label="Repaso automático cada"
                value={settings.autoReviewEvery}
                onChange={(value) =>
                  setSettings((s) => ({ ...s, autoReviewEvery: value }))
                }
                options={[
                  { label: "Nunca", value: null },
                  { label: "5 números", value: 5 },
                  { label: "10 números", value: 10 },
                  { label: "15 números", value: 15 },
                ]}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Toggle
                  label="Centro libre"
                  description="La casilla central cuenta como marcada."
                  checked={settings.freeCenter}
                  onChange={(value) => setSettings((s) => ({ ...s, freeCenter: value }))}
                />
                <Toggle
                  label="Sonidos"
                  description="Efectos suaves en el proyector."
                  checked={settings.soundsEnabled}
                  onChange={(value) =>
                    setSettings((s) => ({ ...s, soundsEnabled: value }))
                  }
                />
                <Toggle
                  label="Modo animador"
                  description="Frases cortas junto al número."
                  checked={settings.hostMode}
                  onChange={(value) => setSettings((s) => ({ ...s, hostMode: value }))}
                />
              </div>
            </CardBody>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader title="Paso 4 · Todo listo" />
            <CardBody className="flex flex-col items-center gap-5 py-8 text-center">
              <Sparkles className="h-12 w-12 text-dorado" aria-hidden />
              <div>
                <h2 className="font-display text-3xl font-black text-azul">
                  {eventName}
                </h2>
                <p className="text-sm text-noche/65">
                  {rounds.length} rondas configuradas. El primer premio es{" "}
                  <strong>{rounds[0]?.prize}</strong>.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button size="lg" onClick={() => router.push("/control")}>
                  Abrir panel <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => window.open("/display", "bingo-display", "noopener")}
                >
                  <Tv className="h-5 w-5" /> Abrir proyector
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {step < 3 && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => (step === 0 ? router.push("/") : setStep(step - 1))}
            >
              <ArrowLeft className="h-4 w-4" /> {step === 0 ? "Volver al inicio" : "Atrás"}
            </Button>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  loadDemo();
                  router.push("/control");
                }}
              >
                Saltar configuración (usar demo)
              </Button>
              {step < 2 ? (
                <Button size="lg" onClick={() => setStep(step + 1)}>
                  Continuar <ArrowRight className="h-5 w-5" />
                </Button>
              ) : (
                <Button size="lg" variant="rojo" onClick={finish}>
                  <Check className="h-5 w-5" /> Guardar y terminar
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
      <ConfirmHost />
    </div>
  );
}
