import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; children: ReactNode };

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]",
    secondary: "border border-[var(--primary)] bg-white text-[var(--primary)] hover:bg-[var(--background-blue)]",
    ghost: "bg-transparent text-[var(--foreground)] hover:bg-[var(--background-soft)]",
    danger: "bg-[var(--error)] text-white hover:opacity-90",
  };
  return <button className={cn("inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50", variants[variant], className)} {...props}>{children}</button>;
}
