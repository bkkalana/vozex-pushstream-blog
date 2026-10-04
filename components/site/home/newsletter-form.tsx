"use client";

import { FormEvent, useState } from "react";

const interests = [["ai-tools", "AI Tools"], ["wordpress", "WordPress"], ["development", "Development"], ["online-business", "Online Business"]] as const;

export function NewsletterForm({ source = "homepage", compact = false }: { source?: "homepage" | "article" | "ai-tools" | "footer" | "website"; compact?: boolean }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setOk(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const segmentSlugs = interests.filter(([slug]) => data.get(`segment-${slug}`) === "on").map(([slug]) => slug);
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), source, segmentSlugs }),
      });
      const body = await response.json();
      setMessage(body.message ?? (response.ok ? "Subscribed." : "Unable to subscribe."));
      setOk(response.ok);
      if (response.ok) form.reset();
    } catch {
      setMessage("Unable to subscribe right now.");
      setOk(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className={compact ? "mt-4" : "w-full"} aria-describedby={message ? `newsletter-status-${source}` : undefined}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`newsletter-email-${source}`}>Email address</label>
        <input id={`newsletter-email-${source}`} name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="min-h-12 flex-1 rounded-md border border-white/15 bg-white px-4 text-[var(--foreground)] shadow-sm placeholder:text-[var(--text-muted)]" />
        <button disabled={busy} aria-label="Subscribe to newsletter" className="min-h-12 rounded-md bg-[var(--primary)] px-6 font-extrabold text-white shadow-sm transition hover:bg-[var(--primary-hover)] disabled:opacity-60">{busy ? "Joining..." : "Subscribe"}</button>
      </div>
      {!compact ? (
        <fieldset className="mt-4">
          <legend className="sr-only">Newsletter interests</legend>
          <div className="flex flex-wrap gap-2 text-xs text-white/85">
            {interests.map(([slug, label]) => (
              <label key={slug} className="inline-flex min-h-8 items-center gap-2 rounded-md border border-white/20 bg-white/10 px-2.5 font-semibold">
                <input type="checkbox" name={`segment-${slug}`} className="size-3.5 accent-[var(--primary)]" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
      {message ? <p id={`newsletter-status-${source}`} className="mt-3 text-sm text-white/85" role={ok === false ? "alert" : "status"} aria-live={ok === false ? "assertive" : "polite"}>{message}</p> : null}
    </form>
  );
}
