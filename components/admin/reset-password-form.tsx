"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export function ResetPasswordForm({ token }: { token: string }) {
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const [done, setDone] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true); const data = new FormData(event.currentTarget); const password = String(data.get("password") || ""); const confirm = String(data.get("confirm") || "");
    if (password !== confirm) { setError("Passwords do not match."); setLoading(false); return; }
    try { const response = await fetch("/api/auth/password-reset/confirm", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, password }) }); const payload = await response.json() as { error?: { message?: string } }; if (!response.ok) { setError(payload.error?.message || "Unable to reset password."); return; } setDone(true); } catch { setError("Unable to connect. Please try again."); } finally { setLoading(false); }
  }
  if (done) return <div className="space-y-4"><div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm">Password updated successfully. All previous admin sessions were revoked.</div><Button className="w-full" onClick={() => { window.location.href = "/admin/login"; }}>Return to sign in</Button></div>;
  return <form onSubmit={submit} className="space-y-5"><FormField label="New password" htmlFor="password" hint="Use at least 12 characters." required><Input id="password" name="password" type="password" minLength={12} autoComplete="new-password" required /></FormField><FormField label="Confirm password" htmlFor="confirm" required><Input id="confirm" name="confirm" type="password" minLength={12} autoComplete="new-password" required /></FormField>{error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-[var(--error)]">{error}</div>}<Button className="w-full" disabled={loading}>{loading ? "Updating…" : "Update password"}</Button></form>;
}
