"use client";
import type { ButtonHTMLAttributes } from "react";
export function Switch({ "aria-checked": checked = false, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) { const on = checked === true || checked === "true"; return <button role="switch" aria-checked={on} className={`relative h-7 w-12 rounded-full transition ${on ? "bg-[var(--primary)]" : "bg-slate-300"}`} {...props}><span className={`absolute top-1 size-5 rounded-full bg-white transition ${on ? "left-6" : "left-1"}`}/></button>; }
