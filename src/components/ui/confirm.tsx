"use client";

import { create } from "zustand";
import { Button } from "./button";
import { Modal } from "./modal";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "normal" | "danger";
};

type ConfirmStore = {
  request: (ConfirmOptions & { resolve: (value: boolean) => void }) | null;
  open: (options: ConfirmOptions) => Promise<boolean>;
  close: (value: boolean) => void;
};

const useConfirmStore = create<ConfirmStore>()((set, get) => ({
  request: null,
  open: (options) =>
    new Promise<boolean>((resolve) => {
      set({ request: { ...options, resolve } });
    }),
  close: (value) => {
    get().request?.resolve(value);
    set({ request: null });
  },
}));

/** Confirmación imperativa: `if (await confirmAction({...})) { ... }` */
export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  return useConfirmStore.getState().open(options);
}

export function ConfirmHost() {
  const request = useConfirmStore((s) => s.request);
  const close = useConfirmStore((s) => s.close);

  return (
    <Modal
      open={Boolean(request)}
      onClose={() => close(false)}
      title={request?.title ?? ""}
      description={request?.message}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={() => close(false)}>
            {request?.cancelLabel ?? "Cancelar"}
          </Button>
          <Button
            variant={request?.tone === "danger" ? "rojo" : "primary"}
            onClick={() => close(true)}
            data-autofocus
          >
            {request?.confirmLabel ?? "Confirmar"}
          </Button>
        </>
      }
    />
  );
}
