import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={cn("min-h-28 w-full resize-y rounded-xl border border-[var(--border)] bg-white px-3.5 py-3 text-sm focus:border-[var(--primary)]", className)} {...props}/>; }
