"use client";

import { FormEvent, useState } from "react";
import { Loader2, Send } from "lucide-react";

export function ContactForm() {
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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      const payload = await response.json();
      setMessage(payload.message ?? (response.ok ? "Message sent." : "Message could not be sent."));
      setOk(response.ok);
      if (response.ok) form.reset();
    } catch {
      setMessage("Message could not be sent. Please try again.");
      setOk(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="ps-contact-form" aria-describedby={message ? "contact-form-status" : undefined}>
      <div className="hidden" aria-hidden="true">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div className="ps-contact-form-row">
        <label><span>Name</span><input name="name" required autoComplete="name" placeholder="Your name" /></label>
        <label><span>Email</span><input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label>
      </div>

      <div className="ps-contact-form-row">
        <label><span>Topic</span><select name="topic" defaultValue="General Question">{["General Question", "Technical Support", "Content Suggestion", "Partnership", "Advertising", "Sponsorship", "Press & Media", "Other"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Subject</span><input name="subject" required placeholder="How can we help?" /></label>
      </div>

      <label><span>Message</span><textarea name="message" required rows={8} placeholder="Tell us a little more..." /></label>

      <button type="submit" disabled={busy} aria-label="Send contact message" className="ps-button ps-button-primary ps-contact-submit">
        {busy ? <><Loader2 size={17} className="animate-spin" /> Sending…</> : <>Send Message <Send size={16} /></>}
      </button>

      {message ? <p id="contact-form-status" role={ok ? "status" : "alert"} aria-live={ok ? "polite" : "assertive"} className={ok ? "ps-contact-response is-success" : "ps-contact-response is-error"}>{message}</p> : null}
      <p className="ps-contact-privacy">Please don’t include passwords, API keys, payment details or other sensitive credentials.</p>
    </form>
  );
}
