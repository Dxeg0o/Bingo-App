"use client";

import { RotateCcw, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { playSound, unlockAudio } from "@/lib/sounds";
import { useGameStore } from "@/lib/store";
import type { RevealDuration, ReviewOrder } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { confirmAction } from "@/components/ui/confirm";
import { Label, Toggle } from "@/components/ui/field";
import { OptionRow } from "@/components/ui/option-row";
import { Modal } from "@/components/ui/modal";

export function SettingsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const settings = useGameStore((s) => s.game.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const resetSettings = useGameStore((s) => s.resetSettings);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Configuración"
      description="Ajustes del juego. Se guardan automáticamente."
      size="lg"
      footer={
        <>
          <Button
            variant="danger"
            onClick={async () => {
              const ok = await confirmAction({
                title: "Restablecer configuración",
                message:
                  "Volverán los valores por defecto. Los números sorteados y las rondas no se tocan.",
                confirmLabel: "Restablecer",
                tone: "danger",
              });
              if (ok) {
                resetSettings();
                toast.success("Configuración restablecida");
              }
            }}
          >
            <RotateCcw className="h-4 w-4" /> Restablecer configuración
          </Button>
          <Button onClick={onClose}>Listo</Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <OptionRow<RevealDuration>
          label="Duración del número en pantalla"
          value={settings.revealDuration}
          onChange={(value) => updateSettings({ revealDuration: value })}
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
          onChange={(value) => updateSettings({ autoReviewEvery: value })}
          options={[
            { label: "Nunca", value: null },
            { label: "5 números", value: 5 },
            { label: "10 números", value: 10 },
            { label: "15 números", value: 15 },
          ]}
        />

        <OptionRow<ReviewOrder>
          label="Orden del repaso"
          value={settings.reviewOrder}
          onChange={(value) => updateSettings({ reviewOrder: value })}
          options={[
            { label: "Orden de sorteo", value: "draw" },
            { label: "Orden numérico", value: "numeric" },
          ]}
        />

        <OptionRow<number>
          label="Duración del repaso"
          value={settings.reviewDuration}
          onChange={(value) => updateSettings({ reviewDuration: value })}
          options={[
            { label: "5 segundos", value: 5 },
            { label: "8 segundos", value: 8 },
            { label: "10 segundos", value: 10 },
          ]}
        />

        <OptionRow<number | null>
          label="Cuenta regresiva antes de empezar"
          value={settings.countdownSeconds}
          onChange={(value) => updateSettings({ countdownSeconds: value })}
          options={[
            { label: "Desactivada", value: null },
            { label: "30 segundos", value: 30 },
            { label: "1 minuto", value: 60 },
            { label: "2 minutos", value: 120 },
          ]}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle
            label="Centro libre"
            description="La casilla central del cartón cuenta como marcada."
            checked={settings.freeCenter}
            onChange={(value) => updateSettings({ freeCenter: value })}
          />
          <Toggle
            label="Modo animador"
            description="Frases cortas junto al número en el proyector."
            checked={settings.hostMode}
            onChange={(value) => updateSettings({ hostMode: value })}
          />
          <Toggle
            label="Sonidos"
            description="Suenan en la pantalla del proyector."
            checked={settings.soundsEnabled}
            onChange={(value) => {
              unlockAudio();
              updateSettings({ soundsEnabled: value });
              if (value) playSound("number", settings.volume);
            }}
          />
          <div className="rounded-xl border border-azul/15 bg-crema/40 px-3 py-2.5">
            <Label htmlFor="volume">Volumen</Label>
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-azul/60" aria-hidden />
              <input
                id="volume"
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={settings.volume}
                onChange={(event) =>
                  updateSettings({ volume: Number(event.target.value) })
                }
                className="w-full accent-azul"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  unlockAudio();
                  playSound("number", settings.volume);
                }}
              >
                Probar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
