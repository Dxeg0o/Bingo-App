"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      duration={2600}
      toastOptions={{ style: { fontWeight: 600, fontSize: "1rem" } }}
    />
  );
}
