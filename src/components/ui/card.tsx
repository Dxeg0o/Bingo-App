import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-azul/15 bg-papel shadow-[0_1px_0_0_rgba(16,42,67,0.08),0_8px_24px_-16px_rgba(16,42,67,0.4)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  icon,
  action,
  className,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-azul/10 px-4 py-2.5",
        className,
      )}
    >
      <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-azul/70">
        {icon}
        {title}
      </h2>
      {action}
    </div>
  );
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}
