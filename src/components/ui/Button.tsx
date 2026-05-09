import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-cyan-300/40 bg-cyan-300 text-slate-950 shadow-glow hover:bg-white focus-visible:outline-cyan-200",
  secondary:
    "border-white/[0.12] bg-white/10 text-white hover:border-cyan-300/50 hover:bg-white/[0.15] focus-visible:outline-cyan-300",
  ghost:
    "border-transparent bg-transparent text-slate-300 hover:bg-white/10 hover:text-white focus-visible:outline-cyan-300",
  danger:
    "border-red-300/40 bg-red-400/[0.16] text-red-100 hover:bg-red-400/[0.24] focus-visible:outline-red-300"
};

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
}) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-bold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
