"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-xl border-2 border-azul/20 bg-papel px-3 text-base text-noche placeholder:text-noche/35 transition-colors focus:border-azul focus:outline-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-11 w-full appearance-none rounded-xl border-2 border-azul/20 bg-papel px-3 text-base text-noche transition-colors focus:border-azul focus:outline-none",
      className,
    )}
    {...props}
  />
));
Select.displayName = "Select";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "mb-1 block text-xs font-bold uppercase tracking-[0.1em] text-azul/70",
        className,
      )}
      {...props}
    />
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  id,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
  id?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-azul/15 bg-crema/40 px-3 py-2.5">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-noche">{label}</span>
        {description && (
          <span className="block text-xs text-noche/60">{description}</span>
        )}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-13 shrink-0 rounded-full border-2 transition-colors",
          checked ? "border-verde bg-verde" : "border-azul/25 bg-papel",
        )}
        style={{ width: "3.25rem" }}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-papel shadow transition-all",
            checked ? "left-[1.75rem] bg-papel" : "left-0.5 bg-azul/40",
          )}
        />
        <span className="sr-only">{checked ? "Activado" : "Desactivado"}</span>
      </button>
    </div>
  );
}
