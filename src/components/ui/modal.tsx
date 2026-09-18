"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

let openCount = 0;

export function anyModalOpen(): boolean {
  return openCount > 0;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    openCount++;
    document.body.dataset.modalOpen = "true";
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey, true);
    const focusTarget = ref.current?.querySelector<HTMLElement>(
      "[data-autofocus], input, select, textarea, button",
    );
    focusTarget?.focus();
    return () => {
      openCount = Math.max(0, openCount - 1);
      if (openCount === 0) delete document.body.dataset.modalOpen;
      document.removeEventListener("keydown", onKey, true);
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  } as const;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-noche/60 p-4 backdrop-blur-[2px] sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "my-auto w-full rounded-2xl border border-azul/20 bg-papel shadow-2xl",
          widths[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-azul/12 px-5 py-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-azul">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-noche/65">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-noche/50 transition-colors hover:bg-azul/10 hover:text-azul"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children && <div className="px-5 py-4">{children}</div>}
        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-azul/12 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
