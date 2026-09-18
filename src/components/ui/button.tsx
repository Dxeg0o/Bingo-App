"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-45 active:translate-y-px select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-azul text-papel shadow-[0_2px_0_0_#0a1c2e] hover:bg-azul-claro",
        rojo: "bg-rojo text-papel shadow-[0_2px_0_0_#8e1c1c] hover:bg-rojo-claro",
        dorado:
          "bg-dorado text-noche shadow-[0_2px_0_0_#a97b26] hover:brightness-105",
        outline:
          "border-2 border-azul/35 bg-papel text-azul hover:bg-crema hover:border-azul/60",
        ghost: "text-azul hover:bg-azul/10",
        danger:
          "border-2 border-rojo/40 bg-papel text-rojo hover:bg-rojo hover:text-papel",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-base",
        lg: "h-14 px-6 text-lg",
        xl: "h-16 px-8 text-xl",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
