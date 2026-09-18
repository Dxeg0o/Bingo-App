"use client";

import { Smartphone, X } from "lucide-react";
import { buildCardUrl, loadCardBaseUrl } from "@/lib/card";
import { useQrDataUrl } from "@/lib/qr";

/**
 * El QR en grande sobre la proyección, para que la sala entera lo escanee sin
 * levantarse. La dirección es la que el operador dejó guardada en el panel del
 * QR; si nunca la tocó, se usa la de esta misma ventana.
 */
export function CardQRScreen({
  freeCenter,
  onClose,
}: {
  freeCenter: boolean;
  onClose: () => void;
}) {
  const url = buildCardUrl(loadCardBaseUrl(), freeCenter);
  const qr = useQrDataUrl(url, 900);

  return (
    <div className="textura-noche fixed inset-0 z-30 animate-[aparecer_0.25s_ease-out] text-crema">
      <div className="escena">
        <p className="escena-rotulo">Juega desde tu celular</p>
        <h2 className="escena-titulo text-dorado">Escanea y juega</h2>

        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL generado en el navegador
          <img
            src={qr}
            alt={`Código QR hacia ${url}`}
            className="h-[46vh] w-[46vh] rounded-[1.5rem] border-[0.6vh] border-dorado bg-papel p-[1.2vh]"
          />
        ) : (
          <div className="flex h-[46vh] w-[46vh] items-center justify-center rounded-[1.5rem] border-[0.4vh] border-dashed border-crema/30 px-6 text-center escena-nota">
            Falta configurar la dirección de la app en el panel del operador.
          </div>
        )}

        {url && <p className="escena-dato break-all text-crema">{url}</p>}

        <p className="escena-nota flex items-center gap-3">
          <Smartphone className="h-[3vh] w-[3vh] text-dorado" aria-hidden />
          Recibes un cartón al azar y marcas tú los números que vayan saliendo
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar el QR"
        className="fixed right-3 top-3 z-10 rounded-xl border border-crema/25 bg-noche/70 p-2 text-crema/60 opacity-40 transition-opacity hover:opacity-100 focus-visible:opacity-100"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
