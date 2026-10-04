import type { InputHTMLAttributes } from "react";
export function Radio(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) { return <input type="radio" className="size-4 accent-[var(--primary)]" {...props}/>; }
