import { cn } from "@/lib/utils";

/** Franja de ramada para las pantallas públicas; no se usa en la interfaz operativa. */
export function RamadaHeader({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none relative h-12 w-full overflow-hidden", className)}>
      <svg viewBox="0 0 1600 104" preserveAspectRatio="none" className="h-full w-full">
        <path d="M-20 19 C300 5 520 41 800 19 S1320 7 1620 24" fill="none" stroke="#d9a441" strokeWidth="3" opacity=".75" />
        <path d="M-20 24 C300 10 520 46 800 24 S1320 12 1620 29" fill="none" stroke="#f5e8ce" strokeWidth="1" opacity=".35" />
        {Array.from({ length: 31 }, (_, index) => {
          const x = index * 54 - 10;
          const color = ["#c62828", "#fffdf8", "#173f73"][index % 3];
          const y = 20 + (index % 4) * 3;
          return <path key={index} d={`M${x} ${y} h42 l-21 42 Z`} fill={color} opacity=".96" />;
        })}
        <path d="M0 0 C170 23 280 4 430 13 S690 4 835 12 S1110 2 1270 13 S1460 2 1600 12 V0Z" fill="#41644a" opacity=".92" />
        <g transform="translate(34 6)">
          <rect width="42" height="25" fill="#fffdf8" />
          <rect width="14" height="13" fill="#173f73" />
          <path d="M7 3.3l1.3 3.7h3.9L9 9.2l1.3 3.7L7 10.7 3.7 13l1.3-3.8L1.7 7h3.9Z" fill="#fffdf8" />
          <rect y="13" width="42" height="12" fill="#c62828" />
        </g>
      </svg>
    </div>
  );
}
