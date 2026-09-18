"use client";

import { Copy, ExternalLink, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useGameStore } from "@/lib/store";

const BASE_URL_KEY = "bingo-dieciochero:carton-base-url:v1";

function isLocalHost(host: string): boolean {
  return /^(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(host);
}

/**
 * QR para que el público abra su cartón en el celular. Ojo con la dirección:
 * "localhost" solo funciona en este computador, así que si la app corre en la
 * misma máquina hay que escribir la IP de la red (192.168.x.x) para que los
 * teléfonos de la sala puedan entrar.
 */
export function CardQRPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const freeCenter = useGameStore((s) => s.game.settings.freeCenter);
  const [base, setBase] = useState("");
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    if (!open || base) return;
    const saved = window.localStorage.getItem(BASE_URL_KEY);
    setBase(saved || window.location.origin);
  }, [open, base]);

  const clean = base.trim().replace(/\/+$/, "");
  const url = clean ? `${clean}/carton${freeCenter ? "" : "?libre=0"}` : "";

  useEffect(() => {
    if (!open || !url) {
      setQr(null);
      return;
    }
    let vigente = true;
    QRCode.toDataURL(url, {
      margin: 1,
      width: 512,
      errorCorrectionLevel: "M",
      color: { dark: "#102a43", light: "#fffdf8" },
    })
      .then((data) => {
        if (vigente) setQr(data);
      })
      .catch(() => {
        if (vigente) setQr(null);
      });
    return () => {
      vigente = false;
    };
  }, [open, url]);

  let host = "";
  try {
    host = clean ? new URL(clean).host : "";
  } catch {
    host = "";
  }
  const direccionInvalida = clean.length > 0 && host === "";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cartones en el celular"
      description="El público escanea el QR y recibe un cartón aleatorio que marca a mano en su teléfono."
      size="md"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard
                ?.writeText(url)
                .then(() => toast.success("Enlace copiado"))
                .catch(() => toast.error("No se pudo copiar el enlace"));
            }}
            disabled={!url}
          >
            <Copy className="h-4 w-4" /> Copiar enlace
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(url, "_blank", "noopener")}
            disabled={!url}
          >
            <ExternalLink className="h-4 w-4" /> Probar cartón
          </Button>
          <Button onClick={onClose}>Listo</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-center">
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL generado en el navegador
            <img
              src={qr}
              alt={`Código QR hacia ${url}`}
              className="h-56 w-56 rounded-2xl border-4 border-azul/15 bg-papel p-2"
            />
          ) : (
            <div className="flex h-56 w-56 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-azul/25 text-sm text-noche/45">
              <QrCode className="h-8 w-8" />
              {direccionInvalida ? "Dirección inválida" : "Escribe la dirección"}
            </div>
          )}
        </div>

        <p className="break-all rounded-xl bg-crema/60 px-3 py-2 text-center text-sm font-semibold text-azul">
          {url || "—"}
        </p>

        <div>
          <Label htmlFor="carton-base">Dirección de la app en la red</Label>
          <Input
            id="carton-base"
            value={base}
            onChange={(event) => {
              setBase(event.target.value);
              window.localStorage.setItem(BASE_URL_KEY, event.target.value);
            }}
            placeholder="http://192.168.1.10:3000"
            inputMode="url"
            spellCheck={false}
          />
          {isLocalHost(host) && (
            <p className="mt-2 rounded-xl border-2 border-dorado/50 bg-dorado/15 px-3 py-2 text-sm text-noche/80">
              Los celulares no pueden abrir <strong>localhost</strong>: es este mismo
              computador. Escribe la IP de tu red wifi (por ejemplo{" "}
              <span className="num">http://192.168.1.10:3000</span>) o la dirección
              pública donde esté publicada la app.
            </p>
          )}
        </div>

        <ul className="flex flex-col gap-1 text-sm text-noche/60">
          <li>· Cada celular sortea su propio cartón y puede cambiarlo cuando quiera.</li>
          <li>· Las marcas son manuales y quedan guardadas en ese teléfono.</li>
          <li>
            · El centro libre sigue la configuración de la partida:{" "}
            <strong>{freeCenter ? "activado" : "desactivado"}</strong>.
          </li>
        </ul>
      </div>
    </Modal>
  );
}
