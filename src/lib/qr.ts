"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

/** QR como data URL, generado en el navegador. `null` mientras no haya URL válida. */
export function useQrDataUrl(url: string, width = 512): string | null {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setData(null);
      return;
    }
    let vigente = true;
    QRCode.toDataURL(url, {
      margin: 1,
      width,
      errorCorrectionLevel: "M",
      color: { dark: "#102a43", light: "#fffdf8" },
    })
      .then((value) => {
        if (vigente) setData(value);
      })
      .catch(() => {
        if (vigente) setData(null);
      });
    return () => {
      vigente = false;
    };
  }, [url, width]);

  return data;
}
