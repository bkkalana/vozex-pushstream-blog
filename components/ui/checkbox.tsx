import type { InputHTMLAttributes } from "react";
export function Checkbox(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) { return <input type="checkbox" className="size-4 accent-[var(--primary)]" {...props}/>; }
