"use client";

import type { ButtonHTMLAttributes } from "react";

type BaseSwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "aria-labelledby">;
type NamedSwitchProps =
  | (BaseSwitchProps & { "aria-label": string; "aria-labelledby"?: never })
  | (BaseSwitchProps & { "aria-labelledby": string; "aria-label"?: never });

export function Switch({ "aria-checked": checked = false, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, ...props }: NamedSwitchProps) {
  const on = checked === true || checked === "true";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={`relative h-7 w-12 rounded-full transition ${on ? "bg-[var(--primary)]" : "bg-slate-300"}`}
      {...props}
    >
      <span
        aria-hidden="true"
        className={`absolute top-1 size-5 rounded-full bg-white transition ${on ? "left-6" : "left-1"}`}
      />
    </button>
  );
}
