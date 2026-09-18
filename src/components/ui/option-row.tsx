"use client";

import { Label } from "./field";
import { cn } from "@/lib/utils";

export function OptionRow<T extends string | number | null>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-colors",
              option.value === value
                ? "border-azul bg-azul text-papel"
                : "border-azul/20 bg-papel text-noche/70 hover:border-azul/50",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
