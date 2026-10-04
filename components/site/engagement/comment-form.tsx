"use client";

import { FormEvent, useState } from "react";

export function CommentForm({ postId }: { postId: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setOk(null);
    try {
      const form = event.currentTarget;
      const data = new FormData(form);
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(data), postId }),
      });
      const payload = await response.json();
      setMessage(payload.message ?? (response.ok ? "Comment submitted." : "Comment could not be submitted."));
      setOk(response.ok);
      if (response.ok) form.reset();
    } catch {
      setMessage("Comment could not be submitted. Please try again.");
      setOk(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-3 rounded-2xl border p-5" aria-describedby={message ? "comment-form-status" : undefined}>
      <div className="hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5"><span className="text-sm font-bold">Name</span><input name="name" required autoComplete="name" className="min-h-12 rounded-xl border px-3" /></label>
        <label className="grid gap-1.5"><span className="text-sm font-bold">Email</span><input name="email" type="email" required autoComplete="email" className="min-h-12 rounded-xl border px-3" /></label>
      </div>
      <label className="grid gap-1.5"><span className="text-sm font-bold">Website <span className="font-normal text-[var(--text-secondary)]">(optional)</span></span><input name="websiteUrl" type="url" autoComplete="url" className="min-h-12 rounded-xl border px-3" /></label>
      <label className="grid gap-1.5"><span className="text-sm font-bold">Comment</span><textarea name="content" required rows={5} className="rounded-xl border p-3" /></label>
      <button disabled={busy} aria-label="Submit comment" className="min-h-12 rounded-xl bg-[var(--primary)] px-4 font-bold text-white disabled:opacity-60">{busy ? "Submitting…" : "Submit Comment"}</button>
      {message ? <p id="comment-form-status" role={ok === false ? "alert" : "status"} aria-live={ok === false ? "assertive" : "polite"} className="text-sm text-[var(--text-secondary)]">{message}</p> : null}
    </form>
  );
}
