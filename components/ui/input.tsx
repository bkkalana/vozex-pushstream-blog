import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) { return <input ref={ref} className={cn("min-h-12 w-full rounded-md border border-[var(--border)] bg-white px-3.5 text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--primary)]", className)} {...props}/>; });
