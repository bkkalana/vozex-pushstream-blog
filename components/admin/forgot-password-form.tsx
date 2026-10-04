"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage(""); const data = new FormData(event.currentTarget);
    try { await fetch("/api/auth/password-reset/request", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: data.get("email") }) }); } finally { setLoading(false); setMessage("If an account exists for that email, a reset link has been sent."); }
  }
  return <form onSubmit={submit} className="space-y-5"><FormField label="Admin email" htmlFor="email" required><Input id="email" name="email" type="email" autoComplete="email" required /></FormField>{message && <div className="rounded-xl border border-[var(--border)] bg-[var(--background-blue)] p-3 text-sm">{message}</div>}<Button className="w-full" disabled={loading}>{loading ? "Sending…" : "Send reset link"}</Button></form>;
}
