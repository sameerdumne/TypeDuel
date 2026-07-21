import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-fixed-dim text-on-primary border border-primary-fixed-dim/40 hover:shadow-[0_0_20px_rgba(0,218,243,0.3)] focus-visible:outline-primary-fixed-dim",
  secondary:
    "bg-white/10 text-white border border-white/[0.12] hover:border-neon-cyan/50 hover:bg-white/[0.15] focus-visible:outline-neon-cyan",
  ghost:
    "bg-transparent text-text-muted border border-transparent hover:bg-white/10 hover:text-white focus-visible:outline-neon-cyan",
  danger:
    "bg-neon-red/10 text-neon-red border border-neon-red/40 hover:bg-neon-red/20 focus-visible:outline-neon-red"
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
        "label-caps inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs transition duration-200 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
