"use client";

import { Modal } from "@/components/ui/modal";

const SHORTCUTS: [string, string][] = [
  ["Enter", "Registrar el número escrito"],
  ["Ctrl / Cmd + Z", "Deshacer el último número"],
  ["C", "Corregir el último número"],
  ["R", "Iniciar o salir del repaso"],
  ["P", "Pausar o reanudar el bingo"],
  ["F", "Pantalla completa (en el proyector)"],
  ["Escape", "Limpiar el input o cerrar una ventana"],
];

export function ShortcutsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Atajos de teclado"
      description="Pensado para operar el bingo sin soltar el teclado."
      size="sm"
    >
      <ul className="flex flex-col gap-2">
        {SHORTCUTS.map(([key, description]) => (
          <li key={key} className="flex items-center justify-between gap-4">
            <kbd className="rounded-lg border-2 border-azul/25 bg-crema px-2.5 py-1 font-mono text-sm font-bold text-azul">
              {key}
            </kbd>
            <span className="text-sm text-noche/75">{description}</span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
