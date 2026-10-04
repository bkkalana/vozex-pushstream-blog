import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) { return <select className={cn("min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm focus:border-[var(--primary)]", className)} {...props}>{children}</select>; }
